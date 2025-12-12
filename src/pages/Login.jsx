import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LogIn, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/shopkeeper');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-primary-600 p-8 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <LogIn size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-1">Welcome Back</h2>
                <p className="text-primary-100 font-medium">Sign in to manage your store</p>
            </div>
            
            {/* Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-primary-600 to-indigo-700"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        </div>

        {/* Form */}
        <div className="p-8">
            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 mb-6 border border-red-100">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                        <input 
                            type="email" 
                            required
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium text-slate-800"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            required
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium text-slate-800"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="text-right mt-2">
                        <a href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-700">Forgot Password?</a>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 active:scale-95 transition-all shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                    Don't have an account? <span className="text-slate-600 font-semibold cursor-pointer">Contact Administrator</span>
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
