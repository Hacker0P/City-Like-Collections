import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LogIn, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
          console.error("Login Error Details:", error);
          if (error.message === 'Email not confirmed') {
              throw new Error('Please confirm your email address.');
          } else if (error.message === 'Invalid login credentials') {
              throw new Error('Invalid email or password.');
          } else {
              throw error;
          }
      }
      
      if (data.session) {
        navigate('/shopkeeper');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/30 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/30 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none"></div>

        {/* Back Button */}
        <button 
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 text-sm font-bold z-20"
        >
            <ArrowRight size={16} className="rotate-180" /> Back to Store
        </button>

      <div className="w-full max-w-[360px] bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 overflow-hidden border border-white/50 relative z-10 animate-slide-up">
        
        {/* Header - Compact & Friendly */}
        <div className="pt-8 pb-4 px-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4 text-white hover:scale-105 transition-transform duration-500">
                <LogIn size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Welcome Back!</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Please sign in to continue</p>
        </div>

        {/* Form */}
        <div className="px-8 pb-8 pt-2">
            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold text-center mb-5 border border-red-100 animate-pulse">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                    <div className="relative group">
                        <input 
                            type="email" 
                            required
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400 group-hover:border-slate-300 shadow-sm"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="relative group">
                        <input 
                            type={showPassword ? "text" : "password"}
                            required
                            className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400 group-hover:border-slate-300 shadow-sm"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-1">
                    <a href="#" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors">Forgot Password?</a>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 text-sm mt-2"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <div className="mt-8 text-center relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative z-10 inline-block bg-white/70 backdrop-blur-xl px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Or
                </div>
            </div>
            
            <div className="mt-4 text-center">
                <p className="text-slate-400 text-xs font-medium">
                    No account? <span className="text-slate-800 font-bold cursor-pointer hover:underline">Contact Admin</span>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
