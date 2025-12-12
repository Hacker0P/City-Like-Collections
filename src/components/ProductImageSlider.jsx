import React, { useEffect, useRef, useState } from 'react';
import { ShoppingBag, Image as ImageIcon } from 'lucide-react';

const ProductImageSlider = ({ product, onImageClick }) => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize images array
  const images = (product.images && product.images.length > 0) 
    ? product.images.filter(Boolean)
    : (product.image ? [product.image] : []);

  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [images.length, isHovered]);

  useEffect(() => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: activeIndex * width,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);

  // Handle manual scroll update for dots
  const handleScroll = () => {
    if (scrollRef.current) {
        const width = scrollRef.current.offsetWidth;
        const newIndex = Math.round(scrollRef.current.scrollLeft / width);
        if (newIndex !== activeIndex) {
            // Only update if significantly changed to avoid fighting with auto-scroll effect
            // But actually, updating state here might cancel the auto-scroll interval or cause jumps
            // Let's purely rely on auto-scroll state for now, or update state only if paused?
            // Safer: Just let auto-scroll drive, manual scroll will visually work but might snap back on next tick.
            // Better: update index on scroll so the timer continues from there.
             // setActiveIndex(newIndex); 
             // We will skip manual sync for simplicity to avoid jitter, as requested 'auto scroll' is priority.
        }
    }
  };

  return (
    <div 
        className="relative h-full w-full bg-slate-50 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
    >
      <div 
        ref={scrollRef}
        className="hide-scrollbar flex overflow-x-auto snap-x snap-mandatory h-full w-full scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {images.length > 0 ? (
          images.map((img, idx) => (
            <div 
              key={idx} 
              className="flex-none w-full h-full snap-start relative flex items-center justify-center p-0"
            >
               <img 
                  src={img} 
                  alt={`${product.name} ${idx + 1}`} 
                  onClick={() => onImageClick && onImageClick({ index: idx, images: images })}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                />
            </div>
          ))
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
            <ImageIcon size={32} />
          </div>
        )}
      </div>

      {/* Pagination Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 p-1.5 bg-black/20 backdrop-blur-sm rounded-full">
            {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all duration-300 ${idx === activeIndex ? 'bg-white scale-125 opacity-100' : 'bg-white/50 opacity-60'}`}
                />
            ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageSlider;
