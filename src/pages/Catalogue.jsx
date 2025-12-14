import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Search, X, Check, SlidersHorizontal, ArrowLeft, ChevronLeft, ChevronRight, ArrowDownUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useShop } from '../context/ShopContext';
import { getColorHex } from '../utils/colors';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { supabase } from '../supabaseClient';

const Catalogue = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'All',
    priceRange: [0, 10000],
    size: 'All',
    color: 'All',
    search: searchParams.get('search') || ''
  });
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const [selectedImage, setSelectedImage] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Sync state with URL params when they change externally (e.g. from Navbar)
  useEffect(() => {
    setFilters(prev => ({
        ...prev,
        category: searchParams.get('category') || 'All',
        search: searchParams.get('search') || ''
    }));
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
        setLoading(true);
        try {
            // In a real large-scale app, we would filtering on the server.
            // For 1000-2000 items, fetching all logic is still "okay" for modern devices if we don't render them all at once.
            // But ideally: .ilike('name', `%${filters.search}%`) etc.
            // For now, retaining client-side filtering logic but keeping scope for upgrade.
            const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products: ", error);
        } finally {
            setLoading(false);
        }
    };
    fetchProducts();
  }, []);

  const uniqueCategories = ['T-Shirt', 'Shirt', 'Jeans', 'Trousers', 'Shoes', 'Accessories', 'Other'];
  const sizes = ['All', ...new Set(products.flatMap(p => p.sizes ? p.sizes.split(',').map(s => s.trim()) : []))].sort();
  const uniqueColors = ['All', ...new Set(products.flatMap(p => p.colors ? p.colors.split(',').map(c => c.trim()) : []))].sort();
  
  const filteredProducts = products.filter(product => {
    if (filters.category !== 'All' && product.category !== filters.category) return false;
    if (Number(product.price) < filters.priceRange[0] || Number(product.price) > filters.priceRange[1]) return false;
    if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    if (filters.size !== 'All') {
        if (!product.sizes) return false;
        if (!product.sizes.split(',').map(s => s.trim()).includes(filters.size)) return false;
    }
    if (filters.color !== 'All') {
        if (!product.colors) return false;
        if (!product.colors.split(',').map(c => c.trim()).includes(filters.color)) return false;
    }
    return true;
  });

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const updateFilter = (key, value) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      // Optional: Update URL params to reflect non-default filters if desired
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
      {/* Header / Search Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 md:top-[70px] z-30 shadow-sm transition-all duration-300">
          <div className="container mx-auto px-4 py-3 md:py-4">
              <div className="flex items-center gap-3 md:gap-4">
                  <button onClick={() => navigate(-1)} className="md:hidden p-1 -ml-1 text-slate-500">
                     <ArrowLeft />
                  </button>
                  <div className="relative flex-1">
                      <input 
                          type="text" 
                          placeholder="Search for products..." 
                          className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-800 text-sm md:text-base"
                          value={filters.search}
                          onChange={(e) => updateFilter('search', e.target.value)}
                      />
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
              </div>
          </div>
          
          {/* Mobile Filter & Sort Bar (Sticky Sub-header) */}
          <div className="grid grid-cols-2 border-t border-slate-100 lg:hidden">
              <button 
                className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors border-r border-slate-100"
                // Placeholder for Sort
              >
                  <ArrowDownUp size={16} className="text-slate-500" />
                  <span className="text-sm font-bold text-slate-700">Sort</span>
              </button>
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                  <SlidersHorizontal size={16} className="text-slate-500" />
                  <span className="text-sm font-bold text-slate-700">Filter</span>
                  {/* Active Filter Dot */}
                  {(filters.category !== 'All' || filters.color !== 'All' || filters.size !== 'All' || filters.priceRange[1] !== 10000) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                  )}
              </button>
          </div>
      </div>

      <div className="container mx-auto px-4 mt-6 flex flex-col lg:flex-row gap-8 items-start">
        
          {/* Mobile Filter Backdrop */}
          {showMobileFilters && (
              <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
          )}

          {/* Filters Sidebar / Bottom Sheet */}
          <div className={`
              fixed inset-x-0 bottom-0 z-[60] h-[85vh] w-full bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col transition-transform duration-300 
              lg:translate-y-0 lg:inset-auto lg:right-auto lg:bottom-auto lg:top-32 lg:sticky lg:z-10 lg:w-64 lg:h-auto lg:bg-transparent lg:shadow-none lg:rounded-none lg:block
              ${showMobileFilters ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          `}>
             {/* Mobile Sheet Handle */}
             <div className="w-full h-1.5 absolute top-3 left-1/2 -translate-x-1/2 w-12 bg-slate-200 rounded-full lg:hidden"></div>

             {/* Header */}
             <div className="flex justify-between items-center p-6 border-b border-slate-100 lg:p-0 lg:border-none lg:mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Filter size={20} className="text-primary-600" /> Filters
                </h3>
                <button 
                    onClick={() => setShowMobileFilters(false)} 
                    className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 lg:hidden"
                >
                    <X size={20} />
                </button>
             </div>
             
             {/* Scrollable Content */}
             <div className="flex-1 overflow-y-auto p-6 lg:p-0 lg:overflow-visible">
                 <div className="bg-white lg:rounded-2xl lg:border lg:border-slate-200 lg:p-6 lg:shadow-sm">
                     {/* Reset */}
                     <div className="flex justify-between items-center mb-6 hidden lg:flex">
                        <h3 className="font-bold text-slate-800">Filters</h3>
                        <button 
                            onClick={() => setFilters({ category: 'All', priceRange: [0, 10000], size: 'All', color: 'All', search: '' })}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wide"
                        >
                            Reset All
                        </button>
                     </div>
                     
                     {/* Mobile Reset (Inline) */}
                     <div className="lg:hidden mb-8 flex justify-end">
                        <button 
                            onClick={() => setFilters({ category: 'All', priceRange: [0, 10000], size: 'All', color: 'All', search: '' })}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wide bg-primary-50 px-3 py-1.5 rounded-full"
                        >
                            Reset Filters
                        </button>
                     </div>

                     {/* Price Filter */}
                     <div className="mb-8">
                         <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Price</label>
                            <span className="text-sm font-bold text-slate-900">₹{filters.priceRange[1]}</span>
                         </div>
                         <input 
                            type="range" 
                            min="0" 
                            max="10000" 
                            step="100"
                            value={filters.priceRange[1]} 
                            onChange={(e) => updateFilter('priceRange', [0, parseInt(e.target.value)])}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary-600 bg-slate-200"
                         />
                     </div>

                     {/* Category Filter */}
                     <div className="mb-8">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('category')}</label>
                        <div className="flex flex-col gap-1">
                            {['All', ...uniqueCategories].map(cat => (
                                <label key={cat} className={`flex items-center gap-3 cursor-pointer py-2 px-3 rounded-lg transition-colors ${filters.category === cat ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    <input type="radio" name="category" checked={filters.category === cat} onChange={() => updateFilter('category', cat)} className="sr-only" />
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${filters.category === cat ? 'border-primary-600' : 'border-slate-300'}`}>
                                        {filters.category === cat && <div className="w-2 h-2 bg-primary-600 rounded-full"></div>}
                                    </div>
                                    <span>{cat === 'All' ? t('cat_All') : cat}</span>
                                </label>
                            ))}
                        </div>
                     </div>
                     
                     {/* Sizes Filter */}
                     <div className="mb-8">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('size')}</label>
                        <div className="flex flex-wrap gap-2">
                             {sizes.map(size => (
                                 <button
                                    key={size}
                                    onClick={() => updateFilter('size', filters.size === size ? 'All' : size)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                                        filters.size === size 
                                          ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                    }`}
                                 >
                                    {size}
                                 </button>
                             ))}
                        </div>
                     </div>

                     {/* Colors Filter */}
                     <div className="mb-8 lg:mb-0">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('color')}</label>
                        <div className="flex flex-wrap gap-2">
                             {uniqueColors.map(color => (
                                 <button
                                    key={color}
                                    onClick={() => updateFilter('color', filters.color === color ? 'All' : color)}
                                    title={color}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-110 ${
                                        filters.color === color 
                                          ? 'border-primary-600 ring-2 ring-primary-100 scale-110' 
                                          : 'border-slate-200'
                                    }`}
                                 >
                                    {color === 'All' ? (
                                        <span className="text-[10px] font-bold text-slate-500">All</span>
                                    ) : (
                                        <span 
                                            className="w-full h-full rounded-full" 
                                            style={{ backgroundColor: getColorHex(color) || 'transparent' }}
                                        >
                                            {!getColorHex(color) && <span className="text-[8px] flex w-full h-full items-center justify-center font-bold text-slate-500 bg-slate-100/50 rounded-full">{color.charAt(0)}</span>}
                                        </span>
                                    )}
                                 </button>
                             ))}
                        </div>
                     </div>
                 </div>
             </div>

             {/* Mobile Sticky Action Button */}
             <div className="p-4 border-t border-slate-100 bg-white lg:hidden mt-auto">
                 <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-base shadow-lg active:scale-95 transition-transform"
                 >
                     View {filteredProducts.length} Results
                 </button>
             </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 w-full min-h-[50vh]">
             <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-lg">
                    {filters.category === 'All' ? 'All Products' : filters.category} 
                    <span className="text-slate-400 text-sm font-normal ml-2">({filteredProducts.length})</span>
                </h2>
             </div>

             {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    <LoadingSkeleton variant="card" count={8} />
                </div>
            ) : filteredProducts.length === 0 ? (
                <EmptyState 
                    title={t('noProducts')} 
                    description={t('noProductMatch')}
                    action={() => setFilters({ category: 'All', priceRange: [0, 10000], size: 'All', color: 'All', search: '' })}
                    actionLabel="Clear Filters"
                />
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                        {displayedProducts.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onImageClick={(data) => setSelectedImage(data)} 
                            />
                        ))}
                    </div>
                    {visibleCount < filteredProducts.length && (
                        <div className="mt-12 text-center pb-8">
                            <button 
                                onClick={() => setVisibleCount(prev => prev + 24)}
                                className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm active:scale-95"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </>
            )}
          </div>
      </div>

       {/* Lightbox */}
       {selectedImage && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm select-none" onClick={() => setSelectedImage(null)}>
            
            <button className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50" onClick={() => setSelectedImage(null)}>
                <X size={24} />
            </button>

            {selectedImage.images.length > 1 && (
                <>
                    {/* Desktop Navigation Arrows */}
                    <button 
                        className="absolute left-4 p-3 text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50 backdrop-blur-md hidden md:block"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }));
                        }}
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button 
                        className="absolute right-4 p-3 text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50 backdrop-blur-md hidden md:block"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }));
                        }}
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* Mobile & Desktop Thumbnails */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4 z-50 overflow-x-auto py-2">
                        {selectedImage.images.map((img, idx) => (
                             <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(prev => ({ ...prev, index: idx }));
                                }}
                                className={`w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 overflow-hidden transition-all flex-shrink-0 ${selectedImage.index === idx ? 'border-primary-500 scale-110 opacity-100' : 'border-white/40 opacity-50 hover:opacity-100 hover:border-white'}`}
                             >
                                 <img src={img} className="w-full h-full object-cover" alt={`View ${idx + 1}`} />
                             </button>
                        ))}
                    </div>
                </>
            )}

            <div 
                className="relative w-full h-full flex flex-col items-center justify-center pb-20 md:pb-0" 
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => {
                    e.stopPropagation();
                    setTouchStart(e.targetTouches[0].clientX);
                    setTouchEnd(null);
                }}
                onTouchMove={(e) => {
                    e.stopPropagation();
                    setTouchEnd(e.targetTouches[0].clientX);
                }}
                onTouchEnd={(e) => {
                    e.stopPropagation();
                    if (!touchStart || !touchEnd) return;
                    const distance = touchStart - touchEnd;
                    const minSwipeDistance = 50;
                    
                    if (distance > minSwipeDistance) {
                        // Swipe Left -> Next
                         if (selectedImage.images.length > 1) {
                            setSelectedImage(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }));
                         }
                    } else if (distance < -minSwipeDistance) {
                        // Swipe Right -> Prev
                         if (selectedImage.images.length > 1) {
                            setSelectedImage(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }));
                         }
                    }
                }}
            >
                <img 
                    src={selectedImage.images[selectedImage.index]} 
                    className="max-w-[95vw] max-h-[70vh] md:max-h-[85vh] object-contain rounded-lg shadow-2xl animate-fade-in touch-none select-none" 
                    alt="Full View" 
                    draggable="false"
                />
            </div>
        </div>, document.body
      )}
    </div>
  );
};

export default Catalogue;
