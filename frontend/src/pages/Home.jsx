import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, SlidersHorizontal, ChevronDown, Compass, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  
  // State variables for capturing filter form parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [travelType, setTravelType] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedState, setSelectedState] = useState(''); // Stores selected string filter
  
  // UI view state controls
  const [showStateModal, setShowStateModal] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all available states on initialization
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/states`)
      .then(res => {
        // Safe check: ensure data is always stored as an array
        setStatesList(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error("Error pulling states structural maps:", err));
  }, []);

  // Trigger search updates whenever parameters or selected state changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFilteredResults();
    }, 300); // 300ms delay protects against flooding the server while typing
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, travelType, budget, duration, selectedState]);

  const fetchFilteredResults = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/search`, {
        params: {
          q: searchQuery,
          state: selectedState, // Pass selected cloud string filter
          travel_type: travelType,
          budget: budget,
          duration: duration
        }
      });
      setSearchResults(response.data);
    } catch (err) {
      console.error("Filtering system dropped a connection:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateSelection = (stateName) => {
    setSelectedState(stateName);
    setShowStateModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Welcome Banner */}
      <div className="text-center my-12">
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-travelGreen mb-4">
          Discover Incredible India, Personalized For You
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore historic valleys, golden coastal paradises, and vibrant cultures with real crowd insights and instant smart planning paths.
        </p>
      </div>

      {/* Main Search & Filtering Panel */}
      <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 mb-12">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search bar input field */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Where do you want to wander? (e.g., Leh, Goa, Manali)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-travelGreen font-medium text-travelSlate"
            />
          </div>

          {/* Browse by State Button */}
          <button
            onClick={() => setShowStateModal(true)}
            className="bg-travelGreen text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-opacity-95 transition-all cursor-pointer"
          >
            <MapPin size={18} />
            <span>{selectedState ? `State: ${selectedState}` : 'Browse by State'}</span>
            <ChevronDown size={16} />
          </button>
        </div>

        {/* Active State Filter Tag */}
        {selectedState && (
          <div className="flex items-center gap-2 mb-4 -mt-2">
            <span className="text-xs font-bold uppercase text-gray-400">Active Filter:</span>
            <div className="bg-orange-50 text-travelOrange text-xs font-bold px-3 py-1.5 rounded-full border border-orange-200 flex items-center gap-1.5">
              <span>{selectedState}</span>
              <X 
                size={14} 
                className="cursor-pointer hover:text-red-600" 
                onClick={() => setSelectedState('')} 
              />
            </div>
          </div>
        )}

        {/* Filter Toolbar Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
              <SlidersHorizontal size={12} /> Travel Type
            </label>
            <select 
              value={travelType} 
              onChange={(e) => setTravelType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-travelSlate rounded-md p-2.5 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-travelGreen"
            >
              <option value="">All Companionships</option>
              <option value="solo">Solo</option>
              <option value="family">Family</option>
              <option value="couple">Couple</option>
              <option value="group">Group</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Budget Range</label>
            <select 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-travelSlate rounded-md p-2.5 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-travelGreen"
            >
              <option value="">All Tiers</option>
              <option value="low-budget">Budget (₹0 - ₹5K)</option>
              <option value="mid-range">Mid-range (₹5K - ₹15K)</option>
              <option value="premium">Premium (₹15K+)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Duration Window</label>
            <select 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-travelSlate rounded-md p-2.5 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-travelGreen"
            >
              <option value="">Any Length</option>
              <option value="1 - 3 days">Short (1 - 3 days)</option>
              <option value="4 - 7 days">Medium (4 - 7 days)</option>
              <option value="8+ days">Long (8+ days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Target Destination Search Display Grid */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold font-heading text-travelSlate mb-6 flex items-center gap-2">
          <span>Explore Match Regions</span>
          {isLoading && <span className="text-sm font-normal text-gray-400 animate-pulse">(Updating matches...)</span>}
        </h2>

        {searchResults.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200 text-gray-500">
            <Compass size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No regions found matching the selected criteria.</p>
            <p className="text-sm text-gray-400 mt-1">Try broadening your tag filters or clearing your filters above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {searchResults.map((loc) => {
              const cleanId = loc.region_id ? loc.region_id.toString().replace("reg_", "") : loc.id;

              return (
                <motion.div 
                  key={loc._id}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col cursor-pointer"
                  onClick={() => navigate(`/region/${cleanId}`)}
                >
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <img 
                      src={loc.image1 || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=600"} 
                      alt={loc.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 text-travelGreen px-2.5 py-1 rounded-md text-xs font-bold shadow-xs">
                      ₹{loc.estimated_cost_per_person || loc.avg_cost_per_person || 0} / head
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold tracking-widest text-travelOrange uppercase">{loc.state}</span>
                      <h3 className="text-xl font-bold font-heading text-travelSlate mt-1 mb-2">{loc.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">{loc.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-50">
                      <span className="text-[11px] font-semibold bg-emerald-50 text-travelGreen px-2 py-0.5 rounded-sm capitalize">{loc.trip_type || 'Flexible'}</span>
                      <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-sm">{loc.duration_category || 'Flexible'}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pop-up Interactive State Choice Modal */}
      <AnimatePresence>
        {showStateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="p-5 bg-travelGreen text-white flex justify-between items-center">
                <h3 className="text-xl font-bold font-heading">Select an Indian State</h3>
                <button 
                  onClick={() => setShowStateModal(false)}
                  className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <p className="text-sm text-gray-500 mb-4 font-medium">Select a territory to explore available regions:</p>
                
                {statesList.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No states found in database collection.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {statesList.map((stateItem, index) => {
                      // Normalize the data shape safely handles both pure string arrays or object collections
                      const stateName = typeof stateItem === 'string' ? stateItem : (stateItem.state_name || stateItem.state || "");
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleStateSelection(stateName)}
                          className={`p-3 text-left border rounded-lg transition-all font-semibold flex items-center gap-2 cursor-pointer ${
                            selectedState === stateName 
                              ? 'border-travelOrange bg-orange-50/50 text-travelOrange' 
                              : 'border-gray-200 text-travelSlate hover:border-travelOrange hover:bg-orange-50/20'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${selectedState === stateName ? 'bg-travelOrange animate-pulse' : 'bg-gray-300'}`} />
                          <span className="truncate">{stateName}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}