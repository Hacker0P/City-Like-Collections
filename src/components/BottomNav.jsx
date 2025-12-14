import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, LayoutDashboard, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

const BottomNav = () => {
    const location = useLocation();
    const { currentUser } = useAuth();
    const { isCartOpen, setIsCartOpen, cartCount } = useShop();

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label }) => {
        const active = isActive(to) && !isCartOpen;
        return (
            <Link 
                to={to} 
                onClick={() => setIsCartOpen(false)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 relative group ${active ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <div className="relative p-1.5 transition-all duration-300">
                     {active && (
                       <div className="absolute inset-0 bg-primary-50 rounded-xl scale-110 -z-10 animate-fade-in"></div>
                     )}
                    <Icon size={24} strokeWidth={active ? 2.5 : 2} className="transition-transform group-active:scale-90" />
                </div>
                <span className={`text-[10px] font-medium tracking-wide ${active ? 'font-bold' : ''}`}>
                    {label}
                </span>
                
                {/* Active Indicator Dot */}
                {active && (
                   <div className="absolute top-0 w-8 h-1 bg-primary-600 rounded-b-lg shadow-sm"></div>
                )}
            </Link>
        );
    };

    const CartButton = () => (
        <button 
            onClick={() => setIsCartOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 relative group ${isCartOpen ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <div className="relative p-1.5 transition-all duration-300">
                {isCartOpen && (
                    <div className="absolute inset-0 bg-primary-50 rounded-xl scale-110 -z-10 animate-fade-in"></div>
                )}
                <ShoppingBag size={24} strokeWidth={isCartOpen ? 2.5 : 2} className="transition-transform group-active:scale-90" />
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                        {cartCount}
                    </span>
                )}
            </div>
            <span className={`text-[10px] font-medium tracking-wide ${isCartOpen ? 'font-bold' : ''}`}>Cart</span>
            
            {/* Active Indicator Dot */}
            {isCartOpen && (
                <div className="absolute top-0 w-8 h-1 bg-primary-600 rounded-b-lg shadow-sm"></div>
            )}
        </button>
    );

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-stretch z-[100] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            
            {currentUser ? (
                <>
                    <NavItem to="/" icon={Home} label="Home" />
                    <CartButton />
                    <NavItem to="/shopkeeper" icon={LayoutDashboard} label="Admin" />
                    <NavItem to="/profile" icon={User} label="Profile" />
                </>
            ) : (
                <>
                     <NavItem to="/" icon={Home} label="Home" />
                     <CartButton />
                    <NavItem to="/login" icon={LogIn} label="Login" />
                </>
            )}
        </div>
    );
};

export default BottomNav;
