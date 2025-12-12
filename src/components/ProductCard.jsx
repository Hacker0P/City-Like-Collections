import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ProductImageSlider from './ProductImageSlider';

const ProductCard = ({ product, config, onImageClick }) => {
  const { t } = useLanguage();
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const colors = product.colors ? product.colors.split(',').map(c => c.trim()) : [];
  const sizes = product.sizes ? product.sizes.split(',').map(s => s.trim()) : [];

  const handleBuy = () => {
    if (!config.whatsapp) {
      alert('Shopkeeper has not set a WhatsApp number yet.');
      return;
    }
    
    // Format message
    let message = `Hi, I want to buy *${product.name}* (Price: ₹${product.price}).`;
    
    // Use selected size if chosen, otherwise list all available
    if (selectedSize) {
      message += `\nSize: ${selectedSize}`;
    } else if (product.sizes) {
      message += `\nSizes: ${product.sizes}`;
    }
    
    // Use selected color if chosen, otherwise list all available
    if (selectedColor) {
      message += `\nColor: ${selectedColor}`;
    } else if (product.colors) {
      message += `\nColors: ${product.colors}`;
    }
    
    message += `\nIs it available?`;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${config.whatsapp}?text=${encodedMessage}`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="modern-card">
      <div className="product-image-wrapper">
         <ProductImageSlider 
            product={product} 
            onImageClick={onImageClick} 
         />
      </div>
      
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ marginBottom: '0.75rem' }}>
            {product.category && (
                 <span style={{ 
                   fontSize: '0.7rem', 
                   textTransform: 'uppercase', 
                   color: 'var(--primary)', 
                   fontWeight: 700,
                   letterSpacing: '0.05em',
                   display: 'block',
                   marginBottom: '0.25rem'
                 }}>
                   {product.category}
                 </span>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem' }}>
              <div>
                  <h3 className="heading-md" style={{ fontSize: '1.1rem', lineHeight: 1.4, margin: '0 0 0.25rem 0' }}>{product.name}</h3>
                  {parseInt(product.quantity) > 0 ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--whatsapp)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--whatsapp)' }}></span>
                          {t('inStock') || 'Available'}
                      </span>
                  ) : (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></span>
                          {t('outOfStock') || 'Not Available'}
                      </span>
                  )}
              </div>
              <span style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.2rem' }}>₹{product.price}</span>
            </div>
        </div>
        
        <div style={{ marginBottom: 'auto' }}>
            {/* Sizes Selection */}
            {sizes.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                   <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                       {t('selectSize')}: 
                   </span>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {sizes.map(size => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    border: selectedSize === size ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                    background: selectedSize === size ? 'var(--primary-light)' : 'white',
                                    color: selectedSize === size ? 'var(--primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s',
                                    fontWeight: selectedSize === size ? 700 : 500
                                }}
                            >
                                {size}
                            </button>
                        ))}
                   </div>
                </div>
            )}
            
            {/* Colors Selection */}
            {colors.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                        {t('selectColor')}:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {colors.map(color => (
                            <button
                                key={color}
                                onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                                style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '50px',
                                    fontSize: '0.75rem',
                                    border: selectedColor === color ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                    background: selectedColor === color ? 'var(--primary-light)' : 'white',
                                    color: selectedColor === color ? 'var(--primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s',
                                    fontWeight: selectedColor === color ? 700 : 500
                                }}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <button 
          className="btn btn-whatsapp" 
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleBuy}
        >
          <MessageCircle size={18} /> {t('orderWhatsApp')}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
