import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Search, X, Check, SlidersHorizontal, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
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
      <div className="bg-white border-b border-slate-200 sticky top-[70px] z-30 shadow-sm">
          <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-4">
                  <button onClick={() => navigate('/')} className="md:hidden p-2 -ml-2 text-slate-500">
                     <ArrowLeft />
                  </button>
                  <div className="relative flex-1">
                      <input 
                          type="text" 
                          placeholder="Search for products..." 
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-800"
                          value={filters.search}
                          onChange={(e) => updateFilter('search', e.target.value)}
                      />
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  <button 
                    onClick={() => setShowMobileFilters(true)}
                    className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 lg:hidden relative"
                  >
                      <SlidersHorizontal size={20} />
                      {/* Active Filter Indicator could go here */}
                  </button>
              </div>
          </div>
      </div>

      <div className="container mx-auto px-4 mt-6 flex flex-col lg:flex-row gap-8 items-start">
        
          {/* Mobile Filter Backdrop */}
          {showMobileFilters && (
              <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
          )}

          {/* Filters Sidebar */}
          <div className={`fixed inset-y-0 right-0 lg:left-0 z-50 w-80 bg-white p-6 shadow-2xl transition-transform duration-300 lg:sticky lg:top-32 lg:z-10 lg:block lg:shadow-none lg:bg-transparent lg:p-0 lg:w-64 lg:translate-x-0 ${showMobileFilters ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 lg:hidden">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Filter size={18} /> Filters
                </h3>
                <button onClick={() => setShowMobileFilters(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
             </div>
             
             <div className="bg-white lg:rounded-2xl lg:border lg:border-slate-200 lg:p-6 lg:shadow-sm">
                 {/* Reset */}
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 hidden lg:block">Filters</h3>
                    <button 
                        onClick={() => setFilters({ category: 'All', priceRange: [0, 10000], size: 'All', color: 'All', search: '' })}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wide"
                    >
                        Reset All
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
                 <div>
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

            <div className="relative w-full h-full flex flex-col items-center justify-center pb-20 md:pb-0" onClick={(e) => e.stopPropagation()}>
                <img 
                    src={selectedImage.images[selectedImage.index]} 
                    className="max-w-[95vw] max-h-[70vh] md:max-h-[85vh] object-contain rounded-lg shadow-2xl animate-fade-in" 
                    alt="Full View" 
                    onClick={(e) => { 
                        if (selectedImage.images.length > 1) {
                            setSelectedImage(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length })); 
                        }
                    }} 
                />
            </div>
        </div>, document.body
      )}
    </div>
  );
};

export default Catalogue;
