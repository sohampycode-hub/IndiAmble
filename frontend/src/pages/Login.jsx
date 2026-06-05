import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        email,
        password
      });

      // Save token session tags securely inside browser storage blocks
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userName', response.data.userName);
      localStorage.setItem('userEmail', email); // <-- ADD THIS LINE!

      // Force instant routing back onto landing catalog dashboard view layout
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error("Login verification connection collapsed:", err);
      setError(err.response?.data?.message || "Authentication credentials mismatch or server is unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-xl shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-travelOrange/20">
          <LogIn className="text-travelOrange" size={24} />
        </div>
        <h2 className="text-2xl font-bold font-heading text-travelSlate">Welcome Back to IndiAmble</h2>
        <p className="text-xs text-gray-500 mt-1">Unlock tailored exploration paths and smart dashboard feeds</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md mb-4 flex items-center gap-2 font-medium">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-md pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-travelGreen text-travelSlate"
            />
          </div>
        </div>

        <div>
  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Account Password</label>
  <div className="relative">
    <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
    <input 
      type={showPassword ? "text" : "password"} // Dynamic switch!
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••"
      className="w-full bg-gray-50 border border-gray-200 rounded-md pl-10 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-travelGreen text-travelSlate"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-3 text-gray-400 hover:text-travelGreen transition-colors cursor-pointer"
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>
</div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-travelGreen text-white py-3 rounded-lg font-bold hover:bg-opacity-95 transition-all shadow-md text-sm cursor-pointer disabled:opacity-50"
        >
          {loading ? "Authenticating user matching models..." : "Log In Securely"}
        </button>
      </form>

      <div className="text-center mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
        Don't have an active profile?{" "}
        <Link to="/signup" className="text-travelOrange font-bold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}