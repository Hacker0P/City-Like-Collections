import React, { useState, useEffect } from 'react';
import { Settings, Save, MapPin, Instagram, Facebook, Youtube, CheckCircle, X, LogOut, Globe, User, Phone, Briefcase, Store, Navigation, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [config, setConfig] = useState({ 
    whatsapp: '', 
    storeName: 'City Like Collection', 
    location: { lat: 23.0308542, lng: 86.3613231 },
    googleMapsLink: 'https://www.google.com/maps/place/City+Like+collection/@23.0307752,86.3613507,20z/data=!4m6!3m5!1s0x39f673bf624dbeed:0x4dde092678b0205d!8m2!3d23.0308542!4d86.3613231!16s%2Fg%2F11y412pm3s?entry=ttu&g_ep=EgoyMDI1MTIwOC4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D',
    cid: '5610898517208768605',
    address: 'Khawasdih, Barabazar, West Bengal 723127',
    isOpen: true,
    noticeMessage: '',
    showNotice: false,
    ownerName: '',
    alternateMobile: '',
    socials: { instagram: '', facebook: '', youtube: '' }
  });

  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const performLogout = async () => {
        // Manually clear local storage to force logout
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                localStorage.removeItem(key);
            }
        });
        window.location.href = '/login';
        return;
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const savedConfig = localStorage.getItem('clc_config');
    if (savedConfig) setConfig(prev => ({ ...prev, ...JSON.parse(savedConfig) }));

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
                }
            }));
        }
    };
    fetchSettings();
  }, []);

  const handleConfigSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Save to LocalStorage (This is the primary source for contact info now)
    localStorage.setItem('clc_config', JSON.stringify(config));
    window.dispatchEvent(new Event('storage'));

    // Save to Supabase
    try {
        const { error } = await supabase.from('store_settings').update({ 
            owner_name: config.ownerName,
            whatsapp_number: config.whatsapp,
            mobile_number: config.alternateMobile,
            instagram_url: config.socials?.instagram,
            facebook_url: config.socials?.facebook,
            youtube_url: config.socials?.youtube,
            updated_at: new Date()
        }).eq('id', 1);

        if (error) throw error;
        setToast({ message: 'Profile details saved successfully!', type: 'success' });
    } catch (error) {
        console.error("Error saving to supabase:", error);
        setToast({ message: 'Saved locally. (Server sync failed)', type: 'warning' });
    } finally {
        setSaving(false);
    }
  };

  const handleLocationChange = (field, value) => {
     setConfig(prev => ({ ...prev, location: { ...prev.location, [field]: value } }));
  };

  const toggleNotice = async () => {
    const newShowNotice = !config.showNotice;
    setConfig(prev => ({ ...prev, showNotice: newShowNotice }));
    const { error } = await supabase.from('store_settings').update({ show_notice: newShowNotice }).eq('id', 1);
    if (error) console.error("Error updating notice visibility:", error);
  };

  const handleNoticeChange = async (e) => {
    const newVal = e.target.value;
    setConfig(prev => ({ ...prev, noticeMessage: newVal }));
    const { error } = await supabase.from('store_settings').update({ notice_message: newVal }).eq('id', 1);
    if (error) console.error("Error updating notice message:", error);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 md:pb-12">
      {/* Top Background Decoration */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-primary-50/50 to-transparent -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100/50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm md:mx-0 mx-auto">
                <User size={14} /> <span>{t('profile_title')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3">
              {config.storeName || 'Store Profile'}
            </h1>
            <p className="text-slate-500 text-base md:text-lg font-medium max-w-xl md:mx-0 mx-auto leading-relaxed">
              {t('profile_subtitle')}
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-3">
             <button 
                type="button" 
                onClick={handleLogoutClick}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-100 hover:shadow-sm transition-all text-sm"
            >
                <LogOut size={18} className="transition-transform group-hover:-translate-x-1" /> 
                <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
          {/* Left Column: Settings Form */}
          <div className="lg:col-span-8 space-y-6">
              
            <form onSubmit={handleConfigSave} className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                
                {/* Section Header */}
                <div className="bg-slate-50/50 px-6 py-5 md:px-8 border-b border-slate-100 flex items-center justify-between backdrop-blur-sm">
                    <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white shadow-sm border border-slate-100 text-primary-600 flex items-center justify-center">
                            <Settings size={20} className="md:w-6 md:h-6" />
                        </div>
                        {t('profile_generalConfig')}
                    </h3>
                </div>
                
                <div className="p-6 md:p-8 space-y-8 md:space-y-10">

                    {/* Language Settings */}
                    <section>
                        <div className="flex items-center gap-4 mb-4">
                            <h4 className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2">
                                    <Globe className="text-slate-400" size={20} /> {t('profile_appLanguage')}
                            </h4>
                            <div className="h-px bg-slate-100 flex-1"></div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-1.5 flex border border-slate-200/50 max-w-sm">
                            <button 
                                type="button"
                                onClick={() => language !== 'en' && toggleLanguage()}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${language === 'en' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                English
                            </button>
                            <button 
                                type="button"
                                onClick={() => language !== 'bn' && toggleLanguage()}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${language === 'bn' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                বাংলা
                            </button>
                        </div>
                    </section>

                    {/* Store Notice Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-slate-900 font-bold text-base md:text-lg flex items-center gap-2">
                                📣 {t('profile_noticeBanner')}
                            </label>
                            
                            <button 
                                type="button"
                                onClick={toggleNotice}
                                className={`group flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer select-none ${config.showNotice ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}
                            >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${config.showNotice ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                    {config.showNotice ? <CheckCircle size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
                                </div>
                                {config.showNotice ? t('profile_visible') : t('profile_hidden')}
                            </button>
                        </div>
                        
                        <div className={`relative transition-all duration-300 rounded-xl md:rounded-2xl p-1 border-2 group focus-within:ring-4 focus-within:ring-primary-500/10 ${config.showNotice ? 'border-orange-100 bg-orange-50/30' : 'border-slate-100 bg-slate-50'}`}>
                            <div className="absolute top-3.5 left-4 text-slate-400 pointer-events-none group-focus-within:text-orange-500 transition-colors">
                                <span className="text-xl">✍️</span>
                            </div>
                            <input 
                                type="text" 
                                className="w-full pl-12 pr-4 py-3 bg-white/50 rounded-lg md:rounded-xl outline-none text-slate-700 font-medium placeholder:text-slate-300 transition-all bg-transparent border-none text-base" 
                                placeholder={t('profile_noticePlaceholder')}
                                value={config.noticeMessage || ''}
                                onChange={handleNoticeChange}
                            />
                        </div>
                        <p className="text-slate-400 text-xs md:text-sm mt-2 ml-1">
                            {t('profile_noticeHint')}
                        </p>
                    </section>

                    {/* Identity */}
                    <section>
                        <div className="flex items-center gap-4 mb-5">
                            <h4 className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2">
                                    <Store className="text-slate-400" size={20} /> {t('profile_storeIdentity')}
                            </h4>
                            <div className="h-px bg-slate-100 flex-1"></div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 mb-2 ml-1 transition-colors group-focus-within:text-primary-600">{t('profile_brandName')}</label>
                                <div className="relative">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input 
                                        type="text" 
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-semibold text-slate-700 text-base placeholder:text-slate-300" 
                                        value={config.storeName}
                                        onChange={e => setConfig({...config, storeName: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 mb-2 ml-1 transition-colors group-focus-within:text-primary-600">{t('profile_ownerName')}</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input 
                                        type="text" 
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-semibold text-slate-700 text-base placeholder:text-slate-300" 
                                        placeholder="e.g. Rahul Kumar"
                                        value={config.ownerName || ''}
                                        onChange={e => setConfig({...config, ownerName: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section>
                        <div className="flex items-center gap-4 mb-5">
                            <h4 className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2">
                                    <Phone className="text-slate-400" size={20} /> {t('profile_contactInfo')}
                            </h4>
                            <div className="h-px bg-slate-100 flex-1"></div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 mb-2 ml-1 transition-colors group-focus-within:text-primary-600">{t('profile_whatsapp')}</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none font-bold border-r border-slate-300 pr-2 mr-2 text-sm">
                                        +91
                                    </div>
                                    <input 
                                        type="tel" 
                                        className="w-full pl-[4.5rem] pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold tracking-wide text-slate-700 text-base placeholder:text-slate-300" 
                                        placeholder="XXXXXXXXXX"
                                        value={config.whatsapp}
                                        onChange={e => setConfig({...config, whatsapp: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 mb-2 ml-1 transition-colors group-focus-within:text-primary-600">{t('profile_alternate')}</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none font-bold border-r border-slate-300 pr-2 mr-2 text-sm">
                                        +91
                                    </div>
                                    <input 
                                        type="tel" 
                                        className="w-full pl-[4.5rem] pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold tracking-wide text-slate-700 text-base placeholder:text-slate-300" 
                                        placeholder="XXXXXXXXXX"
                                        value={config.alternateMobile || ''}
                                        onChange={e => setConfig({...config, alternateMobile: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Location */}
                    <section>
                        <div className="flex items-center gap-4 mb-5">
                            <h4 className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2">
                                    <MapPin className="text-slate-400" size={20} /> {t('profile_locationDetails')}
                            </h4>
                            <div className="h-px bg-slate-100 flex-1"></div>
                        </div>

                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 mb-2 ml-1 transition-colors group-focus-within:text-primary-600">{t('profile_address')}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <textarea 
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-slate-700 min-h-[80px] text-base placeholder:text-slate-300 resize-y" 
                                        placeholder="Full address displaying on home page"
                                        value={config.address || ''}
                                        onChange={e => setConfig({...config, address: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                                <h5 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Navigation className="text-primary-600" size={16} /> Advanced Coordinates
                                </h5>
                                
                                <div className="space-y-4">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">{t('profile_mapsLink')}</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none transition-all text-base md:text-sm font-medium placeholder:text-slate-300" 
                                            placeholder="https://maps.google.com/..."
                                            value={config.googleMapsLink || ''}
                                            onChange={e => setConfig({...config, googleMapsLink: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-4">
                                            <div className="group">
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">{t('profile_cid')}</label>
                                            <input 
                                                type="text" 
                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none transition-all text-base md:text-sm font-medium placeholder:text-slate-300" 
                                                placeholder="e.g. 5610898517208768605"
                                                value={config.cid || ''}
                                                onChange={e => setConfig({...config, cid: e.target.value})}
                                            />
                                            </div>
                                            <div className="group">
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">{t('profile_coordinates')}</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input 
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none transition-all text-base md:text-sm font-medium placeholder:text-slate-300" 
                                                    placeholder="Lat" 
                                                    type="number" 
                                                    step="any"
                                                    value={config.location?.lat || ''}
                                                    onChange={e => handleLocationChange('lat', e.target.value)}
                                                />
                                                <input 
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 outline-none transition-all text-base md:text-sm font-medium placeholder:text-slate-300" 
                                                    placeholder="Lng" 
                                                    type="number" 
                                                    step="any"
                                                    value={config.location?.lng || ''}
                                                    onChange={e => handleLocationChange('lng', e.target.value)}
                                                />
                                            </div>
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>


                    {/* Socials */}
                    <section>
                        <div className="flex items-center gap-4 mb-5">
                            <h4 className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2">
                                    Share Your Socials
                            </h4>
                            <div className="h-px bg-slate-100 flex-1"></div>
                        </div>
                        <div className="grid md:grid-cols-1 gap-4">
                            <div className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100 flex-shrink-0 group-focus-within:bg-pink-100 group-focus-within:scale-110 transition-all duration-300">
                                    <Instagram size={20} />
                                </div>
                                <input 
                                    type="text" 
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all font-medium text-slate-700 text-base placeholder:text-slate-300" 
                                    placeholder="Instagram Profile URL"
                                    value={config.socials?.instagram || ''}
                                    onChange={e => setConfig({ ...config, socials: { ...config.socials, instagram: e.target.value } })}
                                />
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0 group-focus-within:bg-blue-100 group-focus-within:scale-110 transition-all duration-300">
                                    <Facebook size={20} />
                                </div>
                                <input 
                                    type="text" 
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700 text-base placeholder:text-slate-300" 
                                    placeholder="Facebook Page URL"
                                    value={config.socials?.facebook || ''}
                                    onChange={e => setConfig({ ...config, socials: { ...config.socials, facebook: e.target.value } })}
                                />
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 flex-shrink-0 group-focus-within:bg-red-100 group-focus-within:scale-110 transition-all duration-300">
                                    <Youtube size={20} />
                                </div>
                                <input 
                                    type="text" 
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium text-slate-700 text-base placeholder:text-slate-300" 
                                    placeholder="YouTube Channel URL"
                                    value={config.socials?.youtube || ''}
                                    onChange={e => setConfig({ ...config, socials: { ...config.socials, youtube: e.target.value } })}
                                />
                            </div>
                        </div>
                    </section>
                
                    {/* Spacer for bottom bar */}
                    <div className="h-20 md:hidden"></div>
                </div>

                {/* Sticky Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-200 z-50 md:sticky md:bottom-0 md:bg-gray-50/50 md:border-t md:border-slate-100">
                    <div className="container mx-auto flex items-center justify-between px-0 md:px-4 max-w-7xl">
                        <div className="hidden md:block text-slate-400 text-xs font-medium">
                            {saving ? 'Syncing to cloud...' : 'Last synced just now'}
                        </div>
                        <button 
                            className="w-full md:w-auto bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
                            type="button" 
                            onClick={handleConfigSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('profile_saving')}</>
                            ) : (
                                <><Save size={20} /> {t('profile_save')}</>
                            )}
                        </button>
                    </div>
                </div>
            </form>
          </div>

          {/* Right Column: Map & Extras */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
              
            {/* Map Card */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="p-5 md:p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <MapPin className="text-primary-600" size={20} /> {t('profile_mapPreview')}
                    </h3>
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                        {t('profile_mapHint')}
                    </p>
                </div>
                
                <div className="p-5 md:p-6 bg-slate-50">
                    <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden border-4 border-white shadow-xl shadow-slate-200/50 bg-slate-100 relative group">
                        {(config.location?.lat && config.location?.lng) ? (
                            <>
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    title="Map Preview"
                                    frameBorder="0" 
                                    scrolling="no"
                                    marginHeight="0" 
                                    marginWidth="0"
                                    src={`https://maps.google.com/maps?q=${config.location.lat},${config.location.lng}&z=15&output=embed&iwloc=B`}
                                    className="grayscale-[20%] transition-all duration-700 group-hover:grayscale-0 hover:scale-105"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                                <div className="absolute inset-0 border-4 border-black/5 rounded-2xl pointer-events-none mix-blend-multiply"></div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                                <MapPin size={32} />
                                </div>
                                <span className="font-bold text-slate-500">{t('profile_setCoordinates')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pro Tip Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
                        <span className="text-xl">💡</span>
                    </div>
                    <h4 className="font-bold text-lg mb-2">Pro Tip</h4>
                    <p className="text-indigo-100 text-sm leading-relaxed font-medium">
                        Keep your profile updated with correct contact numbers so customers can reach you easily!
                    </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
            </div>
            
          </div>

        </div>

      </div>

      {/* Toast Notification */}
      {toast && (
          <div className="fixed bottom-24 md:bottom-12 right-6 z-[100] max-w-[90vw] w-auto bg-slate-900/90 backdrop-blur-md text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up border border-slate-700 ring-1 ring-white/10">
              <div className={`p-2 rounded-full flex-shrink-0 ${toast.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {toast.type === 'success' ? <CheckCircle size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
              </div>
              <div className="flex-1 min-w-0 pr-4">
                  <h4 className="font-bold text-sm leading-tight">{toast.type === 'success' ? 'Success' : 'Notice'}</h4>
                  <p className="text-xs text-slate-300 truncate mt-0.5">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="p-1 -mr-2 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-white/10"><X size={18} /></button>
          </div>
      )}
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-up border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 mx-auto">
                    <AlertTriangle size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Logout?</h3>
                <p className="text-slate-500 text-center mb-6 leading-relaxed">
                    Are you sure you want to log out of your account? You will need to sign in again to access the store settings.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setShowLogoutConfirm(false)}
                        className="py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={performLogout}
                        className="py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-95"
                    >
                        Yes, Logout
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
