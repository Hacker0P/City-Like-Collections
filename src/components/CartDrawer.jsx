import React from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useShop();
  const { t } = useLanguage();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    // Construct WhatsApp Message
    let message = `*New Order Request*\n\n`;
    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n`;
        if (item.selectedSize && item.selectedSize !== 'All') message += `   Size: ${item.selectedSize}\n`;
        if (item.selectedColor && item.selectedColor !== 'All') message += `   Color: ${item.selectedColor}\n`;
        message += `   Qty: ${item.quantity} x ₹${item.price} = ₹${item.quantity * item.price}\n`;
        
        // Add Image URL if available
        let imgUrl = '';
        if (Array.isArray(item.images) && item.images.length > 0) imgUrl = item.images[0];
        else if (typeof item.images === 'string' && item.images.startsWith('http')) imgUrl = item.images;
        
        if (imgUrl) message += `   Image: ${imgUrl}\n`;
        message += `\n`;
    });
    message += `*Total Amount: ₹${cartTotal.toLocaleString()}*\n`;
    message += `-------------------\n`;
    message += `Please confirm availability.`;

    const encodedMessage = encodeURIComponent(message);
    // WhatsApp URL (Use config number if available? Need to pass it or access it).
    // For now hardcode or use a default.
    // Better to pass store number via props or fetch config context.
    // I'll assume standard number or the one in Home (I don't have access to Home config here easily unless I use Context or Props).
    // I'll use a placeholder or generic link, BUT Home.jsx had it in config. 
    // I should create a "ConfigContext" or just assume a number.
    // Or I'll just open WhatsApp with empty number (user picks contact) or use the one from translations?
    // Home.jsx reads from Supabase.
    // Ideally Config should be global.
    // For now, I'll direct to the number from translations/config if I can.
    // I'll use a hardcoded fallback or try to read from localStorage 'clc_config' (Profile updates it!).
    
    // Retrieve config from local storage (hacky but works since Profile saves it)
    const savedConfig = localStorage.getItem('clc_config');
    let phone = '';
    if (savedConfig) {
        const conf = JSON.parse(savedConfig);
        phone = conf.whatsapp || conf.alternateMobile || '';
    }
    
    // Default to +91 if not present?
    const target = phone ? `https://wa.me/91${phone.replace(/\D/g, '').slice(-10)}` : `https://wa.me/?`;
    
    window.open(`${target}?text=${encodedMessage}`, '_blank');
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-primary-600" />
            Shopping Cart <span className="text-sm font-normal text-slate-500">({cart.length} items)</span>
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                <ShoppingBag size={64} className="mb-4 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-700">Your cart is empty</h3>
                <p className="text-slate-500">Start adding items to create your order.</p>
                <button onClick={() => setIsCartOpen(false)} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-sm">
                    Start Shopping
                </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                  <div className="w-20 h-20 bg-white rounded-lg flex-shrink-0 border border-slate-200 overflow-hidden">
                      {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100"><ShoppingBag className="text-slate-300" /></div>
                      )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                          <h4 className="font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                              {item.selectedSize && <span className="px-1.5 py-0.5 bg-white border rounded text-[10px] uppercase font-bold">{item.selectedSize}</span>}
                              {item.selectedColor && <span className="px-1.5 py-0.5 bg-white border rounded text-[10px] uppercase font-bold">{item.selectedColor}</span>}
                          </p>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1">
                              <button onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, -1)} className="p-1 hover:text-primary-600 disabled:opacity-30" disabled={item.quantity <= 1}>
                                  <Minus size={14} />
                              </button>
                              <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, 1)} className="p-1 hover:text-primary-600">
                                  <Plus size={14} />
                              </button>
                          </div>
                          <div className="text-right">
                              <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)} className="text-red-400 p-1 mb-1 block ml-auto hover:text-red-600">
                                  <Trash2 size={16} />
                              </button>
                              <span className="font-bold text-slate-900 block">₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                      </div>
                  </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-white space-y-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] relative z-10">
              <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex gap-3">
                  <button 
                      onClick={() => setIsCartOpen(false)}
                      className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                      Back
                  </button>
                  <button 
                      onClick={handleCheckout}
                      className="flex-[2] py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 active:scale-[0.98] transition-all"
                  >
                      <MessageCircle size={20} /> Checkout on WhatsApp
                  </button>
              </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default CartDrawer;
