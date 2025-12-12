import React, { useState, useEffect } from 'react';
import { Settings, Save, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Profile = () => {
  const [config, setConfig] = useState({ 
    whatsapp: '', 
    storeName: 'City Life Collection', 
    location: { lat: 23.0308542, lng: 86.3613231 },
    googleMapsLink: 'https://www.google.com/maps/place/City+Life+collection/@23.0307752,86.3613507,20z/data=!4m6!3m5!1s0x39f673bf624dbeed:0x4dde092678b0205d!8m2!3d23.0308542!4d86.3613231!16s%2Fg%2F11y412pm3s?entry=ttu&g_ep=EgoyMDI1MTIwOC4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D',
    cid: '5610898517208768605',
    address: 'Khawasdih, Barabazar, West Bengal 723127',
    isOpen: true,
    noticeMessage: '',
    showNotice: false,
    ownerName: '',
    alternateMobile: '',
    socials: {
        instagram: '',
        facebook: '',
        youtube: ''
    }
  });

  useEffect(() => {
    // 1. Fetch Local Config for other fields
    const savedConfig = localStorage.getItem('clc_config');
    if (savedConfig) setConfig(prev => ({ ...prev, ...JSON.parse(savedConfig) }));

    // 2. Fetch Supabase Settings for Notice & Status
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

  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('clc_config', JSON.stringify(newConfig));
    // We don't dispatch event here for notice as it's now handled by Supabase Realtime
    window.dispatchEvent(new Event('storage'));
  };

  const handleConfigSave = (e) => {
    e.preventDefault();
    localStorage.setItem('clc_config', JSON.stringify(config));
    window.dispatchEvent(new Event('storage'));
    alert('Profile settings saved successfully!');
  };

  const handleLocationChange = (field, value) => {
     setConfig(prev => ({
       ...prev,
       location: {
         ...prev.location,
         [field]: value
       }
     }));
  };

  // Deprecated in UI but keeping function signature if needed or remove
  const toggleShopStatus = async () => {
    // Moved to Dashboard
  };

  const toggleNotice = async () => {
    const newShowNotice = !config.showNotice;
    // Optimistic
    setConfig(prev => ({ ...prev, showNotice: newShowNotice }));
    
    const { error } = await supabase
      .from('store_settings')
      .update({ show_notice: newShowNotice })
      .eq('id', 1);
      
    if (error) console.error("Error updating notice visibility:", error);
  };

  const handleNoticeChange = async (e) => {
    const newVal = e.target.value;
    setConfig(prev => ({ ...prev, noticeMessage: newVal }));
    
    // Direct update (debouncing would be better but this is simple)
    const { error } = await supabase
        .from('store_settings')
        .update({ notice_message: newVal })
        .eq('id', 1);
        
    if (error) console.error("Error updating notice message:", error);
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px', paddingBottom: '4rem', marginTop: '2rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-lg" style={{ color: 'var(--text-main)' }}>Store Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your public store presence and settings.</p>
      </div>

      <div className="modern-card" style={{ padding: '2rem' }}>
        <h3 className="heading-md" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={20} className="text-secondary" /> Configuration
        </h3>
        
        <form onSubmit={handleConfigSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            


            {/* Store Notice Section */}
            <div style={{ background: '#fff7ed', padding: '1rem', borderRadius: '12px', border: '1px solid #fed7aa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ fontSize: '1rem', fontWeight: 600, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📢 Store Notice
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#9a3412' }}>{config.showNotice ? 'Visible' : 'Hidden'}</span>
                  <button 
                     type="button"
                     onClick={toggleNotice}
                     className="btn"
                     style={{ 
                       background: config.showNotice ? '#ea580c' : '#ccc', 
                       color: 'white',
                       padding: '0.25rem 0.75rem',
                       fontSize: '0.8rem',
                       borderRadius: '20px'
                     }}
                  >
                    {config.showNotice ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Back in 1 hour, Sale Today Only!"
                value={config.noticeMessage || ''}
                onChange={handleNoticeChange}
                style={{ borderColor: '#fed7aa', background: 'white' }}
              />
              <p style={{ fontSize: '0.8rem', color: '#c2410c', marginTop: '0.5rem' }}>
                Message updates instantly on the home page.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Owner Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Rahul Kumar"
                  value={config.ownerName || ''}
                  onChange={e => setConfig({...config, ownerName: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Main WhatsApp</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. 919876543210"
                  value={config.whatsapp}
                  onChange={e => setConfig({...config, whatsapp: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Alternate Mobile Number</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. 919876543210"
                value={config.alternateMobile || ''}
                onChange={e => setConfig({...config, alternateMobile: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Brand Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={config.storeName}
                onChange={e => setConfig({...config, storeName: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Store Address</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Full address displaying on home page"
                value={config.address || ''}
                onChange={e => setConfig({...config, address: e.target.value})}
              />
            </div>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} /> Location Settings
                </h4>
                
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Google Maps Place Link</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="https://maps.google.com/..."
                    value={config.googleMapsLink || ''}
                    onChange={e => setConfig({...config, googleMapsLink: e.target.value})}
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    The link opened when customers click "Open Store Location".
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Google Maps CID (Exact Match)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. 5610898517208768605"
                    value={config.cid || ''}
                    onChange={e => setConfig({...config, cid: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Store Coordinates (Lat / Lng)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                     <div>
                       <input 
                        className="input-field" 
                        placeholder="Lat" 
                        type="number" 
                        step="any"
                        value={config.location?.lat || ''}
                        onChange={e => handleLocationChange('lat', e.target.value)}
                       />
                     </div>
                     <div>
                       <input 
                        className="input-field" 
                        placeholder="Lng" 
                        type="number" 
                        step="any"
                        value={config.location?.lng || ''}
                        onChange={e => handleLocationChange('lng', e.target.value)}
                       />
                     </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Used for the map preview embed.
                  </p>
                </div>
                </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Social Media
                </h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                           <Instagram size={16} /> Instagram Profile URL
                        </label>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="https://instagram.com/..."
                            value={config.socials?.instagram || ''}
                            onChange={e => setConfig({
                                ...config, 
                                socials: { ...config.socials, instagram: e.target.value }
                            })}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                           <Facebook size={16} /> Facebook Page URL
                        </label>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="https://facebook.com/..."
                            value={config.socials?.facebook || ''}
                            onChange={e => setConfig({
                                ...config, 
                                socials: { ...config.socials, facebook: e.target.value }
                            })}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                           <Youtube size={16} /> YouTube Channel URL
                        </label>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="https://youtube.com/..."
                            value={config.socials?.youtube || ''}
                            onChange={e => setConfig({
                                ...config, 
                                socials: { ...config.socials, youtube: e.target.value }
                            })}
                        />
                    </div>
                </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
             <button className="btn btn-primary" type="submit" style={{ padding: '0.75rem 2rem' }}>
               <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Profile
             </button>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      <div className="modern-card" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Map Preview</h3>
        <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', background: '#f1f5f9' }}>
           {(config.location?.lat && config.location?.lng) ? (
               <iframe 
                 width="100%" 
                 height="100%" 
                 title="Preview"
                 frameBorder="0" 
                 src={`https://maps.google.com/maps?q=${config.location.lat},${config.location.lng}&z=15&output=embed`}
               ></iframe>
           ) : (
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                 Set coordinates to preview map
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
