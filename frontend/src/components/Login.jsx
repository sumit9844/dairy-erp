import React, { useState } from 'react';
import axios from 'axios';
import { Beaker, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Ensure the URL is exactly this:
      const res = await axios.post('http://localhost:5000/api/auth/login', { 
        email: email.trim(), 
        password: password 
      });
      
      // Save data to browser memory
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Tell the App we are logged in
      onLogin(res.data.user);
    } catch (err) {
      console.error("Login Error:", err.response);
      setError(err.response?.data?.error || "Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl">
          
          <div className="flex flex-col items-center mb-10">
            <div className="bg-blue-600 p-4 rounded-3xl mb-4 shadow-lg">
                <Beaker className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">DairyPro ERP</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Terminal Secure Login</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-2 text-sm font-bold animate-pulse">
                <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
                    <input 
                        type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                        placeholder="admin@dairy.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
                    <input 
                        type="password" required value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : "AUTHENTICATE & ENTER"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;