import React from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, Heart, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const WishlistDrawer = () => {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, toggleWishlist } = useShop();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!isWishlistOpen) return null;

  return createPortal(
      <div className="fixed inset-0 z-[90] flex justify-end">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsWishlistOpen(false)}
        ></div>

        {/* Drawer */}
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-slide-in-right pb-[80px] md:pb-0">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Heart className="text-rose-500 fill-rose-500" />
            {t('wishlist_title')} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({wishlist.length} {t('cart_items')})</span>
          </h2>
          <button onClick={() => setIsWishlistOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                <Heart size={64} className="mb-4 text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">{t('wishlist_empty_title')}</h3>
                <p className="text-slate-500 dark:text-slate-400">{t('wishlist_empty_desc')}</p>
                <button onClick={() => setIsWishlistOpen(false)} className="mt-6 px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-full font-bold text-sm">
                    {t('wishlist_continue')}
                </button>
            </div>
          ) : (
            wishlist.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all">
                  <div 
                    className="w-20 h-20 bg-white dark:bg-slate-900 rounded-lg flex-shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer"
                    onClick={() => {
                        setIsWishlistOpen(false);
                        navigate(`/product/${item.id}`);
                    }}
                  >
                      {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800"><ShoppingBag className="text-slate-300 dark:text-slate-600" /></div>
                      )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                          <h4 
                            className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
                            onClick={() => {
                                setIsWishlistOpen(false);
                                navigate(`/product/${item.id}`);
                            }}
                          >
                              {item.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                              ₹{Number(item.price).toLocaleString()}
                          </p>
                      </div>
                      <div className="flex justify-end items-center mt-2">
                          <button 
                            onClick={() => toggleWishlist(item)} 
                            className="flex items-center gap-1 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 text-xs font-bold px-2 py-1 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors"
                          >
                              <Trash2 size={14} /> {t('wishlist_remove')}
                          </button>
                      </div>
                  </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WishlistDrawer;
