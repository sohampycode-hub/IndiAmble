import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'Traveler';

  const handleLogout = () => {
    localStorage.clear(); // Flushes token, email, and name caches simultaneously
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 bg-travelGreen text-white px-6 py-4 shadow-xl flex justify-between items-center w-full">
      {/* Website Logo & Name */}
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-wide">
        <Compass className="text-travelOrange animate-pulse" size={28} />
        <span className="text-white font-semibold">
          Indi<span className="text-travelOrange">Amble</span>
        </span>
      </Link>

      {/* Navigation Options */}
      <div className="flex items-center gap-6 font-medium">
        <Link to="/" className="text-white hover:text-travelOrange transition-colors">
          Explore
        </Link>
        <Link to="/ai-agent" className="bg-travelOrange text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-all text-sm font-semibold shadow-md">
          AI Guide
        </Link>
        
        {token ? (
          <div className="flex items-center gap-4 border-l border-emerald-900 pl-4">
            {/* Clickable Profile Badge Redirecting to User.jsx */}
            <Link 
              to="/profile" 
              className="flex items-center gap-1.5 text-sm bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/40 px-3 py-1.5 rounded-full text-white transition-colors cursor-pointer font-semibold"
            >
              <User size={16} className="text-travelOrange" />
              <span>Hi, {userName}</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="text-gray-200 hover:text-white flex items-center gap-1 text-sm transition-colors cursor-pointer font-semibold"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 border-l border-emerald-800 pl-4">
            <Link to="/login" className="text-white hover:text-travelOrange transition-colors">
              Login
            </Link>
            <Link to="/signup" className="bg-white text-travelGreen px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}