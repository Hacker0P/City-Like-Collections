import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ShoppingBag, Heart, Share2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useShop } from '../context/ShopContext';
import { getColorHex } from '../utils/colors';
import ProductImageSlider from './ProductImageSlider';

const ProductCard = ({ product, config, onImageClick }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  // Parse variants
  const colors = product.colors ? product.colors.split(',').map(c => c.trim().toUpperCase()) : [];
  const sizes = product.sizes ? product.sizes.split(',').map(s => s.trim().toUpperCase()) : [];
  
  const hasVariants = sizes.length > 0 || colors.length > 0;

  const handleAddToCart = (e) => {
      if (e) e.stopPropagation();
      // If we already have selections or no variants exist, add immediately
      if (!hasVariants && !isOutOfStock) {
        addToCart(product, 'One Size', 'Any Color');
        return;
      }
      
      // Otherwise show modal to pick
      setShowOptionsModal(true);
  };
  
  const confirmAddToCart = () => {
      if ((sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor)) {
          alert('Please select all options.');
          return;
      }
      addToCart(product, selectedSize || 'One Size', selectedColor || 'Any Color');
      setShowOptionsModal(false);
      // Reset after add? Optional.
      setSelectedSize(null);
      setSelectedColor(null);
  };

  const isOutOfStock = parseInt(product.quantity) <= 0;
  const isNew = new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const handleShare = async (e) => {
      e.stopPropagation();
      const shareData = {
          title: config?.storeName || 'City Like Collection',
          text: `Check out ${product.name} - ₹${product.price}\n\n`,
          url: `${window.location.origin}/catalogue?search=${encodeURIComponent(product.name)}`
      };

      try {
          if (navigator.share) {
              await navigator.share(shareData);
          } else {
              await navigator.clipboard.writeText(`${shareData.text}${shareData.url}`);
              // You might want to use a toast here instead of alert in future
              alert('Product link copied to clipboard!');
          }
      } catch (err) {
          console.debug('Share cancelled or failed', err);
      }
  };

  return (
    <>
    <div 
    onClick={handleCardClick} 
    className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 group relative cursor-pointer"
>
        {/* Image Section */}
        <div className="relative aspect-square bg-slate-50">
             <div className="w-full h-full pointer-events-none">
    <ProductImageSlider 
        product={product} 
        // onImageClick removed in favor of card click
    />
</div>
             
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
                 {!isOutOfStock && parseInt(product.quantity) <= 3 && (
                     <span className="px-2 py-0.5 bg-red-400 text-white rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                         Only {product.quantity} Left
                     </span>
                 )}

             </div>

             {/* Action Buttons (Top Right) */}
             <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                 <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white active:scale-90 transition-all text-slate-700"
                 >
                     <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : "text-slate-600"} />
                 </button>
                 <button 
                    onClick={handleShare}
                    className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white active:scale-90 transition-all text-slate-700"
                 >
                     <Share2 size={18} />
                 </button>
             </div>
        </div>

        {/* Content Section */}
        <div className="p-3 flex flex-col flex-1 gap-2">
            <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1 line-clamp-2 min-h-[2rem]">
                    {product.name}
                </h3>
                <div className="text-base font-extrabold text-primary-600">
                    ₹{product.price}
                </div>
            </div>

            {/* Quick Summary of Variants (Visual only, non-interactive on card face to reduce clutter) */}
            {hasVariants && (
                 <div className="text-[10px] text-slate-400 font-medium">
                     {sizes.length > 0 && <span>{sizes.length} Sizes</span>}
                     {sizes.length > 0 && colors.length > 0 && <span> • </span>}
                     {colors.length > 0 && <span>{colors.length} Colors</span>}
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

    {/* Options Pop-up Modal */}
    {showOptionsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowOptionsModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="flex gap-4 mb-6">
                     <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                         {product.images && product.images.length > 0 ? (
                             <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={24}/></div>
                         )}
                     </div>
                     <div>
                         <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight">{product.name}</h3>
                         <div className="text-lg font-extrabold text-primary-600 mt-1">₹{product.price}</div>
                     </div>
                </div>

                <div className="space-y-6">
                    {/* Size Selector */}
                    {sizes.length > 0 && (
                        <div>
                            <label className="text-sm font-bold text-slate-700 mb-2 block">Select Size</label>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map(size => (
                                    <button 
                                        key={size}
                                        onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                        className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-bold border transition-all ${
                                            selectedSize === size 
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color Selector */}
                    {colors.length > 0 && (
                        <div>
                            <label className="text-sm font-bold text-slate-700 mb-2 block">Select Color</label>
                            <div className="flex flex-wrap gap-3">
                                {colors.map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                            selectedColor === color ? 'border-primary-600 ring-2 ring-primary-100 scale-110' : 'border-slate-200'
                                        }`}
                                    >
                                        <span 
                                            className="w-full h-full rounded-full border border-white/20 shadow-sm"
                                            style={{ backgroundColor: getColorHex(color) || 'gray' }}
                                        ></span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex gap-3">
                    <button 
                        onClick={() => setShowOptionsModal(false)}
                        className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmAddToCart}
                        disabled={ (sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor) }
                        className="flex-[2] py-3 text-white font-bold bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm & Add
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default ProductCard;
