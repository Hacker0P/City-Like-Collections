import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Shopkeeper from './pages/Shopkeeper';
import Login from './pages/Login';
import Profile from './pages/Profile';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
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
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
