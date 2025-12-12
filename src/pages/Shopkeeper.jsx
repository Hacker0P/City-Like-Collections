import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Trash2, Save, Package, Image as ImageIcon, Edit2, X, Camera, RefreshCcw, Power } from 'lucide-react';
import { supabase } from '../supabaseClient';

// Helper to resize/compress base64 image before upload to avoid massive files
const resizeImage = (base64) => {
  return new Promise((resolve) => {
    let img = new Image();
    img.src = base64;
    img.onload = () => {
      let canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      let max_size = 1000; // Resize to max 1000px

      if (width > height) {
        if (width > max_size) {
          height *= max_size / width;
          width = max_size;
        }
      } else {
        if (height > max_size) {
          width *= max_size / height;
          height = max_size;
        }
      }
      canvas.width = width;
      canvas.height = height;
      let ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8)); // Compress JPEG
    };
  });
};

const Shopkeeper = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [storeStatus, setStoreStatus] = useState(true); // Default open
  
  const cameraInputRef = useRef(null);

  // Fetch Store Settings
  const fetchStoreSettings = async () => {
    const { data, error } = await supabase
      .from('store_settings')
      .select('is_open')
      .eq('id', 1)
      .single();
    if (data) setStoreStatus(data.is_open);
  };

  const toggleStoreStatus = async () => {
    const newStatus = !storeStatus;
    // Optimistic update
    setStoreStatus(newStatus); 
    
    // Use upsert to create the row if it doesn't exist
    const { error } = await supabase
      .from('store_settings')
      .upsert({ id: 1, is_open: newStatus, updated_at: new Date() })
      .select();
    
    if (error) {
       console.error("Error toggling shop:", error);
       setStoreStatus(!newStatus); // Revert on error
       alert(`Failed to update shop status. Error: ${error.message || error.details || JSON.stringify(error)}`);
    }
  };

  useEffect(() => {
    fetchStoreSettings();
    
    // Subscribe to settings changes
    const settingsChannel = supabase
      .channel('public:store_settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_settings', filter: 'id=eq.1' }, (payload) => {
          setStoreStatus(payload.new.is_open);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
           console.log("Connected to Realtime!");
        }
        if (status === 'CHANNEL_ERROR') {
           alert("Realtime Connection Failed! Please Enable Realtime for 'store_settings' in Supabase Dashboard.");
        }
        if (status === 'TIMED_OUT') {
           alert("Realtime Connection Timed Out!");
        }
      });

    return () => {
      supabase.removeChannel(settingsChannel);
    };
  }, []);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    quantity: '',
    category: '',
    sizes: '',
    colors: '',
    images: [] // Array of Objects { url: '...', path: '...' } or Strings for preview
  });

  // Fetch Products from Supabase
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    // Realtime subscription
    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
          fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 4) {
      alert(t('shop_alertMaxImages'));
      return;
    }

    // Process files locally for preview
    files.forEach(file => {
      // Basic client-side size check (e.g. 10MB limit hardstop)
      if (file.size > 10 * 1024 * 1024) { 
        alert(t('shop_alertFileTooLarge'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { preview: reader.result, file: file, isNew: true }] // Store raw file object for Supabase upload
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    
    setUploading(true);
    
    try {
      // Upload new images to Supabase Storage
      let finalImages = [];
      
      for (const img of formData.images) {
        if (img.isNew) {
           const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
           const { data, error } = await supabase.storage
              .from('product-images')
              .upload(fileName, img.file);

           if (error) throw error;
           
           // Get Public URL
           const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName);
              
           finalImages.push(publicUrl);
        } else {
           finalImages.push(img);
        }
      }

      const productData = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        quantity: formData.quantity || '',
        category: formData.category || '',
        sizes: formData.sizes || '',
        colors: formData.colors || '',
        images: finalImages,
        // Supabase manages created_at automatically, but for updates:
      };

      if (editMode && editingId) {
        // Update Supabase
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);
        
        if (error) throw error;
        setEditMode(false);
        setEditingId(null);
      } else {
        // Add to Supabase
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
        if (error) throw error;
      }

      // Reset Form
      setFormData({ name: '', price: '', description: '', quantity: '', category: '', sizes: '', colors: '', images: [] });
      fetchProducts(); // Refresh list immediately
    } catch (error) {
      console.error("Error saving product: ", error);
      alert('Error saving product. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    // Migrate legacy structure just in case
    let existingImages = product.images || [];
    if (existingImages.length === 0 && product.image) existingImages = [product.image];

    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      quantity: product.quantity || '',
      category: product.category || '',
      sizes: product.sizes || '',
      colors: product.colors || '',
      images: existingImages // These are just URL strings
    });
    setEditMode(true);
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingId(null);
    setFormData({ name: '', price: '', description: '', quantity: '', category: '', sizes: '', colors: '', images: [] });
  };

  const handleDelete = async (id, productImages) => {
    if (confirm(t('shop_confirmDelete'))) {
      try {
        // 1. Delete Images from Storage first
        if (productImages && productImages.length > 0) {
            const filesToRemove = productImages.map(url => {
                // Extract filename from Supabase Public URL
                // Format: .../storage/v1/object/public/product-images/<filename>
                const parts = url.split('/product-images/');
                return parts.length > 1 ? parts[1] : null;
            }).filter(path => path !== null);

            if (filesToRemove.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('product-images')
                    .remove(filesToRemove);
                
                if (storageError) {
                    console.error("Error deleting images:", storageError);
                    // We continue to delete product even if image delete fails, 
                    // but we log it.
                }
            }
        }

        // 2. Delete Product form Database
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        fetchProducts(); // Refresh list immediately
      } catch (err) {
        console.error("Error deleting", err);
        alert("Failed to delete product");
      }
      if (editingId === id) handleCancelEdit();
    }
  };

  // Calculate Stats
  const totalValue = products.reduce((acc, curr) => acc + (Number(curr.price) * (Number(curr.quantity) || 1)), 0);

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '1400px', paddingBottom: '4rem', marginTop: '2rem' }}>
      
      {/* Header & Stats */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="heading-lg" style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('shop_title')}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t('shop_subtitle')}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {/* Store Status Card */}
            <div className="dashboard-stat" style={{ borderLeft: `4px solid ${storeStatus ? '#16a34a' : '#dc2626'}` }}>
                <div className="icon-box" style={{ background: storeStatus ? '#dcfce7' : '#fee2e2', color: storeStatus ? '#16a34a' : '#dc2626' }}>
                    <Power size={24} />
                </div>
                <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Store Status</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: storeStatus ? '#16a34a' : '#dc2626' }}>
                        {storeStatus ? 'OPEN' : 'CLOSED'}
                      </span>
                      <button 
                        onClick={toggleStoreStatus}
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '50px',
                          border: '1px solid currentColor',
                          background: 'transparent',
                          color: storeStatus ? '#dc2626' : '#16a34a',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {storeStatus ? 'Close Shop' : 'Open Shop'}
                      </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-stat">
                <div className="icon-box" style={{ background: '#e0e7ff', color: 'var(--primary)' }}>
                    <Package size={24} />
                </div>
                <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t('shop_totalProducts')}</h4>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{products.length}</span>
                </div>
            </div>

            <div className="dashboard-stat">
                <div className="icon-box" style={{ background: '#dcfce7', color: '#15803d' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹</span>
                </div>
                <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t('shop_inventoryValue')}</h4>
                    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>₹{totalValue.toLocaleString()}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="dashboard-grid">
        
        {/* Left Column: Form */}
        <div style={{ position: 'sticky', top: '100px' }}>
          
          <div className="modern-card" style={{ padding: '1.5rem', borderTop: '4px solid var(--primary)' }}>
            <h3 className="heading-md" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
              <div style={{ padding: '6px', background: 'var(--primary-light)', borderRadius: '6px', color: 'var(--primary)' }}>
                 {editMode ? <Edit2 size={18} /> : <Plus size={18} />}
              </div>
              {editMode ? t('shop_editProduct') : t('shop_addProduct')}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('shop_imagesLabel')}</label>
                    
                    {/* Camera Button */}
                    <button 
                        type="button"
                        onClick={() => cameraInputRef.current.click()}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <Camera size={16} />
                        {t('shop_takePhoto')}
                    </button>
                    {/* Hidden Camera Input */}
                    <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        ref={cameraInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                    />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {formData.images.map((img, index) => (
                    <div key={index} style={{ position: 'relative', paddingTop: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img 
                        src={typeof img === 'string' ? img : img.preview} 
                        alt={`Preview ${index}`} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <button 
                        type="button" 
                        onClick={() => removeImage(index)}
                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', padding: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                      >
                        <X size={12} color="#ef4444" />
                      </button>
                    </div>
                  ))}
                  
                  {formData.images.length < 4 && (
                      <div className="upload-zone" style={{ height: 'auto', paddingTop: '100%' }}>
                         <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={20} style={{ marginBottom: '0.25rem' }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Add</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            />
                         </div>
                      </div>
                  )}
                </div>
              </div>

              <div>
                  <label className="label-sm" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>{t('shop_name')}</label>
                  <input 
                    className="input-field" 
                    placeholder={t('shop_namePlaceholder')} 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>{t('shop_price')}</label>
                    <input 
                      className="input-field" 
                      placeholder="0.00" 
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                </div>
                <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>{t('shop_stock')}</label>
                    <input 
                      className="input-field" 
                      placeholder="0" 
                      type="number"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: e.target.value})}
                    />
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>{t('shop_category')}</label>
                <select 
                  className="input-field" 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">{t('shop_selectCategory')}</option>
                  <option value="T-Shirt">T-Shirt</option>
                  <option value="Shirt">Shirt</option>
                  <option value="Pant">Pant</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                   <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>{t('shop_sizes')}</label>
                   <input 
                     className="input-field" 
                     placeholder={t('shop_sizesPlaceholder')} 
                     value={formData.sizes}
                     onChange={e => setFormData({...formData, sizes: e.target.value})}
                   />
                </div>
                <div>
                   <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>{t('shop_colors')}</label>
                   <input 
                     className="input-field" 
                     placeholder={t('shop_colorsPlaceholder')} 
                     value={formData.colors}
                     onChange={e => setFormData({...formData, colors: e.target.value})}
                   />
                </div>
              </div>

              <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>{t('shop_description')}</label>
                  <textarea 
                    className="input-field" 
                    placeholder={t('shop_descriptionPlaceholder')} 
                    rows="3"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    style={{ resize: 'vertical' }}
                  />
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                    className="btn btn-primary" 
                    type="submit" 
                    disabled={uploading}
                    style={{ flex: 1, padding: '0.75rem', opacity: uploading ? 0.7 : 1 }}
                >
                  {uploading ? <RefreshCcw className="spin" size={18} style={{ marginRight: '0.5rem' }} /> : (editMode ? <Save size={18} style={{ marginRight: '0.5rem' }} /> : <Plus size={18} style={{ marginRight: '0.5rem' }} />)}
                  {uploading ? 'Saving...' : (editMode ? t('shop_update') : t('shop_add'))}
                </button>
                {editMode && (
                  <button className="btn btn-outline" type="button" onClick={handleCancelEdit} style={{ padding: '0.75rem' }}>
                    {t('shop_cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Inventory List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="heading-md">{t('shop_inventoryList')}</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {/* Future: Search Input */}
              </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Inventory...</div>
            ) : products.length === 0 ? (
              <div className="modern-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', borderStyle: 'dashed' }}>
                <Package size={48} style={{ marginBottom: '1rem', color: 'var(--primary-light)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('shop_noProducts')}</h3>
                <p style={{ fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>{t('shop_startAdding')}</p>
              </div>
            ) : ( products.map(product => (
              <div key={product.id} className="inventory-card">
                <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ImageIcon size={24} color="#cbd5e1" />
                  )}
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{product.name}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{product.category || 'Uncategorized'}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{product.price}</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {product.quantity && <span className="badge badge-neutral" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Stock: <span style={{ color: Number(product.quantity) < 5 ? '#dc2626' : 'inherit', fontWeight: 700 }}>{product.quantity}</span></span>}
                    {product.sizes && <span className="badge badge-neutral">Sizes: {product.sizes}</span>}
                    {product.colors && <span className="badge badge-neutral">Color: {product.colors}</span>}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                  <button 
                    onClick={() => handleEdit(product)}
                    style={{ 
                        padding: '0.5rem', 
                        borderRadius: '6px', 
                        color: 'var(--primary)', 
                        background: 'var(--primary-light)',
                        transition: '0.2s'
                    }}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id, product.images)}
                    style={{ 
                        padding: '0.5rem', 
                        borderRadius: '6px', 
                        color: '#ef4444', 
                        background: '#fee2e2',
                        transition: '0.2s'
                    }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Shopkeeper;
