import React, { useEffect, useRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ProductImageSlider = ({ product, onImageClick }) => {
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  // Normalize images array: prefer 'images' array, fallback to single 'image', empty if neither
  const images = (product.images && product.images.length > 0) 
    ? product.images.filter(Boolean)
    : (product.image ? [product.image] : []);

  // Create display array with cloned first image for seamless looping
  const displayImages = images.length > 1 ? [...images, images[0]] : images;

  useEffect(() => {
    // Only auto-scroll if multiple images exist
    if (images.length <= 1) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const interval = setInterval(() => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      
      // Check if we are near the end (displaying the cloned first image)
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;

      if (isAtEnd) {
         // We are at the cloned first image. 
         // Instantly snap back to real first image
         scrollContainer.scrollTo({ left: 0, behavior: 'auto' });
         
         // Using setTimeout to ensure the browser processes the 'auto' jump first
         // before starting the next smooth scroll
         setTimeout(() => {
             scrollContainer.scrollBy({ left: clientWidth, behavior: 'smooth' });
         }, 50);
      } else {
         scrollContainer.scrollBy({ left: clientWidth, behavior: 'smooth' });
      }
    }, 2000); // 2 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="product-image-container" style={{ position: 'relative', height: '280px', background: 'var(--surface-secondary)' }}>
      <div 
        ref={scrollRef}
        className="hide-scrollbar"
        style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          scrollSnapType: 'x mandatory', 
          height: '100%',
          width: '100%',
          // Removed scrollBehavior: 'smooth' to prevent conflict with JS manual scrolling
        }}
      >
        {displayImages.length > 0 ? (
          displayImages.map((img, idx) => (
            <div 
              key={idx} 
              style={{ 
                flex: '0 0 100%', 
                width: '100%', 
                scrollSnapAlign: 'start', 
                position: 'relative' 
              }}
            >
               <img 
                  src={img} 
                  alt={`${product.name} ${idx + 1}`} 
                  onClick={() => onImageClick({ index: idx % images.length, images: images })}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer', padding: '0.5rem' }}
                />
            </div>
          ))
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: '1rem', flex: '0 0 100%' }}>
            <ShoppingBag size={40} opacity={0.2} />
            <span>No Preview Available</span>
          </div>
        )}
      </div>

      {/* Badges Overlay */}


      {/* Bottom Right: Photo Counter (Relocated) */}
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', zIndex: 10 }}>
            <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', fontWeight: 700, borderRadius: '20px' }}>
                {images.length} Photos
            </span>
        </div>
      )}
    </div>
  );
};

export default ProductImageSlider;
