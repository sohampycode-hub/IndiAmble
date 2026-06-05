import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, IndianRupee, Sparkles, AlertCircle, Heart } from 'lucide-react';

export default function LocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Core profile loading states
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic database favorites tracking states
  const [isFavorited, setIsFavorited] = useState(false);
  const userEmail = localStorage.getItem('userEmail');

  // Core Hook 1: Fetch main regional profile document metadata bundle from Flask
  useEffect(() => {
    const fetchRegionDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/regions/${id}`);
        setRegion(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed pulling region bundle profiles:", err);
        setError("Could not resolve this specific region profile. Ensure database seeder matches fully.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRegionDetails();
  }, [id]);

  // Core Hook 2: Fetch and verify current favorite status from MongoDB for the active user
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!userEmail || !region) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/favorites`, {
          params: { email: userEmail }
        });
        
        // BULLETPROOF CHECK: Evaluate both region_id and id attributes, converting all to strings
        const matchFound = response.data.some(fav => {
          const favTargetId = fav.region_id || fav.id || fav._id;
          const currentPageId = region.region_id || id;
          return String(favTargetId) === String(currentPageId);
        });
        
        setIsFavorited(matchFound);
      } catch (err) {
        console.error("Failed evaluating favorites index:", err);
      }
    };
    if (region) checkFavoriteStatus();
  }, [region, id, userEmail]);

  // Handle addition/removal of favorites asynchronously
  const handleFavoriteToggle = async () => {
    if (!userEmail) {
      alert("Please log in to add items to your personal favorites profile dashboard.");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/favorites/toggle`, {
        email: userEmail,
        region_id: region.region_id || id // Ensure we pass the preferred database target ID standard
      });
      
      // Update state dynamically based on what the backend confirms
      if (response.data.status === "added") {
        setIsFavorited(true);
      } else {
        setIsFavorited(false);
      }
    } catch (err) {
      console.error("Could not sync favorite toggle values:", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-travelGreen border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Assembling region profiles, calculated expenditure layouts, and nested places records...</p>
      </div>
    );
  }

  if (error || !region) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <AlertCircle className="text-red-500 mx-auto mb-2" size={40} />
        <h3 className="font-bold text-red-800 text-lg">Failed to load region</h3>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-travelGreen text-white px-4 py-2 rounded-md font-bold text-sm cursor-pointer">Return to Dashboard</button>
      </div>
    );
  }

  // Safely bundle and filter all 4 region level images with static placeholders fallback logic
  const fallbackImage = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200";
  const imageGallery = [
    region.image1,
    region.image2,
    region.image3,
    region.image4
  ].map(img => img && img.trim() !== "" ? img : fallbackImage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Header Info Banner & Interactive Live Heart Button */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <div className="text-xs font-bold tracking-widest text-travelOrange uppercase mb-1">
            {region.state} Territory
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-travelSlate">{region.name}</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <MapPin size={14} /> Regional Exploration Hub
          </p>
        </div>

        {/* Dynamic Heart Toggle Button Layout */}
        <button
          onClick={handleFavoriteToggle}
          className={`p-3 rounded-full border shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 font-semibold text-sm
            ${isFavorited 
              ? 'bg-rose-50 border-rose-200 text-rose-600' 
              : 'bg-white border-gray-200 text-gray-400 hover:text-rose-500'}`}
          title={isFavorited ? "Remove from Favorites" : "Save to Favorites"}
        >
          <Heart size={20} className={isFavorited ? "fill-rose-600" : ""} />
          <span className="hidden sm:inline">{isFavorited ? "Saved" : "Favorite"}</span>
        </button>
      </div>

      {/* Region Overview Gallery: Displays all 4 images beautifully side-by-side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {imageGallery.map((imgUrl, index) => (
          <div key={index} className="h-64 bg-gray-100 rounded-xl overflow-hidden shadow-md border border-gray-100 group">
            <img 
              src={imgUrl} 
              alt={`${region.name} snapshot view ${index + 1}`} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {/* Main Structural Framework Flex Layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column Container: Narrative & Nested Attraction Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Text Overview Card */}
          <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100">
            <h2 className="text-xl font-bold font-heading text-travelGreen mb-3">About the Region</h2>
            <p className="text-gray-600 leading-relaxed font-normal">{region.description}</p>
            
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-100">
              <span className="bg-emerald-50 text-travelGreen px-3 py-1 rounded-md text-xs font-semibold uppercase">Style: {region.trip_type}</span>
              <span className="bg-blue-50 text-blue-800 px-3 py-1 rounded-md text-xs font-semibold uppercase">Budget: {region.budget_category}</span>
              <span className="bg-amber-50 text-amber-800 px-3 py-1 rounded-md text-xs font-semibold uppercase">Timeframe: {region.duration_category}</span>
            </div>
          </div>

          {/* Attractions Nested List Block (Renders 4 pictures per individual spot) */}
          <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100">
            <h2 className="text-xl font-bold font-heading text-travelGreen mb-4">
              Must-Visit Places inside {region.name}
            </h2>
            <div className="space-y-8">
              {region.places && region.places.map((place) => {
                const fallbackPlaceImg = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=600";
                const placeImages = [
                  place.image1,
                  place.image2,
                  place.image3,
                  place.image4
                ].map(img => img && img.trim() !== "" ? img : fallbackPlaceImg);

                return (
                  <div key={place.id} className="p-5 bg-gray-50 rounded-lg border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                    <div>
                      <h3 className="font-bold text-travelSlate text-lg mb-1">{place.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed font-normal">{place.description}</p>
                    </div>

                    {/* Nested Attraction Grid: Output all 4 sub-images side by side */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                      {placeImages.map((imgUrl, idx) => (
                        <div key={idx} className="h-28 bg-gray-200 rounded-md overflow-hidden border border-gray-100 shadow-xs group">
                          <img 
                            src={imgUrl} 
                            alt={`${place.name} scenery index ${idx + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column: Financial Estimates & Interactive Maps Interface */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold font-heading text-travelSlate mb-4 flex items-center gap-1.5 pb-2 border-b border-gray-100">
              <IndianRupee size={18} className="text-travelOrange" />
              <span>Projected Regional Budget</span>
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Accommodation Share</span>
                <span className="font-semibold text-travelSlate">₹{region.cost_breakdown?.accommodation || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Food & Local Dining</span>
                <span className="font-semibold text-travelSlate">₹{region.cost_breakdown?.food || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Transit Allowances</span>
                <span className="font-semibold text-travelSlate">₹{region.cost_breakdown?.transport || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Activities & Passes</span>
                <span className="font-semibold text-travelSlate">₹{region.cost_breakdown?.activities || 0}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-base font-bold text-travelGreen">
                <span>Estimated Total / person</span>
                <span>₹{region.estimated_cost_per_person || 0}</span>
              </div>
            </div>

            {/* Direct Context-Aware Call-to-Action routing to AiAgent.jsx */}
            <button
              onClick={() => navigate('/ai-agent', { state: { targetLocationContext: region.name } })}
              className="w-full bg-travelOrange text-white py-3 rounded-lg font-bold hover:bg-opacity-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mb-6 text-sm"
            >
              <Sparkles className="animate-spin" style={{ animationDuration: '3s' }} size={16} />
              <span>Plan This Trip With AI</span>
            </button>

            {/* Fully Functional Google Maps Embed Framework Interface container */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-travelSlate mb-3 flex items-center gap-1">
                <MapPin size={16} className="text-travelGreen" />
                <span>Explore Local Hotels & Spots</span>
              </h4>
              <div className="w-full h-60 rounded-lg overflow-hidden border border-gray-200 shadow-inner bg-gray-50">
                <iframe
                  title={`Google Map Location Context for ${region.name}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps/embed/v1/search?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_FREE_TIER_API_KEY'}&q=hotels+and+attractions+in+${encodeURIComponent(region.name)}&zoom=11`}
                ></iframe>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                Use pinch/scroll to interactively browse real-time regional stays.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}