"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function SearchForm({ 
  setSearchData, 
  setHospitals,
  setSelectedService,
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [service, setService] = useState("");
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [showAppointments, setShowAppointments] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const containerRef = useRef(null);

  // outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSuggestions([]);
        setShowAppointments(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    const delay = setTimeout(() => {
      if (!query) return;

      fetchSuggestions(query);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const fetchSuggestions = async (text) => {
    try {
      const res = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json`,
        {
          params: {
            access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
            autocomplete: true,
            limit: 8,
          },
        }
      );

      setSuggestions(res.data.features);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch recent appointments
  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        "https://hospital-resource-routing-sxdu.onrender.com/user/appointment"
      );
      
      // Get top 3 recent appointments
      const recentThree = res.data.slice(0, 3);
      setAppointments(recentThree);
      setShowAppointments(true);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      alert("Error fetching appointments");
    }
  };

  // When user selects suggestion
  const handleSelect = async (place) => {
    const [lng, lat] = place.center;

    setQuery(place.place_name);
    setSuggestions([]);

    setSearchData({ lat, lng, service });
    setCoords({ lat, lng });
  };

  // Live location
  const handleLiveLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setQuery("Current Location");
        setSuggestions([]);

        setSearchData({ lat, lng, service });
        setCoords({ lat, lng });
      },
      () => alert("Location permission denied")
    );
  };

  const handleSearch = async (lat, lng) => {
    if (!service) {
      alert("Please select a service");
      return;
    }
  
    if (!lat || !lng) {
      alert("Location missing");
      return;
    }
  
    setLoading(true);
    console.log(lat, lng, service);
  
    try {
      setSearchData({ lat, lng, service });
  
      const res = await axios.get(
        "https://hospital-resource-routing-sxdu.onrender.com/locations/nearest",
        {
          params: {
            lat,
            lng,
            service,
          },
        }
      );
  
      setHospitals(res.data);
  
    } catch (err) {
      console.error(err);
      alert("Error fetching hospitals");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return "Invalid Date";
    }
  };

  return (
    <div ref={containerRef} className="mb-4 relative">
      {/* Input */}
      <input
        type="text"
        placeholder="Search location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />

      {suggestions.length > 0 && (
        <div className="absolute bg-white w-full border rounded mt-1 shadow z-10">
          {/* Live Location */}
          <div
          onClick={handleLiveLocation}
          className="flex items-center justify-center gap-2 px-7 py-3 bg-blue-50 border border-blue-200 rounded-sm cursor-pointer font-medium text-blue-600 transition-all duration-250 hover:bg-blue-100 hover:border-blue-300 shadow-sm hover:shadow-md"
          >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <path d="M9 1.5C5.24 1.5 2.25 4.49 2.25 8.25C2.25 12.69 9 16.5 9 16.5S15.75 12.69 15.75 8.25C15.75 4.49 12.76 1.5 9 1.5ZM9 10.5C7.76 10.5 6.75 9.49 6.75 8.25C6.75 7.01 7.76 6 9 6C10.24 6 11.25 7.01 11.25 8.25C11.25 9.49 10.24 10.5 9 10.5Z" fill="currentColor"/>
          </svg>
           Live Location
          </div>

          {/* Suggestions */}
          {suggestions.map((place) => (
            <div
              key={place.id}
              onClick={() => handleSelect(place)}
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {place.place_name}
            </div>
          ))}
        </div>
      )}

      {/* Service */}
      <select
        value={service}
        onChange={(e) => {
          setService(e.target.value);
          setSelectedService(e.target.value);
        }}
        className="w-full p-3 text-md rounded-xl border border-gray-200 mt-3 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 transition"
      >
        <option value="" disabled>Select Service</option>
        <option value="beds">Beds</option>
        <option value="icu">ICU Beds</option>
        <option value="cardiology">Cardiologist</option>
        <option value="ventilator">Ventilator</option>
        <option value="stroke">Stroke</option>
        <option value="operation">Operation Theater</option>
      </select>

      {/* Buttons  */}
      <div className="flex gap-2 mt-3">
        {/* Find Nearest Button */}
        <button
          onClick={()=>{
            if(!coords) return alert("Select Location first");
            handleSearch(coords.lat, coords.lng);
          }}
          disabled={loading}
          className="flex-1 text-white border-2 border-blue-500 bg-blue-600 hover:bg-white hover:text-black p-1 rounded-md shadow-md hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
        >
          {loading ? "Searching..." : "Search"}
        </button>

        {/* Get Appointments Button */}
        <button
          onClick={fetchAppointments}
          className="flex-1 text-white border-2 border-green-500 bg-green-600 hover:bg-white hover:text-black p-1 rounded-md shadow-md hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
        >
          Recents
        </button>
      </div>

      {/* Appointments Dropdown */}
      {showAppointments && (
        <div className="absolute bg-white w-full border rounded-xl mt-3 shadow-lg z-20 max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">
                Recent Appointments
              </h3>
              <button
                onClick={() => setShowAppointments(false)}
                className="text-black font-extrabold hover:text-red-700"
              >
                ✕
              </button>
            </div>

            {appointments.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No appointments found</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt, index) => (
                  <div
                    key={apt.id || index}
                    className="p-1 bg-gray-50 rounded-xl border border-gray-500"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-800 capitalize">
                          {apt.service || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(apt.createdAt || apt.timestamp || apt.requestedAt)}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-medium capitalize ${getStatusColor(
                          apt.status
                        )}`}
                      >
                        {apt.status || "pending"}
                      </span>
                    </div>
                    {apt.status === "rejected" && apt.reason && (
                      <p className="text-sm text-red-500 mt-1">
                        Reason: {apt.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}