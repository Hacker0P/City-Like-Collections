import React, { useState } from 'react';
import { MessageCircle, ShoppingBag, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useShop } from '../context/ShopContext';
import { getColorHex } from '../utils/colors';
import ProductImageSlider from './ProductImageSlider';

const ProductCard = ({ product, config, onImageClick }) => {
  const { t } = useLanguage();
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  
  // Parse variants
  const colors = product.colors ? product.colors.split(',').map(c => c.trim().toUpperCase()) : [];
  const sizes = product.sizes ? product.sizes.split(',').map(s => s.trim().toUpperCase()) : [];

  const handleBuy = () => {
    if (!config.whatsapp) {
      alert('Shopkeeper has not set a WhatsApp number yet.');
      return;
    }
    
    // Format message
    let message = `Hi, I want to buy *${product.name}* (Price: ₹${product.price}).`;
    
    if (selectedSize) message += `\nSize: ${selectedSize}`;
    else if (product.sizes) message += `\nSizes: ${product.sizes}`;
    
    if (selectedColor) message += `\nColor: ${selectedColor}`;
    else if (product.colors) message += `\nColors: ${product.colors}`;
    
    message += `\nIs it available?`;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${config.whatsapp}?text=${encodedMessage}`;
    
    window.open(url, '_blank');
  };

  const isOutOfStock = parseInt(product.quantity) <= 0;
  const isNew = new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const handleAddToCart = () => {
      // If variants exist and not selected, maybe select first or alert?
      // For now, allow adding without specific selection (or default to 'any').
      // But better UX is to require specific if multiple choices.
      // I'll pass whatever is selected (null if not). Context handles it.
      addToCart(product, selectedSize || 'One Size', selectedColor || 'Any Color');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 group relative">
        
        {/* Image Section */}
        <div className="relative aspect-square bg-slate-50">
             <ProductImageSlider 
                product={product} 
                onImageClick={onImageClick} 
             />
             
             {/* Badges */}
             <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                  {isOutOfStock ? (
                      <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                          Out of Stock
                      </span>
                  ) : (
                      <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                          Available
                      </span>
                  )}
                 {isNew && !isOutOfStock && (
                     <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                         New
                     </span>
                 )}

             </div>

             {/* Wishlist Button */}
             <button 
                onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm z-10 hover:bg-white active:scale-90 transition-all"
             >
                 <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : "text-slate-400"} />
             </button>
        </div>

        {/* Content Section */}
        <div className="p-3 flex flex-col flex-1 gap-2">
            
            {/* Title & Price */}
            <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1 line-clamp-2 min-h-[2rem]">
                    {product.name}
                </h3>
                <div className="text-base font-extrabold text-primary-600">
                    ₹{product.price}
                </div>
            </div>

            {/* Variants Selection (if any) */}
            {(sizes.length > 0 || colors.length > 0) && (
                <div className="flex flex-col gap-1.5">
                    {/* Sizes */}
                    {sizes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {sizes.map(size => (
                                <button 
                                    key={size}
                                    onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                                        selectedSize === size 
                                          ? 'bg-slate-900 text-white border-slate-900' 
                                          : 'bg-white text-slate-600 border-slate-200'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {/* Colors */}
                    {colors.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {colors.map(color => (
                                <button 
                                    key={color}
                                    onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                                    title={color}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center overflow-hidden transition-all border shadow-sm ${
                                        selectedColor === color ? 'border-primary-600 ring-1 ring-primary-100 scale-110' : 'border-slate-200 hover:scale-105'
                                    }`}
                                >
                                    <span 
                                        className="w-full h-full"
                                        style={{ backgroundColor: getColorHex(color) || 'transparent' }}
                                    >
                                        {!getColorHex(color) && <span className="text-[8px] flex h-full w-full items-center justify-center font-bold text-slate-500 bg-slate-100">{color.charAt(0)}</span>}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            <div className="mt-auto pt-2 border-t border-slate-100 flex gap-2">
                 <button 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-xs transition-all active:scale-95 ${
                        isOutOfStock 
                           ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                           : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                    }`}
                 >
                    <ShoppingBag size={14} />
                    {isOutOfStock ? t('outOfStock') : 'Add to Cart'}
                 </button>
            </div>

        </div>
    </div>
  );
};

export default ProductCard;
