import React from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import '../styles/main.css';

const Layout = ({ children }) => {
  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <Navbar />
      <main className="animate-fade-in">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
