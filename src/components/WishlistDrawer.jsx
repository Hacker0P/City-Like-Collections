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
        <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right pb-[80px] md:pb-0">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Heart className="text-rose-500 fill-rose-500" />
            Wishlist <span className="text-sm font-normal text-slate-500">({wishlist.length} terms)</span>
          </h2>
          <button onClick={() => setIsWishlistOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                <Heart size={64} className="mb-4 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-700">Your wishlist is empty</h3>
                <p className="text-slate-500">Save items you love to view them here.</p>
                <button onClick={() => setIsWishlistOpen(false)} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-sm">
                    Continue Shopping
                </button>
            </div>
          ) : (
            wishlist.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                  <div 
                    className="w-20 h-20 bg-white rounded-lg flex-shrink-0 border border-slate-200 overflow-hidden cursor-pointer"
                    onClick={() => {
                        setIsWishlistOpen(false);
                        navigate(`/product/${item.id}`);
                    }}
                  >
                      {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100"><ShoppingBag className="text-slate-300" /></div>
                      )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                          <h4 
                            className="font-bold text-slate-800 line-clamp-1 cursor-pointer hover:text-primary-600"
                            onClick={() => {
                                setIsWishlistOpen(false);
                                navigate(`/product/${item.id}`);
                            }}
                          >
                              {item.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 font-medium">
                              ₹{Number(item.price).toLocaleString()}
                          </p>
                      </div>
                      <div className="flex justify-end items-center mt-2">
                          <button 
                            onClick={() => toggleWishlist(item)} 
                            className="flex items-center gap-1 text-rose-500 hover:text-rose-700 text-xs font-bold px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                          >
                              <Trash2 size={14} /> Remove
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
