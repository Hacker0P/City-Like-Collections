import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Megaphone, ShoppingBag, MapPin, ArrowRight, Instagram, Facebook, Youtube, X, Map as MapIcon, Phone, Search, Shirt, Footprints, Watch, Star, TrendingUp, Sparkles, Tag, Package, User, ChevronLeft, ChevronRight, Check, RefreshCcw, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useShop } from '../context/ShopContext';
import { supabase } from '../supabaseClient';
import ProductCard from '../components/ProductCard';

const CarouselBanner = ({ t }) => {
    const banners = [
        { 
            id: 1, 
            image: "/indian_fashion_1.png", 
            title: t('carousel_title1'), 
            subtitle: t('carousel_subtitle1'), 
            accent: "" 
        },
        { 
            id: 2, 
            image: "/indian_fashion_2.png", 
            title: t('carousel_title2'), 
            subtitle: t('carousel_subtitle2'), 
            accent: "" 
        },
        { 
            id: 3, 
            image: "/indian_fashion_3.png", 
            title: t('carousel_title3'), 
            subtitle: t('carousel_subtitle3'), 
            accent: "" 
        }
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = React.useRef(null);

    // Auto-scroll effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const nextIndex = (activeIndex + 1) % banners.length;
                const scrollAmount = scrollRef.current.offsetWidth * nextIndex;
                scrollRef.current.scrollTo({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
                setActiveIndex(nextIndex);
            }
        }, 4000); // 4 seconds slide

        return () => clearInterval(interval);
    }, [activeIndex]);

    const handleScroll = () => {
        if (scrollRef.current) {
            const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth);
            setActiveIndex(index);
        }
    };

    return (
        <div className="md:hidden pt-4 pb-2 px-4 relative bg-white dark:bg-slate-900">
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-2xl shadow-md w-full aspect-[2/1]"
            >
                {banners.map((banner) => (
                    <div key={banner.id} className="min-w-full snap-center relative w-full h-full">
                        <img 
                            src={banner.image} 
                            alt={banner.title} 
                            className="w-full h-full object-cover object-top" 
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4`}>
                            <h2 className="text-white text-xl font-black leading-tight drop-shadow-md">{banner.title}</h2>
                            <p className="text-white/90 text-xs mt-1 font-medium drop-shadow-sm">{banner.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                {banners.map((_, idx) => (
                    <div 
                        key={idx}
                        className={`transition-all duration-300 rounded-full h-1.5 shadow-sm ${activeIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

const Home = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { setIsWishlistOpen, wishlist } = useShop();
  const [loading, setLoading] = useState(false); 
  
  const [config, setConfig] = useState({
    whatsapp: '',
    storeName: 'City Like collections',
    location: { lat: 23.0308542, lng: 86.3613231 },
    googleMapsLink: 'https://www.google.com/maps/place/City+Like+collections/@23.0308542,86.3613231,17z/data=!4m6!3m5!1s0x39f673bf624dbeed:0x4dde092678b0205d!8m2!3d23.0308542!4d86.3613231!16s%2Fg%2F11y412pm3s?authuser=0&entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D',
    cid: '5610932246588432477',
    address: 'Khawasdih, Barabazar, West Bengal 723127',
    isOpen: true,
    noticeMessage: '',
    showNotice: false,
    ownerName: '',
    alternateMobile: '',
    socials: { instagram: '', facebook: '', youtube: '' }
  });
  const [mobileSearch, setMobileSearch] = useState('');
  const [searchedProducts, setSearchedProducts] = useState([]);
  
  // Image Viewer State
  const [selectedImage, setSelectedImage] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('clc_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));

    const fetchSettings = async () => {
      const { data } = await supabase.from('store_settings').select('*').eq('id', 1).single();
      if (data) {
        setConfig(prev => ({ 
           ...prev, 
           isOpen: data.is_open,
           noticeMessage: data.notice_message,
           showNotice: data.show_notice,
           ownerName: data.owner_name || prev.ownerName,
           whatsapp: data.whatsapp_number || prev.whatsapp,
           alternateMobile: data.mobile_number || prev.alternateMobile,
           socials: {
               instagram: data.instagram_url || prev.socials.instagram,
               facebook: data.facebook_url || prev.socials.facebook,
               youtube: data.youtube_url || prev.socials.youtube
           },
           // Enforce correct location/map details regardless of DB/Local storage
           location: { lat: 23.0308542, lng: 86.3613231 },
           cid: '5610932246588432477',
           googleMapsLink: 'https://www.google.com/maps/place/City+Like+collections/@23.0308542,86.3613231,17z/data=!4m6!3m5!1s0x39f673bf624dbeed:0x4dde092678b0205d!8m2!3d23.0308542!4d86.3613231!16s%2Fg%2F11y412pm3s?authuser=0&entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D'
        }));
      }
    };

    fetchSettings();
    
    // Subscriptions for settings only
    const settingsChannel = supabase.channel('public:store_settings:home').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_settings', filter: 'id=eq.1' }, (payload) => {
        const newData = payload.new;
        setConfig(prev => ({ 
            ...prev, 
            isOpen: newData.is_open, 
            noticeMessage: newData.notice_message, 
            showNotice: newData.show_notice,
            ownerName: newData.owner_name || prev.ownerName,
            whatsapp: newData.whatsapp_number || prev.whatsapp,
            alternateMobile: newData.mobile_number || prev.alternateMobile,
            socials: {
               instagram: newData.instagram_url || prev.socials.instagram,
               facebook: newData.facebook_url || prev.socials.facebook,
               youtube: newData.youtube_url || prev.socials.youtube
           }
        }));
    }).subscribe();

    return () => {
      supabase.removeChannel(settingsChannel);
    };
  }, []);

  const handleMobileSearch = (e) => {
    if (e.key === 'Enter') {
        navigate(`/catalogue?search=${mobileSearch}`);
    }
  };

  const categories = [
      { 
          name: 'T-Shirt', // Logic key
          label: t('cat_TShirt'), // Display label
          icon: Shirt, 
          color: 'bg-blue-100 text-blue-600', 
          description: t('desc_TShirt'),
          image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      { 
          name: 'Shirt', 
          label: t('cat_Shirt'),
          icon: Shirt, 
          color: 'bg-indigo-100 text-indigo-600', 
          description: t('desc_Shirt'),
          image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      { 
          name: 'Jeans', 
          label: t('cat_Jeans'),
          icon: ShoppingBag, 
          color: 'bg-slate-100 text-slate-600', 
          description: t('desc_Jeans'),
          image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      { 
          name: 'Shoes', 
          label: t('cat_Shoes'),
          icon: Footprints, 
          color: 'bg-orange-100 text-orange-600', 
          description: t('desc_Shoes'),
          image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      { 
          name: 'Trousers', 
          label: t('cat_Trousers'),
          icon: ShoppingBag, 
          color: 'bg-teal-100 text-teal-600', 
          description: t('desc_Trousers'),
          image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      { 
          name: 'Other', 
          label: t('cat_Other'),
          icon: Megaphone, 
          color: 'bg-green-100 text-green-600', 
          description: t('desc_Other'),
          image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
  ];

  const features = [
      { icon: Star, title: t('feat_Quality_Title'), desc: t('feat_Quality_Desc') },
      { icon: TrendingUp, title: t('feat_Trends_Title'), desc: t('feat_Trends_Desc') },
      { icon: Tag, title: t('feat_Prices_Title'), desc: t('feat_Prices_Desc') },
      { icon: Package, title: t('feat_Collection_Title'), desc: t('feat_Collection_Desc') }
  ];

  const filteredCategories = categories.filter(cat => 
    cat.label.toLowerCase().includes(mobileSearch.toLowerCase()) || 
    cat.name.toLowerCase().includes(mobileSearch.toLowerCase())
  );

  useEffect(() => {
    const fetchProducts = async () => {
        setLoading(true);
        try {
            let query = supabase.from('products').select('*');
            
            if (mobileSearch.length > 1) {
                query = query.ilike('name', `%${mobileSearch}%`);
            } else {
                // Fetch random/latest for "Trending"
                // Since we can't easily do random in simple Supabase query without RPC, we'll just take latest
                query = query.order('created_at', { ascending: false });
            }
            
            const { data, error } = await query.limit(8);
            
            if (error) throw error;
            if (data) setSearchedProducts(data);
            
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const timeoutId = setTimeout(fetchProducts, mobileSearch ? 400 : 0); // Debounce only for search
    return () => clearTimeout(timeoutId);
  }, [mobileSearch]);

  useEffect(() => {
    if (mobileSearch && (filteredCategories.length > 0 || searchedProducts.length > 0)) {
        const categorySection = document.getElementById('shop-by-category');
        if (categorySection) {
            categorySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
  }, [mobileSearch, searchedProducts.length]);

  return (
    <div className="pb-24 md:pb-0 animate-fade-in min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-purple-100 selection:text-purple-900">
      
      {/* Custom Mobile Header - App Like */}
      <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-slate-900 pb-2 shadow-sm transition-all duration-300">
           <div className="px-4 pt-4 pb-2 flex items-center gap-3">
               <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center px-3 py-2.5 border border-slate-200 dark:border-slate-700">
                   <Search size={18} className="text-slate-400 mr-2" />
                   <input 
                        type="text" 
                        placeholder={t('search_placeholder')} 
                        value={mobileSearch}
                        onChange={(e) => setMobileSearch(e.target.value)}
                        onKeyDown={handleMobileSearch}
                        className="bg-transparent w-full text-slate-800 dark:text-slate-100 text-sm font-medium outline-none placeholder:text-slate-400"
                   />
               </div>
               
               {/* Wishlist Toggle Mobile */}
               <button 
                  onClick={() => setIsWishlistOpen(true)}
                  className="shrink-0 w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg flex items-center justify-center relative active:scale-95 transition-transform"
               >
                   <Heart size={20} className={wishlist.length > 0 ? "fill-rose-500 text-rose-500" : ""} />
                   {wishlist.length > 0 && (
                       <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                           {wishlist.length}
                       </span>
                   )}
               </button>

               {/* Mobile Shop Status */}
               <div className={`shrink-0 h-10 px-3 rounded-lg border flex items-center gap-2 shadow-sm ${config.isOpen ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                   <span className="relative flex h-2 w-2">
                     <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                     <span className={`relative inline-flex rounded-full h-2 w-2 ${config.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                   </span>
                   <span className="text-[10px] font-bold uppercase tracking-wider">{config.isOpen ? t('status_open') : t('status_closed')}</span>
               </div>
           </div>
           
           {/* Mobile Categories Row (Horizontal Scroll) */}
           <div className="flex overflow-x-auto gap-4 px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
               {categories.map((cat, idx) => (
                   <div 
                        key={idx} 
                        onClick={() => navigate(`/catalogue?category=${cat.name}`)}
                        className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[72px] cursor-pointer"
                   >
                        <div className="w-[60px] h-[60px] rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1 flex items-center justify-center overflow-hidden shadow-sm">
                            <img src={cat.image} alt={cat.label} className="w-full h-full object-cover rounded-xl" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight line-clamp-2">{cat.label}</span>
                   </div>
               ))}
           </div>
      </div>

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

      {/* Hero Section (Desktop View) */}
      <div className="hidden md:block bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
        {/* Animated Background Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
           <div className="grid lg:grid-cols-2 gap-20 items-center">
               <div className="space-y-8 text-left order-1">
                   
                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md text-alert shadow-sm border border-slate-200/60 hover:border-slate-300 transition-colors cursor-default mb-4">
                       <span className="relative flex h-3 w-3">
                         <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                         <span className={`relative inline-flex rounded-full h-3 w-3 ${config.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                       </span>
                       <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                            {config.isOpen ? t('storeOpen') : t('storeClosed')}
                       </span>
                   </div>
                   
                   <h1 className="text-7xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[0.95] tracking-tight">
                       {t('heroTitle1')} <br />
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 animate-gradient-x">
                           {t('heroTitle2')}
                       </span>
                   </h1>
                   
                   
                   <p className="text-2xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed font-light tracking-wide">
                       {t('heroSubtitle') || "Explore our exclusive collection of premium mens clothing tailored to perfection. Elevate your wardrobe with City Like Collection."}
                   </p>

                   {/* Desktop Search */}
                   <div className="relative max-w-lg mt-8 mb-2">
                       <input 
                            type="text" 
                            placeholder={t('search_placeholder_desktop')} 
                            value={mobileSearch}
                            onChange={(e) => setMobileSearch(e.target.value)}
                            onKeyDown={handleMobileSearch}
                            className="w-full px-6 py-4 pl-14 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-lg font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 group-hover:scale-[1.01]"
                       />
                       <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500" size={24} />
                       {mobileSearch && (
                           <button 
                                onClick={() => setMobileSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                           >
                               <X size={20} />
                           </button>
                       )}
                   </div>
                   
                   <div className="flex gap-4 pt-4">
                        <button 
                            onClick={() => navigate('/catalogue')}
                            className="group relative px-8 py-4 rounded-full font-bold text-lg bg-slate-900 text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {t('explore')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /> 
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </button>

                        <button 
                            onClick={() => document.getElementById('footer').scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-full font-bold text-lg bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                            {t('contactUs')}
                        </button>
                   </div>
               </div>

               <div className="relative order-1 lg:order-2">
                    {/* Animated Blobs - Hidden on mobile for performance and cleaner look */}
                    <div className="hidden md:block absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="hidden md:block absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                    
                    <div className="relative">
                         <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-[2.5rem] rotate-6 blur-2xl opacity-20 animate-pulse"></div>
                         <div className="relative bg-white p-2 rounded-[2.5rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
                             <div className="aspect-[4/5] rounded-[2rem] overflow-hidden relative group">
                                 <img 
                                    src="/hero_men_fashion.png" 
                                    alt={t('premiumMensWear')} 
                                    className="w-full h-full object-cover object-top transform scale-100 group-hover:scale-110 transition-transform duration-1000" 
                                 />
                                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80"></div>
                                 
                                 <div className="absolute bottom-8 left-8 right-8 text-white">
                                     <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border border-white/10">
                                         <Sparkles size={12} className="text-yellow-300" />
                                         {t('newSeason')}
                                     </div>
                                     <p className="font-black text-3xl md:text-4xl leading-none mb-2">{t('premiumMensWear')}</p>
                                     <p className="text-slate-200 text-lg font-light tracking-wide">{t('latestCollection')}</p>
                                 </div>
                             </div>
                         </div>
                    </div>
               </div>
           </div>
        </div>
      </div>
      
      {/* Mobile Hero Banner (App Style) - Carousel */}
      <CarouselBanner t={t} />

      {/* Shop By Category & Search Results */}
      <div id="shop-by-category" className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12 md:py-24 border-y border-slate-100 dark:border-slate-800 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          
          <div className="container mx-auto px-4">
              <div className="text-center mb-8 md:mb-16 relative hidden md:block">
                  <span className="text-primary-600 font-bold uppercase tracking-widest text-xs bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full border border-primary-100 dark:border-slate-700 mb-4 md:mb-6 inline-block shadow-sm">
                      {t('curatedCollections')}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 md:mb-6 tracking-tight">{t('shopByCategory')}</h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base md:text-xl font-light">
                      {t('shopByCategoryDesc')}
                  </p>
                  {mobileSearch && <p className="mt-4 text-primary-600 font-bold animate-pulse">{t('showing_results_for')} "{mobileSearch}"</p>}
              </div>
              
              {/* Product Match Results / Trending */}
              {(searchedProducts.length > 0 || loading) && (
                  <div className="mb-8 md:mb-20">
                      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
                            <h3 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                {mobileSearch ? (
                                    <>
                                        <Search size={20} className="text-primary-600 md:w-6 md:h-6" />
                                        {t('results_for')} "{mobileSearch}"
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp size={20} className="text-primary-600 md:w-6 md:h-6" />
                                        {t('trending_now')}
                                    </>
                                )}
                            </h3>
                      </div>
                      
                      {/* Horizontal Scroll on Mobile, Grid on Desktop */}
                      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                          {loading ? (
                              Array(4).fill(0).map((_, i) => (
                                  <div key={i} className="min-w-[160px] w-[160px] md:w-auto snap-center animate-pulse">
                                      <div className="bg-slate-200 dark:bg-slate-700 rounded-xl aspect-[3/4] mb-3"></div>
                                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                  </div>
                              ))
                          ) : (
                              searchedProducts.map(product => (
                                <div key={product.id} className="min-w-[160px] w-[160px] md:w-auto snap-center">
                                    <ProductCard 
                                        product={product} 
                                        onImageClick={(data) => setSelectedImage(data)}
                                    />
                                </div>
                              ))
                          )}
                      </div>
                      
                      {/* Divider */}
                      <div className="mt-4 border-b border-slate-200 md:hidden mx-4"></div>
                      <div className="mt-8 border-b border-slate-200 hidden md:block"></div>
                  </div>
              )}

              {/* Category Grid */}
              <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-6">{searchedProducts.length > 0 ? t('related_categories') : t('all_categories')}</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                    <div 
                        key={cat.name}
                        onClick={() => navigate(`/catalogue?category=${cat.name}`)}
                        className="group relative overflow-hidden rounded-2xl md:rounded-[2rem] cursor-pointer aspect-[3/4] shadow-md hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500 bg-slate-100 dark:bg-slate-800 ring-1 ring-black/5 dark:ring-white/5 active:scale-95"
                    >
                        <img 
                            src={cat.image} 
                            alt={cat.label} 
                            className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-90 md:opacity-80 md:group-hover:opacity-60 transition-opacity duration-500"></div>
                        
                        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-8 text-left z-10">
                            <h3 className="text-lg md:text-3xl font-black text-white mb-1 translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-500 tracking-tight">{cat.label}</h3>
                            <p className="text-slate-200 font-medium text-xs md:text-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-500 delay-75 hidden md:block">
                                {cat.description}
                            </p>
                            <div className="mt-2 md:mt-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-500 delay-150">
                                <span className="inline-flex items-center gap-1.5 md:gap-2 text-slate-900 font-bold text-[10px] md:text-sm bg-white/90 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg">
                                    {t('shopNow')} <ArrowRight size={12} className="md:w-4 md:h-4" />
                                </span>
                            </div>
                        </div>
                    </div>
                ))
                ) : (
                    // Only show empty state if BOTH are empty
                    searchedProducts.length === 0 && (
                        <div className="col-span-full text-center py-12 flex flex-col items-center justify-center opacity-60">
                             <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                                <Search size={32} className="text-slate-400" />
                             </div>
                             <p className="text-slate-900 dark:text-white font-medium text-lg">{t('no_matching_items')}</p>
                             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('try_checking_typos')}</p>
                             <button 
                                onClick={() => setMobileSearch('')}
                                className="mt-4 text-primary-600 font-bold hover:underline"
                            >
                                {t('clear_search')}
                            </button>
                        </div>
                    )
                )}
              </div>
              
              <div className="mt-10 md:mt-20">
                  {/* Mobile Premium Card */}
                  {/* Mobile App Grid Navigation - Fixed Single Line */}
                  <div className="md:hidden flex gap-2 px-2 pb-2">
                        <div onClick={() => navigate('/catalogue?sort=newest')} className="flex-1 min-w-0 bg-white dark:bg-slate-800 py-3 px-1 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform h-auto aspect-auto">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                                <Star size={20} fill="currentColor" className="opacity-20" />
                                <Star size={20} className="absolute" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 text-center leading-tight px-1 line-clamp-2">{t('feat_Quality_Title')}</span>
                        </div>

                        <div onClick={() => navigate('/catalogue?featured=true')} className="flex-1 min-w-0 bg-white dark:bg-slate-800 py-3 px-1 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform h-auto aspect-auto">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 text-center leading-tight px-1 line-clamp-2">{t('feat_Trends_Title')}</span>
                        </div>

                        <div onClick={() => navigate('/catalogue?sort=price_asc')} className="flex-1 min-w-0 bg-white dark:bg-slate-800 py-3 px-1 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform h-auto aspect-auto">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                                <Tag size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 text-center leading-tight px-1 line-clamp-2">{t('feat_Prices_Title')}</span>
                        </div>

                        <div onClick={() => navigate('/catalogue')} className="flex-1 min-w-0 bg-white dark:bg-slate-800 py-3 px-1 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform h-auto aspect-auto">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
                                <Package size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 text-center leading-tight px-1 line-clamp-2">{t('feat_Collection_Title')}</span>
                        </div>
                  </div>

                  {/* Desktop Button (Original Style) */}
                  <div className="hidden md:block text-center">
                    <button 
                        onClick={() => navigate('/catalogue')}
                        className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 px-10 py-5 rounded-full font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group"
                    >
                        {t('viewFullCatalogue')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
              </div>
          </div>
      </div>

      {/* Editorial App Layout (Mobile Only) */}
      <div className="md:hidden space-y-6 px-4 pb-12 mt-6">
          
          {/* Section Header */}
          <div className="flex items-end justify-between px-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  {t('curated')} <span className="text-slate-400 dark:text-slate-500">{t('collections_title')}</span>
              </h2>
          </div>

          {/* Grid Layout for Editorial Cards */}
          <div className="grid grid-cols-2 gap-3">
              {/* 1. Hero Editorial Card - Formal */}
              <div 
                onClick={() => navigate('/catalogue?category=Shirt')}
                className="relative aspect-[3/5] rounded-[2rem] overflow-hidden group shadow-lg shadow-indigo-900/10 active:scale-[0.98] transition-all"
              >
                  <img 
                    src="/curated_formal.png" 
                    alt="Formal Collection" 
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent opacity-80"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold uppercase tracking-widest rounded-full mb-2">
                          {t('editorial_office')}
                      </span>
                      <h3 className="text-xl font-black text-white leading-tight mb-1">
                          {t('editorial_formal')}
                      </h3>
                  </div>
              </div>

              {/* 2. Secondary Editorial Card - Casual */}
              <div 
                 onClick={() => navigate('/catalogue?category=T-Shirt')}
                 className="relative aspect-[3/5] rounded-[2rem] overflow-hidden group shadow-lg shadow-orange-900/10 active:scale-[0.98] transition-all"
              >
                  <img 
                    src="/curated_casual.png" 
                    alt="Casual Vibe" 
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold uppercase tracking-widest rounded-full mb-2">
                          {t('editorial_weekend')}
                      </span>
                      <h3 className="text-xl font-black text-white leading-tight mb-1">
                          {t('editorial_street')}
                      </h3>
                  </div>
              </div>
          </div>

          {/* 3. Horizontal Scroll "Vibes" */}
          <div>
              <h4 className="px-2 text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500" /> {t('shop_by_vibe')}
              </h4>
              <div className="flex overflow-x-auto gap-3 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                  {[
                      { title: t('vibe_street'), img: "/carousel_men_2.png" },
                      { title: t('vibe_vintage'), img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400" }, // Keeping one Unsplash but a known one if possible, otherwise use local
                      { title: t('vibe_classy'), img: "/hero_men_fashion.png" },
                      { title: t('vibe_sport'), img: "/men_sport_fashion.png" }
                  ].map((vibe, i) => (
                      <div key={i} className="min-w-[120px] h-[160px] rounded-2xl relative overflow-hidden flex-shrink-0 active:scale-95 transition-transform" onClick={() => navigate('/catalogue')}>
                          <img src={vibe.img} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30"></div>
                          <span className="absolute bottom-3 left-3 font-bold text-white text-sm">{vibe.title}</span>
                      </div>
                  ))}
              </div>
          </div>



      </div>

      {/* Desktop Features Grid (Hidden on Mobile) */}
      <div className="hidden md:block container mx-auto px-4 py-8 md:py-24">
          <div className="grid grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                  <div key={idx} className="bg-slate-50/50 dark:bg-slate-800/50 p-8 rounded-3xl border border-white dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-2xl hover:shadow-slate-200/80 dark:hover:shadow-slate-900/80 transition-all group md:hover:-translate-y-2 text-left relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-gradient-to-br from-slate-100 dark:from-slate-700 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="w-16 h-16 bg-white dark:bg-slate-700 shadow-lg text-slate-900 dark:text-white rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300 ring-1 ring-slate-100 dark:ring-slate-600 relative z-10">
                          <feature.icon size={20} className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="relative z-10">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">{feature.title}</h3>
                          <p className="text-slate-500 dark:text-slate-400 leading-snug font-medium text-base">{feature.desc}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* CTA Section (Desktop Only) */}
      <div className="hidden md:block container mx-auto px-4 py-8 md:py-24">
          <div className="bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-slate-900 rounded-[3rem] p-24 text-center text-white relative overflow-hidden shadow-2xl group border border-white/10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
              
              {/* Gradient Orbs */}
              <div className="hidden md:block absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] group-hover:bg-indigo-500/30 transition-colors duration-1000"></div>
              <div className="hidden md:block absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] group-hover:bg-purple-500/30 transition-colors duration-1000"></div>
              
              <div className="relative z-10 max-w-4xl mx-auto space-y-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 animate-bounce-slow">
                     <Sparkles size={18} className="w-8 h-8 text-yellow-300" />
                  </div>
                  
                  <h2 className="text-7xl font-black leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                      {t('ctaTitle')}
                  </h2>
                  <p className="text-indigo-100 text-2xl leading-relaxed font-light max-w-2xl mx-auto hidden md:block">
                      {t('ctaDesc')}
                  </p>
                  <button 
                     onClick={() => navigate('/catalogue')}
                     className="w-full sm:w-auto bg-white text-slate-950 px-6 py-3 md:px-12 md:py-5 rounded-full font-bold text-base md:text-xl hover:bg-indigo-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] active:scale-95 inline-flex items-center justify-center gap-2 transform hover:-translate-y-1"
                  >
                      {t('shopNow')} <ArrowRight size={18} className="md:w-6 md:h-6" />
                  </button>
              </div>
          </div>
      </div>

      {/* Footer */}
      <footer id="footer" className="relative mt-0 bg-black text-slate-400 pt-8 pb-6 md:pb-12 md:pt-24 overflow-hidden font-sans">
         {/* Decorative Top Border */}
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
         
         <div className="container mx-auto px-6 relative z-10">
             <div className="grid lg:grid-cols-2 gap-8 md:gap-20 items-start">
                 
                 {/* Left: Brand & Info */}
                 <div className="space-y-6 md:space-y-10">
                     <div className="flex items-center gap-3 md:gap-6">
                        <img src="/clc_logo.png" alt={config.storeName} className="w-8 h-8 md:w-20 md:h-20 rounded-lg md:rounded-3xl shadow-md object-cover" />
                        <div>
                            <h3 className="text-base md:text-3xl font-bold tracking-tighter text-white leading-none mb-0.5 md:mb-2">
                                CityLike<span className="text-primary-600">Collection</span>
                            </h3>
                            <p className="text-slate-500 text-[10px] md:text-sm font-bold tracking-[0.2em] uppercase">{t('exclusiveMensWear')}</p>
                        </div>
                     </div>

                     {/* Mobile Map (New) */}
                     <div className="md:hidden w-full h-48 rounded-2xl overflow-hidden border border-slate-800 shadow-lg relative bg-slate-900 mt-4">
                           <iframe 
                             width="100%" 
                             height="100%" 
                             title="Mobile Footer Map"
                             frameBorder="0" 
                             scrolling="no" 
                             marginHeight="0" 
                             marginWidth="0" 
                             src={`https://maps.google.com/maps?q=${config.location.lat},${config.location.lng}+(${encodeURIComponent(config.storeName || 'City Like collections')})&z=18&output=embed&iwloc=B`}
                             referrerPolicy="no-referrer-when-downgrade"
                             className="w-full h-full grayscale-0"
                           ></iframe>
                     </div>
                     
                     <p className="text-slate-400 leading-relaxed max-w-md text-sm md:text-lg font-light hidden md:block">
                         {t('footerDesc')}
                     </p>
                     
                     {/* Desktop Contact Stack (Hidden Mobile) */}
                     <div className="hidden md:block space-y-5 pt-2">
                         {/* Location */}
                         <div className="flex items-start gap-5 p-5 rounded-3xl bg-slate-900/30 border border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/50 transition-all group">
                             <div className="p-3.5 rounded-2xl bg-slate-800 text-primary-400 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-white/5">
                                <MapPin size={24} className="shrink-0" />
                             </div>
                             <div>
                                 <h4 className="text-white font-bold mb-0.5">{t('ourLocation')}</h4>
                                 <p className="text-slate-400 leading-snug">{config.address}</p>
                             </div>
                         </div>

                         {/* Phone */}
                         {(config.whatsapp || config.alternateMobile) && (
                            <div className="flex items-start gap-5 p-5 rounded-3xl bg-slate-900/30 border border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/50 transition-all group">
                                <div className="p-3.5 rounded-2xl bg-slate-800 text-green-400 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-white/5">
                                   <Phone size={24} className="shrink-0" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-bold mb-0.5">{t('contactUs')}</h4>
                                    <div className="text-slate-400 flex flex-col gap-0.5">
                                        {config.whatsapp && <span>+91 {config.whatsapp}</span>}
                                        {config.alternateMobile && <span>Alt: {config.alternateMobile}</span>}
                                    </div>
                                </div>
                            </div>
                         )}
                        
                         {/* Owner */}
                         {config.ownerName && (
                            <div className="flex items-start gap-5 p-5 rounded-3xl bg-slate-900/30 border border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/50 transition-all group">
                                <div className="p-3.5 rounded-2xl bg-slate-800 text-yellow-500 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-white/5">
                                   <User size={24} className="shrink-0" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">{t('owner') || 'Owner'}</h4>
                                    <p className="text-slate-400 leading-snug">{config.ownerName}</p>
                                </div>
                            </div>
                         )}
                     </div>

                     {/* Mobile Compact Contact (Improved) */}
                     <div className="md:hidden grid grid-cols-1 gap-3 text-sm">
                        <a href={config.googleMapsLink} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 transition-colors">
                            <MapPin size={18} className="shrink-0 text-primary-500" />
                            <span className="text-slate-300 leading-tight text-xs">{config.address}</span>
                        </a>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {config.whatsapp && (
                                <a href={`https://wa.me/91${config.whatsapp}`} className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 transition-colors">
                                    <Phone size={18} className="shrink-0 text-green-500" />
                                    <span className="text-slate-300 text-xs truncate">+91 {config.whatsapp}</span>
                                </a>
                            )}
                            {config.alternateMobile && (
                                <a href={`tel:${config.alternateMobile}`} className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800 transition-colors">
                                    <Phone size={18} className="shrink-0 text-blue-400" />
                                    <span className="text-slate-300 text-xs truncate">{config.alternateMobile}</span>
                                </a>
                            )}
                             {config.ownerName && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                                    <User size={18} className="shrink-0 text-yellow-500" />
                                    <span className="text-slate-300 text-xs truncate">{config.ownerName}</span>
                                </div>
                            )}
                        </div>
                     </div>

                     <div className="flex gap-4 pt-2 md:pt-6 justify-center md:justify-start">
                         {config.socials?.instagram && <a href={config.socials.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-transparent transition-all shadow-lg hover:shadow-purple-500/20 hover:-translate-y-2"><Instagram size={18} className="md:w-6 md:h-6" /></a>}
                         {config.socials?.facebook && <a href={config.socials.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-transparent transition-all shadow-lg hover:shadow-blue-500/20 hover:-translate-y-2"><Facebook size={18} className="md:w-6 md:h-6" /></a>}
                         {config.socials?.youtube && <a href={config.socials.youtube} target="_blank" rel="noreferrer" className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-red-600 hover:text-white hover:border-transparent transition-all shadow-lg hover:shadow-red-500/20 hover:-translate-y-2"><Youtube size={18} className="md:w-6 md:h-6" /></a>}
                     </div>
                 </div>

                 {/* Right: Map (Desktop Only) */}
                 <div className="hidden md:block relative lg:pl-10 mt-8 lg:mt-0">
                      <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full translate-x-20"></div>
                      <div className="h-[450px] w-full rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl relative bg-slate-900 group z-10">
                           <iframe 
                             width="100%" 
                             height="100%" 
                             title="Footer Map"
                             frameBorder="0" 
                             scrolling="no" 
                             marginHeight="0" 
                             marginWidth="0" 
                             src={`https://maps.google.com/maps?cid=${config.cid || '5610932246588432477'}&z=18&output=embed&iwloc=B`}
                             referrerPolicy="no-referrer-when-downgrade"
                             className="w-full h-full grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                           ></iframe>
                           <a 
                             href={config.googleMapsLink} 
                             target="_blank" 
                             rel="noreferrer" 
                             className="absolute bottom-6 right-6 bg-white text-slate-900 text-sm font-bold px-6 py-3 rounded-full shadow-xl flex items-center gap-2 hover:bg-slate-100 hover:scale-105 transition-all transform translate-y-full group-hover:translate-y-0 duration-500"
                           >
                               Open Larger Map <ArrowRight size={14} className="w-4 h-4" />
                           </a>
                      </div>
                      <div className="mt-8 flex items-center justify-center lg:justify-end gap-2 text-slate-500 text-sm font-medium">
                          <MapIcon size={18} /> {t('locateUs')}
                      </div>
                 </div>
             </div>


         </div>
      </footer>

      {/* Lightbox - Duplicated from Catalogue for consistent UX */}
      {selectedImage && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm select-none" onClick={() => setSelectedImage(null)}>
            
            <button className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50" onClick={() => setSelectedImage(null)}>
                <X size={24} />
            </button>

            {selectedImage.images.length > 1 && (
                <>
                    {/* Desktop Navigation Arrows */}
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

                    {/* Mobile & Desktop Thumbnails */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4 z-50 overflow-x-auto py-2">
                        {selectedImage.images.map((img, idx) => (
                             <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(prev => ({ ...prev, index: idx }));
                                }}
                                className={`w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 overflow-hidden transition-all flex-shrink-0 ${selectedImage.index === idx ? 'border-primary-500 scale-110 opacity-100' : 'border-white/40 opacity-50 hover:opacity-100 hover:border-white'}`}
                             >
                                 <img src={img} className="w-full h-full object-cover" alt={`View ${idx + 1}`} />
                             </button>
                        ))}
                    </div>
                </>
            )}

            <div 
                className="relative w-full h-full flex flex-col items-center justify-center pb-20 md:pb-0" 
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => {
                    e.stopPropagation();
                    setTouchStart(e.targetTouches[0].clientX);
                    setTouchEnd(null);
                }}
                onTouchMove={(e) => {
                    e.stopPropagation();
                    setTouchEnd(e.targetTouches[0].clientX);
                }}
                onTouchEnd={(e) => {
                    e.stopPropagation();
                    if (!touchStart || !touchEnd) return;
                    const distance = touchStart - touchEnd;
                    const minSwipeDistance = 50;
                    
                    if (distance > minSwipeDistance) {
                        // Swipe Left -> Next
                         if (selectedImage.images.length > 1) {
                            setSelectedImage(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }));
                         }
                    } else if (distance < -minSwipeDistance) {
                        // Swipe Right -> Prev
                         if (selectedImage.images.length > 1) {
                            setSelectedImage(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }));
                         }
                    }
                }}
            >
                <img 
                    src={selectedImage.images[selectedImage.index]} 
                    className="max-w-[95vw] max-h-[70vh] md:max-h-[85vh] object-contain rounded-lg shadow-2xl animate-fade-in touch-none select-none" 
                    alt="Full View" 
                    draggable="false"
                />
            </div>
        </div>, document.body
      )}
    </div>
  );
};

export default Home;
