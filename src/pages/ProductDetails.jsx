import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, ShoppingBag, Truck, ShieldCheck, RefreshCcw, Star, ChevronLeft, ChevronRight, MessageCircle, ChevronDown, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { getColorHex } from '../utils/colors';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { addToCart, toggleWishlist, wishlist } = useShop();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [config, setConfig] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [showFullImage, setShowFullImage] = useState(false);
    const scrollRef = useRef(null);
    const modalScrollRef = useRef(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showFullImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showFullImage]);

    // Sync scroll with selection
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                left: selectedImage * scrollRef.current.offsetWidth,
                behavior: 'smooth'
            });
        }
    }, [selectedImage]);

    const handleScroll = () => {
        if (scrollRef.current) {
            const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth);
            if (index !== selectedImage && index >= 0 && index < (product?.images?.length || 0)) {
                // Using a debounce or check to prevent loop could be good, but for simple snap it depends on behavior
                // For now, only update if significantly different to drive desktop thumbnails?
                // Actually, if we update state here, it triggers the useEffect above which might fight.
                // Better approach: Only update state if the click originated change OR disable smooth scroll during manual swipe?
                // Standard React Carousel pattern:
                // Only update setSelectedImage if the scroll was user initiated.
                // Simple hack: check if the difference is large enough or just direct set.
                // We will set it, but we might need to be careful.
                // To avoid fighting, we can check if we are *already* at the target scroll position?
                // Let's rely on snapping.
                setSelectedImage(index);
            }
        }
    };

    const handleModalScroll = () => {
        if (modalScrollRef.current) {
            const index = Math.round(modalScrollRef.current.scrollLeft / modalScrollRef.current.offsetWidth);
            if (index !== selectedImage && index >= 0 && index < (product?.images?.length || 0)) {
                setSelectedImage(index);
            }
        }
    };

    const scrollModal = (direction) => {
        if (modalScrollRef.current) {
            const width = modalScrollRef.current.offsetWidth;
            const newIndex = direction === 'next' 
                ? Math.min(selectedImage + 1, (product?.images?.length || 0) - 1)
                : Math.max(selectedImage - 1, 0);
            
            modalScrollRef.current.scrollTo({
                left: newIndex * width,
                behavior: 'smooth'
            });
            // Update state immediately for responsiveness, though scroll handler will also catch up
            setSelectedImage(newIndex);
        }
    };

    // Sync modal scroll with selectedImage when modal opens or state changes
    useEffect(() => {
        if (showFullImage && modalScrollRef.current) {
            modalScrollRef.current.scrollTo({
                left: selectedImage * modalScrollRef.current.offsetWidth,
                behavior: 'auto'
            });
        }
    }, [showFullImage]);

    // Fetch store config for sharing
    useEffect(() => {
        const savedConfig = localStorage.getItem('clc_config');
        if (savedConfig) setConfig(JSON.parse(savedConfig));
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) {
                console.error("Error fetching product", error);
                setLoading(false);
                return;
            }
            
            setProduct(data);
            setLoading(false);
        };
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Product Not Found</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">The product you are looking for does not exist or has been removed.</p>
                <button 
                    onClick={() => navigate('/catalogue')}
                    className="px-6 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg font-bold"
                >
                    Back to Catalogue
                </button>
            </div>
        );
    }

    const sizes = product.sizes ? product.sizes.split(',').map(s => s.trim().toUpperCase()) : [];
    const colors = product.colors ? product.colors.split(',').map(c => c.trim().toUpperCase()) : [];
    const isWishlisted = wishlist.some(item => item.id === product.id);
    const isOutOfStock = parseInt(product.quantity) <= 0;
    
    // Fallback for images
    const images = product.images && product.images.length > 0 ? product.images : [];

    const handleAddToCart = () => {
        if ((sizes.length > 0 && !selectedSize)) {
            alert('Please select a size');
            return;
        }
        if ((colors.length > 0 && !selectedColor)) {
            alert('Please select a color');
            return;
        }
        addToCart(product, selectedSize || 'One Size', selectedColor || 'Any Color');
    };
    
    const handleShare = async () => {
        const shareData = {
            title: product.name,
            text: `Check out ${product.name} - ₹${product.price}\n\n${product.description || ''}`,
            url: window.location.href
        };
  
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.debug('Share cancelled');
        }
    };

    const handleBuyNow = () => {
        if ((sizes.length > 0 && !selectedSize)) {
            alert('Please select a size');
            return;
        }
        if ((colors.length > 0 && !selectedColor)) {
            alert('Please select a color');
            return;
        }

        const phoneNumber = config?.whatsapp || ''; 
        const message = `Hi! I want to buy this:\n\n*${product.name}*\nPrice: ₹${product.price}\n${selectedSize ? `Size: ${selectedSize}\n` : ''}${selectedColor ? `Color: ${selectedColor}\n` : ''}\nLink: ${window.location.href}`;
        
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 md:pb-12 animate-fade-in">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                <div className="container mx-auto px-4 h-[60px] flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-slate-200">
                        <ArrowLeft size={22} />
                    </button>
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] text-sm md:text-base">{product.name}</span>
                    <button onClick={handleShare} className="p-2 -mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-slate-200">
                        <Share2 size={22} />
                    </button>
                </div>
            </header>

            <div className="container mx-auto max-w-5xl">
                <div className="flex flex-col md:flex-row gap-0 md:gap-8 lg:gap-12 md:p-6 lg:p-8">
                    
                    {/* Image Gallery */}
                    <div className="flex-1 bg-white dark:bg-slate-900 md:rounded-3xl overflow-hidden shadow-sm md:border border-slate-100 dark:border-slate-800 relative group select-none">
                        {/* Main Image */}
                        <div className="aspect-[3/4] md:aspect-[4/5] bg-slate-100 dark:bg-slate-800 relative group">
                             {images.length > 0 ? (
                                <div 
                                    ref={scrollRef}
                                    onScroll={handleScroll}
                                    className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
                                    style={{ scrollbarWidth: 'none' }}
                                >
                                    {images.map((img, idx) => (
                                        <div key={idx} className="flex-none w-full h-full snap-center">
                                            <img 
                                                src={img} 
                                                alt={`${product.name} ${idx + 1}`} 
                                                className="w-full h-full object-cover cursor-zoom-in"
                                                onClick={() => setShowFullImage(true)}
                                            />
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <ShoppingBag size={64} />
                                </div>
                             )}

                             {/* Wishlist Fab */}
                             {/* Wishlist Fab */}
                             <button 
                                onClick={() => toggleWishlist(product)}
                                className="absolute top-4 right-4 p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-full shadow-lg z-10 active:scale-90 transition-all text-slate-700 dark:text-slate-200 hover:text-red-500"
                             >
                                 <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                             </button>

                             {images.length > 1 && (
                                <>
                                    <button 
                                        onClick={() => setSelectedImage(prev => (prev - 1 + images.length) % images.length)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white active:scale-95 transition-all z-10 hidden md:block"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button 
                                        onClick={() => setSelectedImage(prev => (prev + 1) % images.length)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white active:scale-95 transition-all z-10 hidden md:block"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                    
                                    {/* Mobile Dots */}
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden z-10">
                                        {images.map((_, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => setSelectedImage(idx)}
                                                className={`h-1.5 rounded-full transition-all shadow-sm ${selectedImage === idx ? 'w-4 bg-slate-900' : 'w-1.5 bg-white/60'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                             )}
                        </div>

                        {/* Thumbnails (Desktop) */}
                        {images.length > 1 && (
                            <div className="hidden md:flex p-4 gap-2 overflow-x-auto justify-center">
                                {images.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-slate-900 dark:border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 p-5 md:p-0 space-y-6 md:space-y-8">
                        <div>
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {isOutOfStock ? (
                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
                                ) : (
                                    <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-wider">In Stock</span>
                                )}
                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold uppercase tracking-wider">{product.category}</span>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-2">{product.name}</h1>
                            
                            <div className="flex items-end gap-3 mb-4">
                                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{product.price}</span>
                                {/* Optional: Fake strikethrough price if you had one */}
                                {/* <span className="text-lg text-slate-400 line-through mb-1">₹{Number(product.price) + 500}</span> */}
                            </div>

                            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-50 dark:border-indigo-900/30">
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {product.description || "No description available for this product."}
                                </p>
                            </div>

                            {/* Detailed Sections (Accordion-like) */}
                            <div className="space-y-3 pt-2">
                                <details className="group p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 open:bg-slate-50 dark:open:bg-slate-800/50 transition-colors">
                                    <summary className="flex justify-between items-center font-bold text-slate-900 dark:text-white cursor-pointer list-none">
                                        <span>Product Specifications</span>
                                        <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 space-y-2 animate-fade-in">
                                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-slate-500 dark:text-slate-500">Material</span>
                                            <span className="font-medium text-slate-900 dark:text-white">Premium Cotton Blend</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-slate-500 dark:text-slate-500">Fit</span>
                                            <span className="font-medium text-slate-900 dark:text-white">Regular Fit</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-slate-500 dark:text-slate-500">Pattern</span>
                                            <span className="font-medium text-slate-900 dark:text-white">Solid / Printed</span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="text-slate-500 dark:text-slate-500">Country of Origin</span>
                                            <span className="font-medium text-slate-900 dark:text-white">India</span>
                                        </div>
                                    </div>
                                </details>

                                <details className="group p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 open:bg-slate-50 dark:open:bg-slate-800/50 transition-colors">
                                    <summary className="flex justify-between items-center font-bold text-slate-900 dark:text-white cursor-pointer list-none">
                                        <span>Shipping & Returns</span>
                                        <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 space-y-3 animate-fade-in">
                                        <p>Free shipping on orders above ₹999. Typical delivery time is 3-5 business days.</p>
                                        <p>Hassle-free returns within 7 days of delivery. No questions asked.</p>
                                    </div>
                                </details>
                            </div>
                        </div>

                        {/* Selection */}
                        <div className="space-y-6">
                            {(sizes.length > 0 || colors.length > 0) && <hr className="border-slate-100" />}
                            
                            {/* Colors */}
                            {colors.length > 0 && (
                                <div>
                                    <label className="text-sm font-bold text-slate-900 dark:text-white mb-3 block">Color: <span className="font-normal text-slate-500 dark:text-slate-400">{selectedColor || 'Select'}</span></label>
                                    <div className="flex flex-wrap gap-3">
                                        {colors.map(color => (
                                            <button 
                                                key={color} 
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-900 scale-110' : 'hover:scale-105'}`}
                                                style={{ backgroundColor: getColorHex(color) || '#f1f5f9' }}
                                                title={color}
                                            >
                                                {selectedColor === color && (
                                                    <div className="bg-white/20 dark:bg-black/20 p-1 rounded-full backdrop-blur-sm">
                                                        <ShieldCheck className="w-5 h-5 text-slate-900 dark:text-white mix-blend-screen" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sizes */}
                            {sizes.length > 0 && (
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-sm font-bold text-slate-900 dark:text-white">Size: <span className="font-normal text-slate-500 dark:text-slate-400">{selectedSize || 'Select'}</span></label>
                                        <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Size Guide</button>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {sizes.map(size => (
                                            <button 
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`min-w-[3.5rem] h-12 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                                                    selectedSize === size 
                                                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-lg' 
                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-2 py-6 border-y border-slate-100 dark:border-slate-800">
                             <div className="flex flex-col items-center text-center gap-2">
                                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
                                     <Truck size={18} />
                                 </div>
                                 <span className="text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-400">Fast Delivery</span>
                             </div>
                             <div className="flex flex-col items-center text-center gap-2">
                                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
                                     <RefreshCcw size={18} />
                                 </div>
                                 <span className="text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-400">Easy Returns</span>
                             </div>
                             <div className="flex flex-col items-center text-center gap-2">
                                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
                                     <Star size={18} />
                                 </div>
                                 <span className="text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-400">Top Quality</span>
                             </div>
                        </div>

                        {/* Desktop Add to Cart */}

                        <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-4 md:pt-0">
                            <button 
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className={`flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 ${
                                    isOutOfStock 
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none' 
                                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 hover:shadow-2xl'
                                }`}
                            >
                                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                            </button>
                            <button 
                                onClick={handleBuyNow}
                                disabled={isOutOfStock}
                                className="hidden md:flex flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-xl active:scale-95 transition-all items-center justify-center gap-3 bg-[#25D366] text-white hover:bg-[#20bd5a] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                                Buy on WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl border-t border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6">You Might Also Like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {similarProducts.map(p => (
                            <div key={p.id} className="h-72 md:h-96">
                                <ProductCard product={p} config={config} />
                            </div>
                        ))}
                    </div>
                </div>
            )}


        {/* Full Screen Image Modal */}
            {showFullImage && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="relative w-full max-w-lg bg-black rounded-3xl overflow-hidden shadow-2xl h-[70vh] flex flex-col">
                        <button 
                            onClick={() => setShowFullImage(false)}
                            className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full z-20 backdrop-blur-md active:scale-95 transition-all border border-white/10"
                        >
                            <X size={24} />
                        </button>
                        
                        <div 
                            ref={modalScrollRef}
                            onScroll={handleModalScroll}
                            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar items-center overscroll-x-contain"
                            style={{ scrollbarWidth: 'none' }}
                        >
                            {images.map((img, idx) => (
                                <div key={idx} className="flex-none w-full h-full snap-center flex items-center justify-center bg-black">
                                    <TransformWrapper
                                        initialScale={1}
                                        minScale={1}
                                        maxScale={4}
                                        alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
                                    >
                                        <TransformComponent
                                            wrapperStyle={{ width: "100%", height: "100%" }}
                                            contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                                        >
                                            <img 
                                                src={img} 
                                                alt={`${product.name} zoom ${idx + 1}`} 
                                                className="max-w-full max-h-full object-contain"
                                                draggable="false"
                                            />
                                        </TransformComponent>
                                    </TransformWrapper>
                                </div>
                            ))}
                        </div>

                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none p-4">
                            {images.map((_, idx) => (
                                <div 
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all shadow-md ${selectedImage === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
                                />
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        {images.length > 1 && (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); scrollModal('prev'); }}
                                    className={`absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/20 text-white rounded-full backdrop-blur-md border border-white/10 active:scale-95 transition-all z-20 ${selectedImage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); scrollModal('next'); }}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/20 text-white rounded-full backdrop-blur-md border border-white/10 active:scale-95 transition-all z-20 ${selectedImage === images.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
