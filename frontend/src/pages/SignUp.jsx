import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, User, Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, {
        name,
        email,
        password
      });

      setSuccessMsg(response.data.message);
      // Wait exactly 1.5 seconds to display the visual success badge, then push user straight onto the login portal view grid
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error("Signup processing pipeline failure:", err);
      setError(err.response?.data?.message || "Registration processing failure. Ensure network connection is open.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-xl shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-travelGreen/20">
          <UserPlus className="text-travelGreen" size={24} />
        </div>
        <h2 className="text-2xl font-bold font-heading text-travelSlate">Create Account</h2>
        <p className="text-xs text-gray-500 mt-1">Join IndiAmble to curate, map, and organize trips effortlessly</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md mb-4 flex items-center gap-2 font-medium">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-travelGreen text-xs rounded-md mb-4 flex items-center gap-2 font-semibold animate-bounce">
          <CheckCircle size={14} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSignUpSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={16} />
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full bg-gray-50 border border-gray-200 rounded-md pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-travelGreen text-travelSlate"
            />
          </div>
        </div>

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
  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Choose Password</label>
  <div className="relative">
    <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
    <input 
      type={showPassword ? "text" : "password"}
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••"
      className="w-full bg-gray-50 border border-gray-200 rounded-md pl-10 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-travelGreen text-travelSlate"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-3 text-gray-400 hover:text-travelOrange transition-colors cursor-pointer"
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>
</div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-travelOrange text-white py-3 rounded-lg font-bold hover:bg-opacity-95 transition-all shadow-md text-sm cursor-pointer disabled:opacity-50"
        >
          {loading ? "Assembling database structural nodes..." : "Register Account"}
        </button>
      </form>

      <div className="text-center mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
        Already registered an account?{" "}
        <Link to="/login" className="text-travelGreen font-bold hover:underline">
          Login Portal
        </Link>
      </div>
    </div>
  );
}