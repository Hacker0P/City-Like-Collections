import React, { createContext, useState, useEffect, useContext } from 'react';
import Toast from '../components/Toast';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Load from LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('clc_cart');
    const savedWishlist = localStorage.getItem('clc_wishlist');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('clc_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('clc_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const addToCart = (product, selectedSize, selectedColor) => {
    let success = true;
    setCart(prev => {
      // Check if item exists with same ID, Size, and Color
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
      );

      const maxStock = Number(product.quantity) || 0;

      if (existing) {
        if (existing.quantity >= maxStock) {
            success = false;
            return prev;
        }
        return prev.map(item => 
          item === existing 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, selectedSize, selectedColor, quantity: 1, stockLimit: maxStock }];
    });
    
    if (success) {
        setIsCartOpen(true);
        showToast('Added to cart', 'success');
    } else {
        showToast('Cannot add more. Maximum stock reached.', 'error');
    }
  };

  const removeFromCart = (itemId, size, color) => {
    setCart(prev => prev.filter(item => 
      !(item.id === itemId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const updateQuantity = (itemId, size, color, delta) => {
    setCart(prev => {
        return prev.map(item => {
            if (item.id === itemId && item.selectedSize === size && item.selectedColor === color) {
                const newQty = item.quantity + delta;
                
                // Check max stock on increase
                if (delta > 0 && item.stockLimit && newQty > item.stockLimit) {
                    showToast('Maximum stock limit available reached', 'error');
                    return item;
                }

                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0);
    });
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        showToast('Removed from wishlist', 'info');
        return prev.filter(item => item.id !== product.id);
      }
      showToast('Added to wishlist', 'success');
      return [...prev, product];
    });
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <ShopContext.Provider value={{
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isCartOpen,
      setIsCartOpen,
      isWishlistOpen,
      setIsWishlistOpen,
      cartTotal,
      cartCount,
      showToast
    }}>
      {children}
      {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
      )}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
