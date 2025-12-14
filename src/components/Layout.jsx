import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { useShop } from '../context/ShopContext';
import CartDrawer from './CartDrawer';
import WishlistDrawer from './WishlistDrawer';
import InstallPrompt from './InstallPrompt';

const Layout = ({ children }) => {
  const { setIsCartOpen } = useShop();
  const location = useLocation();

  useEffect(() => {
    setIsCartOpen(false);
  }, [location.pathname, setIsCartOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <BottomNav />

      <CartDrawer />
      <WishlistDrawer />
      <InstallPrompt />
    </div>
  );
};

export default Layout;
