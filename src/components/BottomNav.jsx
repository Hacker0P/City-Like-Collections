import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
    const location = useLocation();
    const { currentUser } = useAuth(); // We can check if shopkeeper logged in

    const isActive = (path) => {
        return location.pathname === path ? "var(--primary)" : "var(--text-secondary)";
    };

    return (
        <div className="mobile-only" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '64px',
            background: 'white',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 1000,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
            paddingBottom: 'safe-area-inset-bottom'
        }}>
            <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: isActive('/') }}>
                <ShoppingBag size={22} />
                <span style={{ fontSize: '10px', fontWeight: 600 }}>Shop</span>
            </Link>

            {currentUser ? (
                <>
                    <Link to="/shopkeeper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: isActive('/shopkeeper') }}>
                        <LayoutDashboard size={22} />
                        <span style={{ fontSize: '10px', fontWeight: 600 }}>Dashboard</span>
                    </Link>
                    <Link to="/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: isActive('/profile') }}>
                        <User size={22} />
                        <span style={{ fontSize: '10px', fontWeight: 600 }}>Profile</span>
                    </Link>
                </>
            ) : (
                <Link to="/login" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: isActive('/login') }}>
                    <User size={22} />
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>Shopkeeper</span>
                </Link>
            )}
        </div>
    );
};

export default BottomNav;
