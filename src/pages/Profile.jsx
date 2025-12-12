import React, { useState, useEffect } from 'react';
import { Settings, Save, MapPin, Instagram, Facebook, Youtube, CheckCircle, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Profile = () => {
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

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

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
  }, []);

  const handleConfigSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    localStorage.setItem('clc_config', JSON.stringify(config));
    window.dispatchEvent(new Event('storage'));
    setSaving(false);
    setSaving(false);
    setToast({ message: 'Profile details saved successfully!', type: 'success' });
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
    <div className="container mx-auto px-4 py-12 mb-20">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 inline-block">Store Settings</h1>
        <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed">Manage your online presence, location details, and contact information visible to customers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 pb-4 border-b border-slate-100">
              <Settings className="text-primary-600" size={24} /> General Configuration
            </h3>
            
            <form onSubmit={handleConfigSave} className="space-y-8">
            
                {/* Store Notice Section */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-orange-800 font-bold flex items-center gap-2">
                           📢 Store Notice Banner
                        </label>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-semibold ${config.showNotice ? 'text-orange-700' : 'text-slate-400'}`}>
                                {config.showNotice ? 'Visible' : 'Hidden'}
                            </span>
                            <button 
                                type="button"
                                onClick={toggleNotice}
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${config.showNotice ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                            >
                                {config.showNotice ? 'Turn OFF' : 'Turn ON'}
                            </button>
                        </div>
                    </div>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none text-orange-900 placeholder-orange-300" 
                      placeholder="e.g. Back in 1 hour, Sale Today Only!"
                      value={config.noticeMessage || ''}
                      onChange={handleNoticeChange}
                    />
                    <p className="text-orange-600 text-sm mt-2 opacity-80">
                      This message will appear prominently at the top of the home page.
                    </p>
                </div>

                {/* Identity */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Store Brand Name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all" 
                            value={config.storeName}
                            onChange={e => setConfig({...config, storeName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Owner Name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all" 
                            placeholder="e.g. Rahul Kumar"
                            value={config.ownerName || ''}
                            onChange={e => setConfig({...config, ownerName: e.target.value})}
                        />
                    </div>
                </div>

                 {/* Contact */}
                 <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Main WhatsApp Number</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all" 
                            placeholder="e.g. 919876543210"
                            value={config.whatsapp}
                            onChange={e => setConfig({...config, whatsapp: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Alternate Mobile</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all" 
                            placeholder="e.g. 919876543210"
                            value={config.alternateMobile || ''}
                            onChange={e => setConfig({...config, alternateMobile: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Store Address</label>
                    <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all" 
                        placeholder="Full address displaying on home page"
                        value={config.address || ''}
                        onChange={e => setConfig({...config, address: e.target.value})}
                    />
                </div>
                
                {/* Location */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <MapPin className="text-primary-600" size={20} /> Location Settings
                    </h4>
                    
                    <div className="space-y-4">
                        <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Google Maps Place Link</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all" 
                            placeholder="https://maps.google.com/..."
                            value={config.googleMapsLink || ''}
                            onChange={e => setConfig({...config, googleMapsLink: e.target.value})}
                        />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Google Maps CID</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all" 
                                    placeholder="e.g. 5610898517208768605"
                                    value={config.cid || ''}
                                    onChange={e => setConfig({...config, cid: e.target.value})}
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Coordinates (Lat, Lng)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input 
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all" 
                                        placeholder="Lat" 
                                        type="number" 
                                        step="any"
                                        value={config.location?.lat || ''}
                                        onChange={e => handleLocationChange('lat', e.target.value)}
                                    />
                                    <input 
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all" 
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

                {/* Socials */}
                <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        Social Media Links
                    </h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Instagram className="text-pink-600 flex-shrink-0" size={20} />
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all" 
                                placeholder="Instagram Profile URL"
                                value={config.socials?.instagram || ''}
                                onChange={e => setConfig({ ...config, socials: { ...config.socials, instagram: e.target.value } })}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Facebook className="text-blue-600 flex-shrink-0" size={20} />
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all" 
                                placeholder="Facebook Page URL"
                                value={config.socials?.facebook || ''}
                                onChange={e => setConfig({ ...config, socials: { ...config.socials, facebook: e.target.value } })}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Youtube className="text-red-600 flex-shrink-0" size={20} />
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all" 
                                placeholder="YouTube Channel URL"
                                value={config.socials?.youtube || ''}
                                onChange={e => setConfig({ ...config, socials: { ...config.socials, youtube: e.target.value } })}
                            />
                        </div>
                    </div>
                </div>

                <div className="h-24"></div>

                <div className="fixed bottom-[58px] md:bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40 animate-slide-in-up">
                    <div className="container mx-auto flex justify-end px-4">
                        <button 
                            className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:scale-100 w-full md:w-auto justify-center"
                            type="button" 
                            onClick={handleConfigSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>

        {/* Map Preview */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Map Preview</h3>
            <p className="text-slate-500 text-sm mb-4">This is how your location will appear to customers.</p>
            <div className="aspect-square w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-200 shadow-inner">
            {(config.location?.lat && config.location?.lng) ? (
                <iframe 
                    width="100%" 
                    height="100%" 
                    title="Map Preview"
                    frameBorder="0" 
                    scrolling="no"
                    marginHeight="0" 
                    marginWidth="0"
                    src={`https://maps.google.com/maps?q=${config.location.lat},${config.location.lng}&z=15&output=embed&iwloc=B`}
                    className="grayscale-[20%]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <MapPin size={32} />
                    <span>Set coordinates</span>
                </div>
            )}
            </div>
        </div>

      </div>


      {/* Toast Notification */}
      {toast && (
          <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in-up border border-slate-700">
              <div className="bg-green-500/20 p-2 rounded-full text-green-400"><CheckCircle size={24} /></div>
              <div>
                  <h4 className="font-bold text-sm">Success</h4>
                  <p className="text-sm text-slate-300">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="ml-2 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
          </div>
      )}
    </div>
  );
};

export default Profile;
