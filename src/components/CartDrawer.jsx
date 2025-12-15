import React from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';

import { supabase } from '../supabaseClient';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useShop();
  const { t } = useLanguage();

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    // Construct WhatsApp Message
    let message = `*New Order Request*\n\n`;
    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n`;
        if (item.selectedSize && item.selectedSize !== 'All') message += `   Size: ${item.selectedSize}\n`;
        if (item.selectedColor && item.selectedColor !== 'All') message += `   Color: ${item.selectedColor}\n`;
        message += `   Qty: ${item.quantity} x ₹${item.price} = ₹${item.quantity * item.price}\n`;
        
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
    
    // 1. Default fallback
    let phone = '9800000000'; 
    
    // 2. Try Local Storage (Robust Fallback)
    try {
        const savedConfig = localStorage.getItem('clc_config');
        if (savedConfig) {
            const conf = JSON.parse(savedConfig);
            if (conf.whatsapp) phone = conf.whatsapp;
        }
    } catch (err) {
        console.error("Error reading local config", err);
    }

    // 3. Try Supabase (Source of Truth)
    try {
        const { data, error } = await supabase.from('store_settings').select('whatsapp_number').eq('id', 1).single();
        if (error) throw error; // Throw to catch block if table/column missing
        if (data && data.whatsapp_number) {
            phone = data.whatsapp_number;
        }
    } catch (e) {
        console.warn("Could not fetch remote settings (using local fallback):", e.message);
    }

    // Construct formatting

    // Construct formatting
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    
    const target = `https://wa.me/${finalPhone}`;
    window.open(`${target}?text=${encodedMessage}`, '_blank');
  };

  return createPortal(
      <div className="fixed inset-0 z-[90] flex justify-end">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsCartOpen(false)}
        ></div>

        {/* Drawer */}
        <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right pb-[80px] md:pb-0">
        
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
                              <button onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, -1)} className="p-1 hover:text-primary-600">
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
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg> Checkout on WhatsApp
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
