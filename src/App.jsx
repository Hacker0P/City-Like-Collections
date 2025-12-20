import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const Shopkeeper = lazy(() => import('./pages/Shopkeeper'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const Catalogue = lazy(() => import('./pages/Catalogue'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));

import { ThemeProvider } from './context/ThemeContext';
import LoadingSkeleton from './components/LoadingSkeleton'; // Creating a reuseable full-screen loader below would be better, but we can inline a spinner for now.

// Simple Loading Spinner for Suspense fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LanguageProvider>
        <AuthProvider>
          <ShopProvider>
            <ThemeProvider>
              <ErrorBoundary>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                    <Route path="/catalogue" element={<Catalogue />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/shopkeeper" element={
                      <ProtectedRoute>
                        <Shopkeeper />
                      </ProtectedRoute>
                    } />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </Suspense>
              </Layout>
            </ErrorBoundary>
          </ThemeProvider>
        </ShopProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
