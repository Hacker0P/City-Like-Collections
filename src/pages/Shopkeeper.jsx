import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Plus, Trash2, Save, Package, Image as ImageIcon, Edit2, X, Camera, RefreshCcw, Power, AlertCircle, ChevronLeft, ChevronRight, WifiOff, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Shopkeeper = () => {
  const { t } = useLanguage();
  const isOnline = useNetworkStatus();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [storeStatus, setStoreStatus] = useState(true); // Default open
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, images: [] });
  const [selectedImage, setSelectedImage] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const cameraInputRef = useRef(null);
  
  // State management functions ... (kept same logic as before)
  const fetchStoreSettings = async () => {
    const { data } = await supabase.from('store_settings').select('is_open').eq('id', 1).single();
    if (data) setStoreStatus(data.is_open);
  };
  const toggleStoreStatus = async () => {
    const newStatus = !storeStatus;
    setStoreStatus(newStatus); 
    const { error } = await supabase.from('store_settings').upsert({ id: 1, is_open: newStatus, updated_at: new Date() });
    if (error) { setStoreStatus(!newStatus); alert("Failed to update status"); }
  };
  useEffect(() => {
    fetchStoreSettings();
    const sub = supabase.channel('public:store_settings').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_settings', filter: 'id=eq.1' }, (payload) => setStoreStatus(payload.new.is_open)).subscribe();
    return () => supabase.removeChannel(sub);
  }, []);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', quantity: '', category: '', sizes: '', colors: '', images: [] });
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => {
    fetchProducts();
    const sub = supabase.channel('public:products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts()).subscribe();
    return () => supabase.removeChannel(sub);
  }, []);
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 4) return alert(t('shop_alertMaxImages'));
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) return alert(t('shop_alertFileTooLarge'));
      const reader = new FileReader();
      reader.onloadend = () => setFormData(p => ({ ...p, images: [...p.images, { preview: reader.result, file, isNew: true }] }));
      reader.readAsDataURL(file);
    });
  };
  const removeImage = (idx) => setFormData(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    setUploading(true);
    try {
      let finalImages = [];
      for (const img of formData.images) {
        if (img.isNew) {
           const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
           const { error } = await supabase.storage.from('product-images').upload(fileName, img.file);
           if (error) throw error;
           const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
           finalImages.push(publicUrl);
        } else { finalImages.push(img); }
      }
      const productData = { name: formData.name, price: formData.price, description: formData.description, quantity: formData.quantity || '', category: formData.category || '', sizes: formData.sizes || '', colors: formData.colors || '', images: finalImages };
      if (editMode && editingId) { await supabase.from('products').update(productData).eq('id', editingId); setEditMode(false); setEditingId(null); }
      else { await supabase.from('products').insert([productData]); }
      setFormData({ name: '', price: '', description: '', quantity: '', category: '', sizes: '', colors: '', images: [] });
      fetchProducts();
      setToast({ message: editMode ? 'Product updated successfully!' : 'Product added to inventory!', type: 'success' });
    } catch (e) { 
        console.error(e); 
        setToast({ message: 'Error saving product', type: 'error' });
    } finally { setUploading(false); }
  };
  const handleEdit = (p) => {
    let imgs = p.images || []; if (imgs.length === 0 && p.image) imgs = [p.image];
    setFormData({ name: p.name, price: p.price, description: p.description, quantity: p.quantity || '', category: p.category || '', sizes: p.sizes || '', colors: p.colors || '', images: imgs });
    setEditMode(true); setEditingId(p.id); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleDelete = (id, imgs) => {
    setDeleteModal({ show: true, id, images: imgs });
  };
  
  const confirmDelete = async () => {
    const { id, images } = deleteModal;
    // Optimistic close
    setDeleteModal({ show: false, id: null, images: [] });
    
    try {
        await supabase.from('products').delete().eq('id', id);
        // Note: Image deletion from storage skipped for now as per original logic, but should be implemented in production
        fetchProducts();
        if (editingId === id) {
            setEditMode(false); 
            setEditingId(null); 
            setFormData({ name: '', price: '', description: '', quantity: '', category: '', sizes: '', colors: '', images: [] });
        }
    } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete product");
    }
  };
  const totalValue = products.reduce((acc, curr) => acc + (Number(curr.price) * (Number(curr.quantity) || 1)), 0);

  return (
    <div className="container mx-auto px-4 py-8 pb-32 md:pb-12">
      
      {/* Header & Stats */}
      {!isOnline && (
        <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-6 flex items-center gap-3 font-bold shadow-sm animate-fade-in-up">
            <WifiOff size={20} className="flex-shrink-0" />
            <span>You are currently offline. Changes will not be saved.</span>
        </div>
      )}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('shop_title')}</h1>
            <p className="text-slate-500">{t('shop_subtitle')}</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-end min-w-[180px]">
             <div className="text-2xl font-bold text-primary-600 font-mono leading-none">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
             </div>
             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                {currentTime.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
             </div>
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
                onClick={isOnline ? toggleStoreStatus : undefined}
                disabled={!isOnline}
                className={`bg-white p-6 rounded-2xl border-l-4 shadow-sm flex items-center gap-4 text-left w-full transition-all active:scale-95 group ${storeStatus ? 'border-green-500' : 'border-red-500'} ${!isOnline ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
            >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${storeStatus ? 'bg-green-100 text-green-600 group-hover:bg-green-200' : 'bg-red-100 text-red-600 group-hover:bg-red-200'}`}>
                    <Power size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Store Status</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xl font-bold ${storeStatus ? 'text-green-700' : 'text-red-700'}`}>
                        {storeStatus ? 'OPEN' : 'CLOSED'}
                      </span>
                      <span 
                        className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${!isOnline ? 'bg-slate-100 text-slate-400 border-slate-200' : (storeStatus ? 'border-red-200 text-red-600 bg-red-50' : 'border-green-200 text-green-600 bg-green-50')}`}
                      >
                        {storeStatus ? 'Close Shop' : 'Open Shop'}
                      </span>
                    </div>
                </div>
            </button>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Package size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('shop_totalProducts')}</h4>
                    <span className="text-2xl font-bold text-slate-900">{products.length}</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <span className="text-xl font-bold">₹</span>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('shop_inventoryValue')}</h4>
                    <span className="text-2xl font-bold text-slate-900">₹{totalValue.toLocaleString()}</span>
                </div>
            </div>
        </div>


      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    {editMode ? <Edit2 size={18} className="text-primary-600" /> : <Plus size={18} className="text-primary-600" />}
                    {editMode ? t('shop_editProduct') : t('shop_addProduct')}
                </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-slate-700">{t('shop_imagesLabel')}</label>
                    <button type="button" onClick={() => cameraInputRef.current.click()} className="text-primary-600 text-xs font-bold flex items-center gap-1 hover:text-primary-700"><Camera size={14} /> {t('shop_takePhoto')}</button>
                    <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleImageUpload} />
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group">
                      <img src={typeof img === 'string' ? img : img.preview} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full shadow-sm hover:bg-white"><X size={12} /></button>
                    </div>
                  ))}
                  {formData.images.length < 4 && (
                      <div className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 transition-colors relative cursor-pointer">
                         <ImageIcon size={20} />
                         <span className="text-[10px] font-bold mt-1">Add</span>
                         <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                  )}
                </div>
              </div>

              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('shop_name')}</label>
                  <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none" placeholder={t('shop_namePlaceholder')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('shop_price')}</label>
                    <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none" type="number" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('shop_stock')}</label>
                    <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none" type="number" placeholder="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t('shop_category')}</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">{t('shop_selectCategory')}</option>
                  <option value="T-Shirt">T-Shirt</option>
                  <option value="Shirt">Shirt</option>
                  <option value="Pant">Pant</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">{t('shop_sizes')}</label>
                   <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none" placeholder={t('shop_sizesPlaceholder')} value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">{t('shop_colors')}</label>
                   <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none" placeholder={t('shop_colorsPlaceholder')} value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} />
                </div>
              </div>

              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('shop_description')}</label>
                  <textarea className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none min-h-[80px]" placeholder={t('shop_descriptionPlaceholder')} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button className="flex-1 bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed" type="submit" disabled={uploading || !isOnline}>
                  {uploading ? <RefreshCcw className="animate-spin" size={18} /> : (editMode ? <Save size={18} /> : <Plus size={18} />)}
                  {uploading ? 'Saving...' : (editMode ? t('shop_update') : t('shop_add'))}
                </button>
                {editMode && (
                  <button className="px-6 py-3 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors" type="button" onClick={() => { setEditMode(false); setEditingId(null); setFormData({ name: '', price: '', description: '', quantity: '', category: '', sizes: '', colors: '', images: [] }); }}>
                    {t('shop_cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Inventory List */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">{t('shop_inventoryList')}</h2>
          </div>

          <div className="space-y-4">
            {loading ? (
                <div className="text-center py-12 text-slate-400">Loading Inventory...</div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                <Package size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">{t('shop_noProducts')}</h3>
                <p className="text-slate-500 text-sm">Start adding products from the form.</p>
              </div>
            ) : ( products.map(product => (
              <div key={product.id} className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary-100 shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 flex items-start gap-6 relative overflow-hidden">
                {/* Decorative background accent on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-50/50 to-transparent rounded-bl-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                <div 
                    className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm relative group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => setSelectedImage({ index: 0, images: product.images && product.images.length > 0 ? product.images : [] })}
                >
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={28} /></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 py-1 relative z-10">
                   <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1 group-hover:text-primary-700 transition-colors">{product.name}</h4>
                       <span className="font-extrabold text-primary-600 text-xl tracking-tight">₹{product.price}</span>
                   </div>
                   
                   <div className="flex flex-wrap gap-2.5 mb-3">
                        <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                           {product.category || 'Item'}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border shadow-sm ${Number(product.quantity) === 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                           {Number(product.quantity) === 0 ? 'Out of Stock' : `Stock: ${product.quantity}`}
                        </span>
                   </div>
                   
                   {product.sizes && (
                       <div className="text-sm text-slate-500 font-medium flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                           Sizes: <span className="text-slate-700 font-semibold">{product.sizes.toUpperCase()}</span>
                       </div>
                   )}
                   {product.colors && (
                       <div className="text-sm text-slate-500 font-medium flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                           Colors: <span className="text-slate-700 font-semibold">{product.colors.toUpperCase()}</span>
                       </div>
                   )}
                </div>
                
                <div className="flex flex-col gap-2 relative z-10">
                  <button onClick={() => handleEdit(product)} className="p-2.5 text-primary-600 bg-primary-50 hover:bg-primary-600 hover:text-white rounded-xl transition-all shadow-sm" title="Edit"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(product.id, product.images)} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm" title="Delete"><Trash2 size={18} /></button>
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl transform scale-100 animate-scale-in">
                  <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5">
                      <Trash2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Product?</h3>
                  <p className="text-slate-500 text-center mb-8 leading-relaxed">
                      Are you sure you want to delete this product? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                      <button 
                         onClick={() => setDeleteModal({ show: false, id: null, images: [] })}
                         className="flex-1 py-3 text-slate-700 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                         onClick={confirmDelete}
                         className="flex-1 py-3 text-white font-bold bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                      >
                          Yes, Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Lightbox */}
      {selectedImage && selectedImage.images.length > 0 && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm select-none" onClick={() => setSelectedImage(null)}>
            
            <button 
                className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50"
                onClick={() => setSelectedImage(null)}
            >
                <X size={24} />
            </button>

            {selectedImage.images.length > 1 && (
                <>
                    <button 
                        className="absolute left-4 p-3 text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50 backdrop-blur-md hidden md:block"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }));
                        }}
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button 
                        className="absolute right-4 p-3 text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50 backdrop-blur-md hidden md:block"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }));
                        }}
                    >
                        <ChevronRight size={32} />
                    </button>
                </>
            )}

            <div className="relative w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <img 
                    src={selectedImage.images[selectedImage.index]} 
                    className="max-w-[95vw] max-h-[80vh] object-contain rounded-lg shadow-2xl animate-fade-in" 
                    alt="Full View" 
                    onClick={(e) => {
                         if (window.innerWidth < 768 && selectedImage.images.length > 1) {
                             setSelectedImage(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }));
                         }
                    }}
                />
                
                {selectedImage.images.length > 1 && (
                    <div className="mt-6 flex gap-2 overflow-x-auto max-w-[90vw] p-2 hide-scrollbar justify-center">
                        {selectedImage.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(prev => ({ ...prev, index: idx }))}
                                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage.index === idx ? 'border-primary-500 scale-110 opacity-100' : 'border-transparent opacity-40 hover:opacity-80'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>, document.body
      )}

      {/* Toast Notification */}
      {toast && createPortal(
          <div className="fixed bottom-20 md:bottom-6 right-6 z-[200] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up border border-slate-700">
              <div className={`${toast.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'} p-2 rounded-full`}>
                  {toast.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
              </div>
              <div>
                  <h4 className="font-bold text-sm">{toast.type === 'error' ? 'Error' : 'Success'}</h4>
                  <p className="text-sm text-slate-300">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="ml-2 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
          </div>, document.body
      )}
    </div>
  );
};

export default Shopkeeper;
