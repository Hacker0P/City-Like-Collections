import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Megaphone, ShoppingBag, MapPin, ArrowRight, Instagram, Facebook, Youtube, X, Filter, Map as MapIcon, ChevronRight, ChevronLeft, User, Phone, Search, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useShop } from '../context/ShopContext';
import { getColorHex } from '../utils/colors';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { supabase } from '../supabaseClient';

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
    socials: { instagram: '', facebook: '', youtube: '' }
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('clc_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products: ", error);
        } finally {
            setLoading(false);
        }
    };

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
    
    // Subscriptions
    const channel = supabase.channel('public:products:home').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts()).subscribe();
    const settingsChannel = supabase.channel('public:store_settings:home').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_settings', filter: 'id=eq.1' }, (payload) => setConfig(prev => ({ ...prev, isOpen: payload.new.is_open, noticeMessage: payload.new.notice_message, showNotice: payload.new.show_notice }))).subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(settingsChannel);
    };
  }, []);

  const [filters, setFilters] = useState({
    category: 'All',
    priceRange: [0, 10000],
    size: 'All',
    color: 'All',
    search: ''
  });
  const [visibleCount, setVisibleCount] = useState(24);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const uniqueCategories = ['T-Shirt', 'Shirt', 'Jeans', 'Trousers', 'Shoes', 'Accessories', 'Other'];
  const sizes = ['All', ...new Set(products.flatMap(p => p.sizes ? p.sizes.split(',').map(s => s.trim()) : []))].sort();
  const uniqueColors = ['All', ...new Set(products.flatMap(p => p.colors ? p.colors.split(',').map(c => c.trim()) : []))].sort();
  
  const filteredProducts = products.filter(product => {
    if (filters.category !== 'All' && product.category !== filters.category) return false;
    if (Number(product.price) < filters.priceRange[0] || Number(product.price) > filters.priceRange[1]) return false;
    if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    if (filters.size !== 'All') {
        if (!product.sizes) return false;
        if (!product.sizes.split(',').map(s => s.trim()).includes(filters.size)) return false;
    }
    if (filters.color !== 'All') {
        if (!product.colors) return false;
        if (!product.colors.split(',').map(c => c.trim()).includes(filters.color)) return false;
    }
    return true;
  });

  useEffect(() => {
    setVisibleCount(24);
  }, [filters]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="pb-24 md:pb-0 animate-fade-in min-h-screen">
      
      {config.showNotice && config.noticeMessage && (
        <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/30"></div>
            <div className="container mx-auto px-4 py-3 relative z-10">
                <div className="flex items-center justify-center gap-3 animate-fade-in-up">
                    <span className="shrink-0 bg-white/20 p-1.5 rounded-full backdrop-blur-sm animate-pulse shadow-inner">
                        <Megaphone size={18} className="text-yellow-300 fill-yellow-300 transform -rotate-12" />
                    </span>
                    <p className="font-bold text-sm md:text-base tracking-wide drop-shadow-sm text-center leading-snug">
                        {config.noticeMessage}
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="border-b border-slate-200/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 md:py-12">
           <div className="bg-gradient-to-r from-primary-600 to-indigo-700 rounded-3xl p-8 md:p-16 text-center text-white shadow-xl relative overflow-hidden">
               {/* Pattern Element */}
               <div className="absolute top-0 right-0 p-16 opacity-10">
                   <ShoppingBag size={300} />
               </div>
               
               <div className="absolute top-6 right-6 md:top-10 md:right-10 z-20">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-lg ${config.isOpen ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${config.isOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                      {config.isOpen ? 'Open' : 'Closed'}
                  </span>
               </div>
               
               <h1 className="relative z-10 text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
                   {language === 'bn' ? 'সিটি লাইফ কালেকশন' : config.storeName}
               </h1>
               <p className="relative z-10 text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8 font-medium">
                   {t('heroSubtitle')}
               </p>
               <div className="relative z-10 flex flex-wrap gap-4 justify-center">
                    <button 
                        onClick={() => document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' })}
                        className="bg-white text-primary-600 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1 active:translate-y-0"
                    >
                        {t('explore')}
                    </button>
                    <a 
                        href={`https://wa.me/${config.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-3 rounded-full font-bold hover:bg-white/30 transition-colors"
                    >
                        {t('contactUs')}
                    </a>
               </div>
           </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden container mx-auto px-4 mt-6">
          <div className="relative">
              <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
      </div>

      <div className="container mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8 items-start" id="shop-section">
          
          {/* Mobile Filter Backdrop */}
          {showMobileFilters && (
              <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
          )}

          {/* Filters Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white p-6 shadow-2xl transition-transform duration-300 lg:sticky lg:top-24 lg:z-10 lg:block lg:shadow-sm lg:rounded-2xl lg:border lg:border-slate-200 lg:translate-x-0 ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}`}>
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Filter size={18} /> {t('filters')}
                </h3>
                <div className="flex items-center gap-3">
                    <button onClick={() => setFilters({ category: 'All', priceRange: [0, 5000], size: 'All' })} className="text-xs font-semibold text-primary-600 hover:text-primary-800">
                        Reset
                    </button>
                    <button onClick={() => setShowMobileFilters(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
             </div>
             
             {/* Category Filter */}
             <div className="mb-8">
                 <button 
                    onClick={() => setFilters({ category: 'All', priceRange: [0, 10000], size: 'All', color: 'All' })}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 underline"
                 >
                    {t('resetAll')}
                 </button>
             </div>

             {/* Price Filter */}
             <div className="mb-8">
                 <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('priceRange')}</label>
                    <span className="text-sm font-bold text-slate-900">₹0 - ₹{filters.priceRange[1]}</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" 
                    max="10000" 
                    step="100"
                    value={filters.priceRange[1]} 
                    onChange={(e) => setFilters({...filters, priceRange: [0, parseInt(e.target.value)]})}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    style={{
                        background: `linear-gradient(to right, #2563eb ${(filters.priceRange[1] / 10000) * 100}%, #e2e8f0 ${(filters.priceRange[1] / 10000) * 100}%)`
                    }}
                 />
             </div>

             {/* Category Filter */}
             <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('category')}</label>
                <div className="flex flex-col gap-1">
                    {['All', ...uniqueCategories].map(cat => (
                        <label key={cat} className={`flex items-center gap-3 cursor-pointer py-2 px-3 rounded-lg transition-colors ${filters.category === cat ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <input type="radio" name="category" checked={filters.category === cat} onChange={() => setFilters({...filters, category: cat})} className="sr-only" />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${filters.category === cat ? 'border-primary-600' : 'border-slate-300'}`}>
                                {filters.category === cat && <div className="w-2 h-2 bg-primary-600 rounded-full"></div>}
                            </div>
                            <span>{cat === 'All' ? t('cat_All') : t(`cat_${cat.replace(/[^a-zA-Z0-9]/g, '')}`) || cat}</span>
                        </label>
                    ))}
                </div>
             </div>
             
             {/* Sizes Filter */}
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('size')}</label>
                <div className="flex flex-wrap gap-2">
                     {sizes.map(size => (
                         <button
                            key={size}
                            onClick={() => setFilters({...filters, size: filters.size === size ? 'All' : size})}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                                filters.size === size 
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                         >
                            {size}
                         </button>
                     ))}
                </div>
             </div>

             {/* Colors Filter */}
             <div className="mt-8">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('color')}</label>
                <div className="flex flex-wrap gap-2">
                     {uniqueColors.map(color => (
                         <button
                            key={color}
                            onClick={() => setFilters({...filters, color: filters.color === color ? 'All' : color})}
                            title={color}
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-110 ${
                                filters.color === color 
                                  ? 'border-primary-600 ring-2 ring-primary-100 scale-110' 
                                  : 'border-slate-200'
                            }`}
                         >
                            {color === 'All' ? (
                                <span className="text-[10px] font-bold text-slate-500">All</span>
                            ) : (
                                <span 
                                    className="w-full h-full rounded-full" 
                                    style={{ backgroundColor: getColorHex(color) || 'transparent' }}
                                >
                                    {!getColorHex(color) && <span className="text-[8px] flex w-full h-full items-center justify-center font-bold text-slate-500 bg-slate-100/50 rounded-full">{color.charAt(0)}</span>}
                                </span>
                            )}
                         </button>
                     ))}
                </div>
             </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 w-full">
             <div className="flex flex-col gap-4 mb-6">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div className="flex items-center justify-between w-full md:w-auto">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{t('latestArrivals')}</h2>
                            <p className="text-slate-500 text-sm mt-1">{t('found')} {filteredProducts.length} {t('items')}</p>
                        </div>
                        <button 
                            onClick={() => setShowMobileFilters(true)} 
                            className="lg:hidden p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm active:scale-95 flex items-center gap-2 font-medium text-sm"
                        >
                            <Filter size={18} /> Filters
                        </button>
                     </div>
                 </div>
                 
                 {/* Mobile Search */}
                 <div className="lg:hidden relative">
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:bg-white focus:border-primary-500 rounded-xl focus:ring-2 focus:ring-primary-100 transition-all font-medium text-sm shadow-sm"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 </div>
             </div>

             {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    <LoadingSkeleton variant="card" count={6} />
                </div>
            ) : filteredProducts.length === 0 ? (
                <EmptyState 
                    icon={ShoppingBag} 
                    title={t('noProducts')} 
                    description={t('noProductMatch') || t('noProducts')}
                    action={() => setFilters({ category: 'All', priceRange: [0, 10000], size: 'All', color: 'All' })}
                    actionLabel="Clear Filters"
                />
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {displayedProducts.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                config={config} 
                                onImageClick={(data) => setSelectedImage(data)} 
                            />
                        ))}
                    </div>
                    {visibleCount < filteredProducts.length && (
                        <div className="mt-12 text-center pb-8 border-t border-slate-200 pt-8">
                            <p className="text-slate-400 text-sm mb-4">Showing {displayedProducts.length} of {filteredProducts.length} products</p>
                            <button 
                                onClick={() => setVisibleCount(prev => prev + 24)}
                                className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm active:scale-95"
                            >
                                Load More Products
                            </button>
                        </div>
                    )}
                </>
            )}
          </div>

      </div>
      
      {/* Lightbox */}
      {selectedImage && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm select-none" onClick={() => setSelectedImage(null)}>
            
            <button 
                className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50"
                onClick={() => setSelectedImage(null)}
            >
                <X size={24} />
            </button>

            {/* Navigation Buttons */}
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
                         // Simple tap to next on mobile, or do nothing
                         if (window.innerWidth < 768 && selectedImage.images.length > 1) {
                             setSelectedImage(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }));
                         }
                    }}
                />
                
                {/* Thumbnails / Dots */}
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

      {/* Footer */}
      <footer className="relative mt-24 bg-slate-950 text-slate-300 pt-20 pb-10 overflow-hidden font-sans">
         {/* Decorative Top Border */}
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]"></div>
         
         {/* Background Elements */}
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-900 to-transparent opacity-50 pointer-events-none"></div>
         
         <div className="container mx-auto px-6 relative z-10">
             <div className="grid lg:grid-cols-2 gap-16 items-start">
                 
                 {/* Left: Brand & Info */}
                 <div className="space-y-8">
                     <div className="flex items-center gap-5">
                        <img src="/pwa-192x192.png" alt="Logo" className="w-16 h-16 rounded-2xl shadow-xl border border-slate-800 object-cover" />
                        <div>
                            <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">{config.storeName}</h3>
                            <p className="text-primary-400 text-sm font-medium tracking-wide uppercase">{t('exclusiveMensWear')}</p>
                        </div>
                     </div>
                     
                     <p className="text-slate-400 leading-relaxed max-w-md text-lg font-light">
                         {t('footerDesc')}
                     </p>
                     
                     <div className="space-y-4 pt-2">
                         <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors group">
                             <div className="p-3 rounded-xl bg-slate-800 text-primary-400 group-hover:scale-110 transition-transform shadow-inner">
                                <MapPin size={22} />
                             </div>
                             <div>
                                 <h4 className="text-white font-semibold mb-0.5">Our Location</h4>
                                 <p className="text-sm text-slate-400 leading-snug">{config.address}</p>
                             </div>
                         </div>

                         {(config.whatsapp || config.alternateMobile) && (
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors group">
                                <div className="p-3 rounded-xl bg-slate-800 text-green-400 group-hover:scale-110 transition-transform shadow-inner">
                                   <Phone size={22} />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-0.5">Contact Us</h4>
                                    <div className="text-sm text-slate-400 flex flex-col gap-0.5">
                                        {config.whatsapp && <span>WhatsApp: +91 {config.whatsapp}</span>}
                                        {config.alternateMobile && <span>Call: {config.alternateMobile}</span>}
                                    </div>
                                </div>
                            </div>
                         )}
                     </div>

                     <div className="flex gap-4 pt-4">
                         {config.socials?.instagram && <a href={config.socials.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-transparent transition-all shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1"><Instagram size={22} /></a>}
                         {config.socials?.facebook && <a href={config.socials.facebook} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-transparent transition-all shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1"><Facebook size={22} /></a>}
                         {config.socials?.youtube && <a href={config.socials.youtube} target="_blank" rel="noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-red-600 hover:text-white hover:border-transparent transition-all shadow-lg hover:shadow-red-500/20 hover:-translate-y-1"><Youtube size={22} /></a>}
                     </div>
                 </div>

                 {/* Right: Map */}
                 <div className="relative lg:pl-10">
                      <div className="absolute inset-0 bg-primary-500 blur-[120px] opacity-10 pointer-events-none rounded-full translate-x-20"></div>
                      <div className="h-[400px] w-full rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl relative bg-slate-900 group z-10">
                           <iframe 
                             width="100%" 
                             height="100%" 
                             title="Footer Map"
                             frameBorder="0" 
                             scrolling="no" 
                             marginHeight="0" 
                             marginWidth="0" 
                             src={`https://maps.google.com/maps?q=${config.location.lat},${config.location.lng}&z=15&output=embed&iwloc=B`}
                             referrerPolicy="no-referrer-when-downgrade"
                             sandbox="allow-scripts allow-same-origin allow-popups"
                             className="w-full h-full grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                           ></iframe>
                           <a 
                             href={config.googleMapsLink} 
                             target="_blank" 
                             rel="noreferrer" 
                             className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 hover:bg-white hover:scale-105 transition-all transform translate-y-full group-hover:translate-y-0 duration-300"
                           >
                               Open Larger Map <ArrowRight size={14} />
                           </a>
                      </div>
                      <div className="mt-6 flex items-center justify-center lg:justify-end gap-2 text-slate-500 text-sm">
                          <MapIcon size={16} /> Locate us easily on Google Maps
                      </div>
                 </div>
             </div>

             <div className="border-t border-slate-800 mt-20 pt-8 text-center">
                 <p className="text-slate-500 text-sm">
                     © {new Date().getFullYear()} <span className="text-slate-300 font-bold tracking-wide">{config.storeName}</span>. All rights reserved.
                 </p>
             </div>
         </div>
      </footer>
    </div>
  );
};

export default Home;
