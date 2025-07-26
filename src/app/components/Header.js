"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header({ 
  cities = [], 
  areas = [], 
  selectedCity, 
  selectedArea, 
  onCityChange, 
  onAreaChange 
}) {
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const cityDropdownRef = useRef(null);
  const areaDropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(e.target)) {
        setShowAreaDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    // Force navigation to home page and reset any state
    router.push('/');
    // Also trigger a page reload to ensure clean state
    window.location.href = '/';
  };

  return (
    <header className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-full px-3 sm:px-6 py-2 flex justify-between items-center gap-2 sm:gap-3 z-50 transition-all w-[95%] max-w-5xl">
      {/* Logo */}
      <div 
        onClick={handleLogoClick}
        className="flex items-center gap-1 group whitespace-nowrap min-w-0 hover:scale-105 transition-transform duration-200 cursor-pointer"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 relative flex-shrink-0">
          <Image
            src="https://res.cloudinary.com/dn4dv5zlz/image/upload/v1752256563/logo_bpjjex.png"
            alt="Offerbae Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="text-sm sm:text-base font-bold text-indigo-600 group-hover:text-purple-600 transition-colors truncate">
          fferBae
        </span>
      </div>

      <nav className="flex items-center gap-1 sm:gap-2 whitespace-nowrap min-w-0">
        {/* City dropdown */}
        <div className="relative" ref={cityDropdownRef}>
          <button
            onClick={() => setShowCityDropdown((prev) => !prev)}
            className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 text-xs sm:text-sm font-medium transition-colors px-2 sm:px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-300 min-w-0"
          >
            <span className="hidden sm:inline">🗺️</span>
            <span className="sm:hidden">📍</span>
            <span className="truncate max-w-[80px] sm:max-w-[120px]">
              {selectedCity === "All Cities" ? "City" : selectedCity}
            </span>
          </button>

          {showCityDropdown && (
            <div className="absolute top-full right-0 sm:left-0 mt-2 w-48 sm:w-64 max-h-72 overflow-y-auto bg-gradient-to-br from-white via-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={(e) => {
                    onCityChange({ target: { value: city } });
                    setShowCityDropdown(false);
                  }}
                  className={`block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm transition font-medium ${selectedCity === city ? "bg-purple-100 text-indigo-700" : "text-gray-700 hover:bg-purple-50"}`}
                >
                  {city === "All Cities" ? "🌐 All Cities" : `🏙️ ${city}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Area dropdown */}
        <div className="relative" ref={areaDropdownRef}>
          <button
            onClick={() => setShowAreaDropdown((prev) => !prev)}
            disabled={selectedCity === "All Cities"}
            className={`flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors px-2 sm:px-3 py-1.5 rounded-full shadow-sm border min-w-0 ${
              selectedCity === "All Cities" 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-white text-gray-700 hover:text-indigo-600 border-gray-300"
            }`}
          >
            <span className="hidden sm:inline">📍</span>
            <span className="sm:hidden">🏘️</span>
            <span className="truncate max-w-[80px] sm:max-w-[120px]">
              {selectedArea === "All Areas" ? "Area" : selectedArea}
            </span>
          </button>

          {showAreaDropdown && selectedCity !== "All Cities" && (
            <div className="absolute top-full right-0 sm:left-0 mt-2 w-48 sm:w-64 max-h-72 overflow-y-auto bg-gradient-to-br from-white via-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <button
                onClick={(e) => {
                  onAreaChange({ target: { value: "All Areas" } });
                  setShowAreaDropdown(false);
                }}
                className={`block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm transition font-medium ${selectedArea === "All Areas" ? "bg-purple-100 text-indigo-700" : "text-gray-700 hover:bg-purple-50"}`}
              >
                🗺️ All Areas
              </button>
              {areas.map((area, index) => (
                <button
                  key={`${area}-${index}`}
                  onClick={(e) => {
                    onAreaChange({ target: { value: area } });
                    setShowAreaDropdown(false);
                  }}
                  className={`block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm transition font-medium ${selectedArea === area ? "bg-purple-100 text-indigo-700" : "text-gray-700 hover:bg-purple-50"}`}
                >
                  📍 {area}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
