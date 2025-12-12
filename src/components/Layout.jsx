import React from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { useShop } from '../context/ShopContext';
import CartDrawer from './CartDrawer';
import InstallPrompt from './InstallPrompt';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <BottomNav />

      <CartDrawer />
      <InstallPrompt />
    </div>
  );
};

export default Layout;
