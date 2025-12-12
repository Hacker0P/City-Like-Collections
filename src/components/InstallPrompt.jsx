import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);
    
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // Listen for install prompt (mostly Android/Desktop Chrome)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait a bit before showing to not be annoying immediately on load
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show iOS hint if not installed and on iOS (after delay)
    if (ios && !isStandalone) {
        setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-[80px] md:bottom-6 left-4 right-4 z-[90] animate-fade-in-up md:max-w-md md:left-auto md:right-6">
      <div className="bg-slate-900/95 text-white p-5 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700 flex flex-col gap-4 relative">
        <button 
            onClick={() => setShowPrompt(false)} 
            className="absolute top-2 right-2 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        >
            <X size={20} />
        </button>

        <div className="flex items-start gap-4 pr-8">
            <img src="/pwa-192x192.png" className="w-14 h-14 rounded-xl shadow-lg border border-slate-700 object-cover" alt="App Icon" />
            <div>
                <h3 className="font-bold text-lg leading-tight mb-1">Install App</h3>
                <p className="text-slate-300 text-sm leading-snug">
                    {isIOS 
                        ? "Install City Like Collection on your iPhone for the best experience." 
                        : "Add to Home Screen for quick access, full-screen view, and offline mode."}
                </p>
            </div>
        </div>

        {isIOS ? (
            <div className="bg-slate-800/80 rounded-xl p-3 text-xs text-slate-300 flex items-center gap-3 border border-slate-700">
                <span className="shrink-0 text-blue-400 animate-pulse"><Share size={24} /></span>
                <span>Tap the <b>Share</b> button in your browser, then scroll down and tap <b>Add to Home Screen</b>.</span>
            </div>
        ) : (
            <button 
                onClick={handleInstallClick}
                className="w-full py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-white shadow-lg shadow-primary-600/30"
            >
                <Download size={20} /> Install App
            </button>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;
