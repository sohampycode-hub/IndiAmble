import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User as UserIcon, Mail, Heart, Calendar, LogOut } from 'lucide-react';

export default function User() {
  const navigate = useNavigate();
  
  const userName = localStorage.getItem('userName') || 'Traveler';
  const userEmail = localStorage.getItem('userEmail') || '';

  // Initialize with an empty array instead of mock values
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveUserFavorites = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/favorites`, {
          params: { email: userEmail }
        });
        setFavorites(response.data);
      } catch (err) {
        console.error("Could not sync profile database favorites:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveUserFavorites();
  }, [userEmail]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: User Information Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center h-fit">
          <div className="w-24 h-24 bg-emerald-50 border-2 border-travelGreen rounded-full flex items-center justify-center mb-4 shadow-sm">
            <UserIcon size={44} className="text-travelGreen" />
          </div>
          
          <h2 className="text-xl font-bold font-heading text-travelSlate capitalize">{userName}</h2>
          <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1 justify-center">
            <Calendar size={12} /> Member since 2026
          </p>
          
          <div className="w-full border-t border-gray-100 my-4 pt-4 text-left space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail size={16} className="text-travelOrange shrink-0" />
              <span className="truncate">{userEmail || 'No email attached'}</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full mt-2 bg-red-50 text-red-600 hover:bg-red-100/70 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Log Out Session</span>
          </button>
        </div>

        {/* Right Column: Dynamic Favorites Display */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold font-heading text-travelSlate mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Heart size={18} className="text-travelOrange fill-travelOrange" />
              <span>My Favorited Hotspots ({favorites.length})</span>
            </h3>

            {loading ? (
              <div className="text-center py-10 text-gray-400 text-sm animate-pulse">
                Synchronizing favorite metrics from database cluster nodes...
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border border-dashed border-gray-100 rounded-lg p-6 bg-gray-50/50 font-medium">
                <Heart size={32} className="mx-auto mb-2 text-gray-300" />
                <p>No destinations saved yet.</p>
                <p className="text-xs text-gray-400 mt-1">Head back to the explorer dashboard and click the heart icon on any destination profile!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {favorites.map((loc) => {
    // FIX: Read directly from the dynamic region_id field
    const targetPathId = loc.region_id;
    
    return (
      <div 
        key={loc._id} 
        onClick={() => navigate(`/region/${targetPathId}`)}
        className="border border-gray-100 bg-gray-50 rounded-lg overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow group"
      >
        <div className="h-32 bg-gray-200 overflow-hidden relative">
          <img 
            src={loc.image1 || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=400"} 
            alt={loc.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
          />
          <span className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-rose-500 shadow-xs">
            <Heart size={14} className="fill-rose-500" />
          </span>
        </div>
        <div className="p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-travelOrange">{loc.state}</span>
          <h4 className="font-bold text-sm text-travelSlate line-clamp-1 mt-0.5">{loc.name}</h4>
        </div>
      </div>
    );
  })}
</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}