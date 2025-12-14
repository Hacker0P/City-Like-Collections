import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, LogIn, LayoutDashboard, User, LogOut, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { supabase } from '../supabaseClient';

const Navbar = () => {
    const { t, language, toggleLanguage } = useLanguage();
    const { currentUser } = useAuth();
    const { setIsCartOpen, cartCount } = useShop();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = async () => {
        try {
            // Manually clear local storage to force logout without triggering 403 network errors
            // Supabase uses keys like `sb-<project ref>-auth-token`
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    localStorage.removeItem(key);
                }
            });
            // Force reload to update auth state immediately
            window.location.href = '/login';
            return;
        } catch (error) {
            // Ignore errors during logout (like 403 if token expired)
            console.log("Logout cleanup");
        } finally {
            navigate('/login');
        }
    };

    return (
        <header className="relative md:sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 h-[70px]">
           <div className="container mx-auto px-4 h-full flex items-center justify-between">
               
               {/* Brand */}
               <Link to="/" className="flex items-center gap-3 group">
                  <img src="/clc_logo.png" alt="Logo" className="w-10 h-10 rounded-lg shadow-md group-hover:scale-105 transition-transform object-cover" />
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                      CityLike<span className="text-primary-600">Collection</span>
                  </span>
               </Link>


               {/* Search Bar (Desktop) - Hidden on Home */}
               {location.pathname !== '/' && (
                   <div className="hidden md:block flex-1 max-w-lg mx-8">
                       <div className="relative">
                           <input
                             type="text"
                             className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-200 focus:bg-white border-transparent focus:border-primary-500 rounded-lg focus:ring-2 focus:ring-primary-200 transition-all font-medium text-slate-800"
                             placeholder="Search for products..."
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/catalogue?search=${searchTerm}`)}}
                           />
                           <button 
                             onClick={() => navigate(`/catalogue?search=${searchTerm}`)}
                             className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors"
                           >
                               <Search size={18} />
                           </button>
                       </div>
                   </div>
               )}

               {/* Actions */}
               <div className="flex items-center gap-2">
                   
                   <button 
                     onClick={toggleLanguage}
                     className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                     title="Change Language"
                   >
                     <Globe size={18} />
                     <span>{language === 'en' ? 'EN' : 'BN'}</span>
                   </button>

                   <div className="hidden md:flex items-center gap-2">
                       {currentUser ? (
                           <>
                               <Link to="/shopkeeper" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Dashboard">
                                   <LayoutDashboard size={18} /> Dashboard
                               </Link>
                               <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Profile">
                                   <User size={18} /> Profile
                               </Link>
                               <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
                                   <LogOut size={18} />
                               </button>
                           </>
                       ) : (
                           <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 hover:shadow-lg transition-all active:scale-95">
                               <LogIn size={18} /> Login
                           </Link>
                       )}
                   </div>
               </div>
           </div>
        </header>
    );
};

export default Navbar;
