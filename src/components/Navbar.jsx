import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingBag, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';
import '../styles/main.css';

const Navbar = () => {
  const { language, changeLanguage } = useLanguage();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "btn btn-primary" : "btn btn-outline";
  };

  // Determine if user is in "Shopkeeper Mode" (Dashboard or Profile)
  const isShopkeeper = location.pathname.startsWith('/shopkeeper') || location.pathname.startsWith('/profile');

  return (
    <nav className="modern-navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: 'var(--primary)', /* Indigo Logo */
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)'
          }}>
            <ShoppingBag size={20} color="white" />
          </div>
          <span className="heading-md brand-text" style={{ color: 'var(--text-main)', fontWeight: 700 }}>
            City Like Collection
          </span>
        </Link>

        <div className="desktop-only" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Language Toggle */}
          <button 
            onClick={() => changeLanguage(language === 'en' ? 'bn' : 'en')}
            className="btn btn-outline"
            style={{ borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            <span style={{ fontWeight: language === 'en' ? 700 : 500, color: language === 'en' ? 'var(--primary)' : 'inherit' }}>EN</span>
            <span style={{ margin: '0 4px', color: 'var(--border-color)' }}>|</span>
            <span style={{ fontWeight: language === 'bn' ? 700 : 500, color: language === 'bn' ? 'var(--primary)' : 'inherit' }}>বাংলা</span>
          </button>

          <Link to="/" className={isActive('/')} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontWeight: 600,
            color: 'var(--primary)', 
            background: 'var(--primary-light)', 
            padding: '0.5rem 1rem', 
            borderRadius: '8px' 
          }}>
            <ShoppingBag size={18} />
            <span>Shop</span>
          </Link>
          
          {isShopkeeper ? (
            <>
              <Link to="/shopkeeper" className={isActive('/shopkeeper')}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              
              <Link to="/profile" className={isActive('/profile')}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'white', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>P</span>
                </div>
                <span>Profile</span>
              </Link>

              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  // AuthContext will update state, causing redirect if on protected route
                  // But explicit navigation is safer UX
                  window.location.href = '/login'; 
                }}
                className="btn btn-ghost"
                style={{ padding: '0.5rem', color: '#dc2626' }}
                title="Log Out"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
             <Link to="/login" className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%', color: 'var(--text-secondary)' }} title="Shopkeeper Login">
                <LogIn size={20} />
             </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
