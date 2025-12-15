import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Shopkeeper from './pages/Shopkeeper';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Catalogue from './pages/Catalogue';
import ProductDetails from './pages/ProductDetails';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ShopProvider>
          <Layout>
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
          </Layout>
          </ShopProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
