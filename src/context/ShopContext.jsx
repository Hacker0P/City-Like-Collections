import React, { createContext, useState, useEffect, useContext } from 'react';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

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

  const addToCart = (product, selectedSize, selectedColor) => {
    setCart(prev => {
      // Check if item exists with same ID, Size, and Color
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
      );

      if (existing) {
        return prev.map(item => 
          item === existing 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, selectedSize, selectedColor, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId, size, color) => {
    setCart(prev => prev.filter(item => 
      !(item.id === itemId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const updateQuantity = (itemId, size, color, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId && item.selectedSize === size && item.selectedColor === color) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
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
      cartCount
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
