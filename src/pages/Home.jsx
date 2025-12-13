import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, ShoppingBag, MapPin, ArrowRight, Instagram, Facebook, Youtube, X, Map as MapIcon, Phone, Search, Shirt, Footprints, Watch, Star, TrendingUp, Sparkles, Tag, Package, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';

const Home = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // No longer fetching products
  
  const [config, setConfig] = useState({
    whatsapp: '',
    storeName: 'City Like Collection',
    location: { lat: 23.0308542, lng: 86.3613231 },
    googleMapsLink: 'https://www.google.com/maps/place/City+Life+collection/@23.0307752,86.3613507,20z/data=!4m6!3m5!1s0x39f673bf624dbeed:0x4dde092678b0205d!8m2!3d23.0308542!4d86.3613231!16s%2Fg%2F11y412pm3s?entry=ttu&g_ep=EgoyMDI1MTIwOC4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D',
    cid: '5610898517208768605',
    address: 'Khawasdih, Barabazar, West Bengal 723127',
    isOpen: true,
    ownerName: '',
    alternateMobile: '',
    socials: { instagram: '', facebook: '', youtube: '' }
  });
  const [mobileSearch, setMobileSearch] = useState('');

  useEffect(() => {
    const savedConfig = localStorage.getItem('clc_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));

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

    fetchSettings();
    
    // Subscriptions for settings only
    const settingsChannel = supabase.channel('public:store_settings:home').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_settings', filter: 'id=eq.1' }, (payload) => setConfig(prev => ({ ...prev, isOpen: payload.new.is_open, noticeMessage: payload.new.notice_message, showNotice: payload.new.show_notice }))).subscribe();

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

  return (
    <div className="pb-24 md:pb-0 animate-fade-in min-h-screen bg-slate-50 selection:bg-purple-100 selection:text-purple-900">
      
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
      <div className="bg-slate-50 border-b border-slate-100 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
        
        {/* Animated Background Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
           <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
               <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md text-alert shadow-sm border border-slate-200/60 hover:border-slate-300 transition-colors cursor-default mb-4">
                       <span className="relative flex h-3 w-3">
                         <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                         <span className={`relative inline-flex rounded-full h-3 w-3 ${config.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                       </span>
                       <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                            {config.isOpen ? t('storeOpen') : t('storeClosed')}
                       </span>
                   </div>
                   
                   <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight">
                       {t('heroTitle1')} <br />
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 animate-gradient-x">
                           {t('heroTitle2')}
                       </span>
                   </h1>
                   
                   <p className="text-lg md:text-2xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light tracking-wide">
                       {t('heroSubtitle') || "Explore our exclusive collection of premium mens clothing tailored to perfection. Elevate your wardrobe with City Like Collection."}
                   </p>
                   
                   <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
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
                            className="px-8 py-4 rounded-full font-bold text-lg bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
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

      {/* Shop By Category */}
      <div className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24 border-y border-slate-100 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          
          <div className="container mx-auto px-4">
              <div className="text-center mb-10 md:mb-16 relative">
                  <span className="text-primary-600 font-bold uppercase tracking-widest text-xs bg-white px-4 py-1.5 rounded-full border border-primary-100 mb-4 md:mb-6 inline-block shadow-sm">
                      {t('curatedCollections')}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6 tracking-tight">{t('shopByCategory')}</h2>
                  <p className="text-slate-500 max-w-2xl mx-auto text-lg md:text-xl font-light">
                      {t('shopByCategoryDesc')}
                  </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {categories.map((cat) => (
                    <div 
                        key={cat.name}
                        onClick={() => navigate(`/catalogue?category=${cat.name}`)}
                        className="group relative overflow-hidden rounded-2xl md:rounded-[2rem] cursor-pointer aspect-[3/4] shadow-md hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-500 bg-slate-100 ring-1 ring-black/5"
                    >
                        <img 
                            src={cat.image} 
                            alt={cat.label} 
                            className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                        
                        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-8 text-left z-10">
                            <h3 className="text-xl md:text-3xl font-black text-white mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 tracking-tight">{cat.label}</h3>
                            <p className="text-slate-200 font-medium text-xs md:text-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75 hidden md:block">
                                {cat.description}
                            </p>
                            <div className="mt-2 md:mt-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-150">
                                <span className="inline-flex items-center gap-2 text-white font-bold text-[10px] md:text-sm bg-white/20 backdrop-blur-md border border-white/40 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all shadow-lg">
                                    {t('shopNow')} <ArrowRight size={14} className="md:w-4 md:h-4" />
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
              </div>
              
              <div className="mt-12 md:mt-20 text-center">
                  <button 
                    onClick={() => navigate('/catalogue')}
                    className="inline-flex items-center gap-3 bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 md:px-10 md:py-5 rounded-full font-bold text-base md:text-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group"
                  >
                      {t('viewFullCatalogue')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>
          </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map((feature, idx) => (
                  <div key={idx} className="bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/80 transition-all group hover:-translate-y-2 text-center md:text-left relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-gradient-to-br from-slate-100 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                      
                      <div className="w-16 h-16 mx-auto md:mx-0 bg-white shadow-lg text-slate-900 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300 ring-1 ring-slate-100 relative z-10">
                          <feature.icon size={32} className="text-primary-600" />
                      </div>
                      <div className="relative z-10">
                          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">{feature.title}</h3>
                          <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 text-center text-white relative overflow-hidden shadow-2xl group border border-white/10">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
              
              {/* Gradient Orbs */}
              <div className="hidden md:block absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] group-hover:bg-indigo-500/30 transition-colors duration-1000"></div>
              <div className="hidden md:block absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] group-hover:bg-purple-500/30 transition-colors duration-1000"></div>
              
              <div className="relative z-10 max-w-4xl mx-auto space-y-8 md:space-y-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-2 md:mb-4 animate-bounce-slow">
                     <Sparkles size={24} className="md:w-8 md:h-8 text-yellow-300" />
                  </div>
                  
                  <h2 className="text-3xl md:text-7xl font-black leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                      {t('ctaTitle')}
                  </h2>
                  <p className="text-indigo-100 text-lg md:text-2xl leading-relaxed font-light max-w-2xl mx-auto">
                      {t('ctaDesc')}
                  </p>
                  <button 
                     onClick={() => navigate('/catalogue')}
                     className="bg-white text-slate-950 px-10 py-4 md:px-12 md:py-5 rounded-full font-bold text-lg md:text-xl hover:bg-indigo-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] active:scale-95 inline-flex items-center gap-2 transform hover:-translate-y-1"
                  >
                      {t('shopNow')} <ArrowRight size={20} className="md:w-6 md:h-6" />
                  </button>
              </div>
          </div>
      </div>

      {/* Footer */}
      <footer id="footer" className="relative mt-0 bg-black text-slate-400 pt-16 md:pt-24 pb-12 overflow-hidden font-sans">
         {/* Decorative Top Border */}
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
         
         <div className="container mx-auto px-6 relative z-10">
             <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-start">
                 
                 {/* Left: Brand & Info */}
                 <div className="space-y-8 md:space-y-10">
                     <div className="flex items-center gap-4 md:gap-6">
                        <img src="/pwa-192x192.png" alt={config.storeName} className="w-16 h-16 md:w-20 md:h-20 rounded-3xl shadow-2xl border-2 border-slate-800/50 object-cover" />
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none mb-1 md:mb-2">{config.storeName}</h3>
                            <p className="text-slate-500 text-xs md:text-sm font-bold tracking-[0.2em] uppercase">{t('exclusiveMensWear')}</p>
                        </div>
                     </div>
                     
                     <p className="text-slate-400 leading-relaxed max-w-md text-base md:text-lg font-light">
                         {t('footerDesc')}
                     </p>
                     
                     <div className="space-y-4 md:space-y-5 pt-4">
                         <div className="flex items-start gap-4 md:gap-5 p-4 md:p-5 rounded-3xl bg-slate-900/30 border border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/50 transition-all group">
                             <div className="p-3 md:p-3.5 rounded-2xl bg-slate-800 text-primary-400 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-white/5">
                                <MapPin size={20} className="md:w-6 md:h-6" />
                             </div>
                             <div>
                                 <h4 className="text-white font-bold mb-1">{t('ourLocation')}</h4>
                                 <p className="text-sm md:text-base text-slate-400 leading-snug">{config.address}</p>
                             </div>
                         </div>

                         {(config.whatsapp || config.alternateMobile) && (
                            <div className="flex items-start gap-4 md:gap-5 p-4 md:p-5 rounded-3xl bg-slate-900/30 border border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/50 transition-all group">
                                <div className="p-3 md:p-3.5 rounded-2xl bg-slate-800 text-green-400 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-white/5">
                                   <Phone size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">{t('contactUs')}</h4>
                                    <div className="text-sm md:text-base text-slate-400 flex flex-col gap-1">
                                        {config.whatsapp && <span>WhatsApp: +91 {config.whatsapp}</span>}
                                        {config.alternateMobile && <span>Call: {config.alternateMobile}</span>}
                                    </div>
                                </div>
                            </div>
                         )}

                         {config.ownerName && (
                            <div className="flex items-start gap-4 md:gap-5 p-4 md:p-5 rounded-3xl bg-slate-900/30 border border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/50 transition-all group">
                                <div className="p-3 md:p-3.5 rounded-2xl bg-slate-800 text-yellow-500 group-hover:scale-110 transition-transform shadow-inner ring-1 ring-white/5">
                                   <User size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">{t('owner') || 'Owner'}</h4>
                                    <p className="text-sm md:text-base text-slate-400 leading-snug">{config.ownerName}</p>
                                </div>
                            </div>
                         )}
                     </div>

                     <div className="flex gap-4 pt-6">
                         {config.socials?.instagram && <a href={config.socials.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-transparent transition-all shadow-lg hover:shadow-purple-500/20 hover:-translate-y-2"><Instagram size={20} className="md:w-6 md:h-6" /></a>}
                         {config.socials?.facebook && <a href={config.socials.facebook} target="_blank" rel="noreferrer" className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-transparent transition-all shadow-lg hover:shadow-blue-500/20 hover:-translate-y-2"><Facebook size={20} className="md:w-6 md:h-6" /></a>}
                         {config.socials?.youtube && <a href={config.socials.youtube} target="_blank" rel="noreferrer" className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-red-600 hover:text-white hover:border-transparent transition-all shadow-lg hover:shadow-red-500/20 hover:-translate-y-2"><Youtube size={20} className="md:w-6 md:h-6" /></a>}
                     </div>
                 </div>

                 {/* Right: Map */}
                 <div className="relative lg:pl-10">
                      <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full translate-x-20"></div>
                      <div className="h-[300px] md:h-[450px] w-full rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl relative bg-slate-900 group z-10">
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
                             className="w-full h-full grayscale-[100%] invert-[.9] hover:grayscale-0 hover:invert-0 transition-all duration-700"
                           ></iframe>
                           <a 
                             href={config.googleMapsLink} 
                             target="_blank" 
                             rel="noreferrer" 
                             className="absolute bottom-6 right-6 bg-white text-slate-900 text-xs md:text-sm font-bold px-4 md:px-6 py-2 md:py-3 rounded-full shadow-xl flex items-center gap-2 hover:bg-slate-100 hover:scale-105 transition-all transform translate-y-full group-hover:translate-y-0 duration-500"
                           >
                               Open Larger Map <ArrowRight size={16} />
                           </a>
                      </div>
                      <div className="mt-8 flex items-center justify-center lg:justify-end gap-2 text-slate-500 text-sm font-medium">
                          <MapIcon size={18} /> {t('locateUs')}
                      </div>
                 </div>
             </div>

             <div className="border-t border-slate-900 mt-16 md:mt-24 pt-10 text-center">
                 <p className="text-slate-600 text-sm">
                     © {new Date().getFullYear()} <span className="text-slate-300 font-bold tracking-wide">{config.storeName}</span>. {t('rightsReserved')}
                 </p>
             </div>
         </div>
      </footer>
    </div>
  );
};

export default Home;
