import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, ShoppingBag, MapPin, ArrowRight, Star, Instagram, Facebook, Youtube } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ProductImageSlider from '../components/ProductImageSlider';
import ProductCard from '../components/ProductCard';
import { supabase } from '../supabaseClient';

// Specific Google Maps CID for City Life Collection (Default/Fallback)
// const STORE_CID = '5610898517208768605'; // Moved to config

const Home = () => {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [config, setConfig] = useState({
    whatsapp: '',
    storeName: 'City Life Collection',
    location: { lat: 23.0308542, lng: 86.3613231 },
    googleMapsLink: 'https://www.google.com/maps/place/City+Life+collection/@23.0307752,86.3613507,20z/data=!4m6!3m5!1s0x39f673bf624dbeed:0x4dde092678b0205d!8m2!3d23.0308542!4d86.3613231!16s%2Fg%2F11y412pm3s?entry=ttu&g_ep=EgoyMDI1MTIwOC4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D',
    cid: '5610898517208768605',
    address: 'Khawasdih, Barabazar, West Bengal 723127',
    isOpen: true,
    ownerName: '',
    alternateMobile: '',
    socials: {
        instagram: '',
        facebook: '',
        youtube: ''
    }
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    // Determine source: If online, fetch from Supabase.
    // For config, we might still use local or move to remote config later
    // For now, let's keep config local or hardcoded as per original
    const savedConfig = localStorage.getItem('clc_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));

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
            console.error("Error fetching products: ", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Store Settings
    const fetchSettings = async () => {
      const { data } = await supabase.from('store_settings').select('is_open, notice_message, show_notice').eq('id', 1).single();
      if (data) {
        setConfig(prev => ({ 
           ...prev, 
           isOpen: data.is_open,
           noticeMessage: data.notice_message,
           showNotice: data.show_notice
        }));
      }
    };

    fetchProducts();
    fetchSettings();
    
    // Realtime subscription for updates
    const channel = supabase
      .channel('public:products:home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
          fetchProducts();
      })
      .subscribe();
      
    // Realtime subscription for settings
    const settingsChannel = supabase
      .channel('public:store_settings:home')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_settings', filter: 'id=eq.1' }, (payload) => {
          setConfig(prev => ({ 
             ...prev, 
             isOpen: payload.new.is_open,
             noticeMessage: payload.new.notice_message,
             showNotice: payload.new.show_notice
          }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(settingsChannel);
    };
  }, []);



  // Determine Map Source
  const getMapSrc = () => {
    if (config.location && config.location.lat && config.location.lng) {
      return `https://maps.google.com/maps?q=${config.location.lat},${config.location.lng}&z=15&output=embed`;
    }
    if (config.cid) {
      return `https://maps.google.com/maps?cid=${config.cid}&z=15&output=embed`;
    }
    return '';
  };


  // Filtering State
  const [filters, setFilters] = useState({
    category: 'All',
    priceRange: [0, 5000],
    size: 'All',
    color: 'All'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Derived unique values for filters
  // Derived unique values for filters
  const categories = [t('category'), 'T-Shirt', 'Shirt', 'Pant', 'Other']; // 'Category' is label? No, here it meant 'All'. Let's check logic. 
  // Wait, categories is used for RADIO options. The first one is 'All'. 
  // Let's modify the filtering state logic if we change the value 'All'.
  // Actually, for display we can translate "All". For value, we keep 'All'.
  
  // To avoid complexity with values, I will keep 'All' as value but render logic differently?
  // Or just translate distinct values?
  // Let's update the filter rendering to show translated labels.
  
  const uniqueCategories = ['T-Shirt', 'Shirt', 'Pant', 'Other'];
  const sizes = ['All', ...new Set(products.flatMap(p => p.sizes ? p.sizes.split(',').map(s => s.trim()) : []))].sort();
  const colors = ['All', ...new Set(products.flatMap(p => p.colors ? p.colors.split(',').map(c => c.trim()) : []))].sort();
  const maxPrice = Math.max(...products.map(p => Number(p.price) || 0), 1000);

  // Filtering Logic
  const filteredProducts = products.filter(product => {
    // Category Filter
    if (filters.category !== 'All' && product.category !== filters.category) return false;
    
    // Price Filter
    if (Number(product.price) < filters.priceRange[0] || Number(product.price) > filters.priceRange[1]) return false;

    // Size Filter (Partial Match)
    if (filters.size !== 'All') {
        if (!product.sizes) return false;
        const productSizes = product.sizes.split(',').map(s => s.trim());
        if (!productSizes.includes(filters.size)) return false;
    }

    // Color Filter (Partial Match)
    if (filters.color !== 'All') {
        if (!product.colors) return false;
        const productColors = product.colors.split(',').map(c => c.trim());
        if (!productColors.includes(filters.color)) return false;
    }

    return true;
  });

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem', marginTop: '2rem' }}>
      
      {/* Store Notice Banner */}
      {config.showNotice && config.noticeMessage && (
        <div style={{ 
          background: '#fff7ed', 
          border: '1px solid #fed7aa', 
          borderRadius: '16px', 
          padding: '1rem', 
          marginBottom: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <div style={{ 
            background: '#ea580c', 
            color: 'white', 
            borderRadius: '50%', 
            width: '32px', 
            height: '32px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            📢
          </div>
          <p style={{ color: '#9a3412', fontWeight: 600, fontSize: '1rem', margin: 0 }}>
            {config.noticeMessage}
          </p>
        </div>
      )}

      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(120deg, var(--primary) 0%, #8b5cf6 100%)',
        textAlign: 'center',
        padding: '5rem 2rem',
        marginBottom: '3rem',
        marginTop: '1.5rem',
        borderRadius: '24px',
        color: 'white',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <span style={{ 
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
              padding: '0.25rem 1rem',
              borderRadius: '50px',
              fontSize: '0.85rem', 
              fontWeight: 600, 
              color: 'white'
            }}>
              ✨ {t('newCollection')}
            </span>
            <span style={{ 
              background: config.isOpen ? '#16a34a' : '#dc2626',
              padding: '0.5rem 1.25rem',
              borderRadius: '50px',
              fontSize: '1rem', 
              fontWeight: 700, 
              color: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              {config.isOpen ? t('openNow') : t('closed')}
            </span>
        </div>
        
        <h1 className="heading-xl" style={{ marginBottom: '1rem', color: 'white' }}>
           {language === 'bn' ? 'সিটি লাইফ কালেকশন' : config.storeName}
        </h1>
        
        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto 2.5rem', fontWeight: 400 }}>
          {t('heroSubtitle')}
        </p>
        
        <button className="btn" onClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })} style={{ 
          background: 'white', 
          color: 'var(--primary)', 
          padding: '0.8rem 2.5rem', 
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {t('explore')} <ArrowRight size={20} />
        </button>
      </div>

      {/* Main Content Grid with Filter Sidebar */}
      {/* Shop Layout */}
      <div className="shop-layout">
        
        {/* Filters Sidebar */}
        <div className="sidebar-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
             <h3 className="heading-md" style={{ color: 'var(--text-main)' }}>{t('filters')}</h3>
             <button 
               onClick={() => setFilters({ category: 'All', priceRange: [0, 5000], size: 'All', color: 'All' })}
               style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
             >
               {t('resetAll')}
             </button>
          </div>

          {/* Category Filter */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>{t('category')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label key='All' style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  <input 
                    type="radio" 
                    name="category" 
                    checked={filters.category === 'All'}
                    onChange={() => setFilters({...filters, category: 'All'})}
                    style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                  />
                  {language === 'bn' ? 'সব' : 'All'}
              </label>
              {uniqueCategories.map(cat => (
                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  <input 
                    type="radio" 
                    name="category" 
                    checked={filters.category === cat}
                    onChange={() => setFilters({...filters, category: cat})}
                    style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div style={{ marginBottom: '2rem' }}>
             <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>{t('priceRange')}</h4>
             <input 
               type="range" 
               min="0" 
               max="5000" 
               step="100"
               value={filters.priceRange[1]}
               onChange={(e) => setFilters({...filters, priceRange: [0, Number(e.target.value)]})}
               style={{ width: '100%', accentColor: 'var(--primary)', height: '4px', background: 'var(--border-color)', borderRadius: '4px' }}
             />
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 600 }}>
               <span>₹0</span>
               <span>₹{filters.priceRange[1]}</span>
             </div>
          </div>

          {/* Size Filter */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>{t('size')}</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setFilters({...filters, size})}
                  style={{ 
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px', 
                    fontSize: '0.85rem', 
                    border: filters.size === size ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: filters.size === size ? 'var(--primary-light)' : 'white',
                    color: filters.size === size ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: filters.size === size ? 700 : 500,
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>{t('color')}</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setFilters({...filters, color})}
                  style={{ 
                    padding: '0.4rem 1rem',
                    borderRadius: '50px', 
                    fontSize: '0.85rem', 
                    border: filters.color === color ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: filters.color === color ? 'var(--primary-light)' : 'white',
                    color: filters.color === color ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: filters.color === color ? 700 : 500,
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 className="heading-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Star className="text-primary" fill="var(--accent)" color="var(--accent)" size={28} /> {t('latestArrivals')}
            </h2>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 600, background: 'white', padding: '0.5rem 1rem', borderRadius: '50px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
              {filteredProducts.length} {t('productsFound')}
            </div>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-secondary)' }}>
              <ShoppingBag size={64} style={{ marginBottom: '1.5rem', opacity: 0.2, color: 'var(--text-main)' }} />
              <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>{t('noProducts')}</p>
              <button 
                onClick={() => setFilters({ category: 'All', priceRange: [0, 5000], size: 'All', color: 'All' })}
                className="btn btn-primary"
              >
                {t('clearFilters')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  config={config}
                  onImageClick={(data) => setSelectedImage(data)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Location Section */}
      {config.location && config.location.lat && (
        <div style={{ marginTop: '6rem' }}>
          <div className="glass-panel" style={{ padding: '0.5rem', overflow: 'hidden', background: 'white' }}>
            <div style={{ padding: '3rem 2rem 2rem 2rem', textAlign: 'center' }}>
              <h2 className="heading-lg" style={{ marginBottom: '0.5rem' }}>{t('visitStore')}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('experience')}</p>
            </div>
            
            <div style={{ height: '450px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
               <iframe 
                 width="100%" 
                 height="100%" 
                 title="Shop Location"
                 frameBorder="0" 
                 scrolling="no" 
                 marginHeight="0" 
                 marginWidth="0" 
                 src={getMapSrc()}
                 style={{ filter: 'grayscale(0.2) contrast(1.1)' }}
               ></iframe>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '2.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                <MapPin size={28} />
                <span style={{ fontSize: '1.25rem' }}>{config.storeName} {t('location')}</span>
              </div>
              
              {config.address && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: '1.6', fontSize: '1.1rem' }}>
                  {config.address}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', margin: '1.5rem 0', background: 'var(--bg-page)', padding: '1.5rem 3rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                {config.ownerName && (
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                    {config.ownerName}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>
                  {config.whatsapp && (
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                       <span style={{ fontWeight: 600 }}>{t('mobile')}:</span> 
                       <a href={`tel:${config.whatsapp}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{config.whatsapp}</a>
                     </div>
                  )}
                  {config.alternateMobile && (
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                       <span style={{ fontWeight: 600 }}>{t('alternate')}:</span> 
                       <a href={`tel:${config.alternateMobile}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>{config.alternateMobile}</a>
                     </div>
                  )}
                </div>
              </div>

              <a 
                href={config.googleMapsLink || (config.cid ? `https://maps.google.com/?cid=${config.cid}` : `https://www.google.com/maps/search/?api=1&query=${config.location.lat},${config.location.lng}`)} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-primary"
                style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
              >
                {t('openStore')}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        {/* Social Icons */}
        {config.socials && (config.socials.instagram || config.socials.facebook || config.socials.youtube) && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {config.socials.instagram && (
                    <a href={config.socials.instagram} target="_blank" rel="noreferrer" style={{ color: '#E1306C', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                        <Instagram size={28} />
                    </a>
                )}
                {config.socials.facebook && (
                    <a href={config.socials.facebook} target="_blank" rel="noreferrer" style={{ color: '#1877F2', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                        <Facebook size={28} />
                    </a>
                )}
                {config.socials.youtube && (
                    <a href={config.socials.youtube} target="_blank" rel="noreferrer" style={{ color: '#FF0000', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                        <Youtube size={28} />
                    </a>
                )}
            </div>
        )}
        <p>© {new Date().getFullYear()} {config.storeName}. {t('designedBy')}.</p>
      </footer>
      {/* Lightbox Modal */}
      {selectedImage && createPortal(
        <div 
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            animation: 'fadeIn 0.2s ease-out',
            backdropFilter: 'blur(5px)'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
             
             {/* Close Button */}
             <button 
               onClick={() => setSelectedImage(null)}
               style={{
                 position: 'absolute',
                 top: '-3rem',
                 right: 0,
                 background: 'transparent',
                 color: 'white',
                 fontSize: '2rem',
                 cursor: 'pointer',
                 padding: '0.5rem',
                 zIndex: 10000
               }}
             >
               ×
             </button>

             {/* Previous Button */}
             {selectedImage.images.length > 1 && (
               <button
                 style={{
                   position: 'absolute',
                   left: '-3rem',
                   background: 'rgba(255,255,255,0.1)',
                   color: 'white',
                   borderRadius: '50%',
                   width: '40px',
                   height: '40px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: 'pointer',
                   zIndex: 10000,
                   backdropFilter: 'blur(4px)'
                 }}
                 onClick={(e) => {
                   e.stopPropagation();
                   setSelectedImage(prev => ({
                     ...prev,
                     index: (prev.index - 1 + prev.images.length) % prev.images.length
                   }));
                 }}
               >
                 <ArrowRight size={24} style={{ transform: 'rotate(180deg)' }} />
               </button>
             )}

             <img 
               src={selectedImage.images[selectedImage.index]} 
               alt="Full view" 
               style={{ 
                 maxWidth: '100%', 
                 maxHeight: '90vh', 
                 objectFit: 'contain', 
                 borderRadius: '8px', 
                 boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' 
               }} 
             />

             {/* Next Button */}
             {selectedImage.images.length > 1 && (
               <button
                 style={{
                   position: 'absolute',
                   right: '-3rem',
                   background: 'rgba(255,255,255,0.1)',
                   color: 'white',
                   borderRadius: '50%',
                   width: '40px',
                   height: '40px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   cursor: 'pointer',
                   zIndex: 10000,
                   backdropFilter: 'blur(4px)'
                 }}
                 onClick={(e) => {
                   e.stopPropagation();
                   setSelectedImage(prev => ({
                     ...prev,
                     index: (prev.index + 1) % prev.images.length
                   }));
                 }}
               >
                 <ArrowRight size={24} />
               </button>
             )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Home;
