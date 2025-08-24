"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function ConditionalHeader({ 
  cities = [], 
  areas = [], 
  selectedCity, 
  selectedArea, 
  onCityChange, 
  onAreaChange 
}) {
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const cityDropdownRef = useRef(null);
  const areaDropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Hide header on admin pages, offer submission page, and static pages
  const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/admin-secret');
  const isOfferSubmissionPage = pathname === '/offer-submission';
  const isStaticPage = ['/about', '/contact', '/privacy', '/terms', '/sitemap'].includes(pathname);

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
    router.push('/');
    window.location.href = '/';
  };

  if (isAdminPage || isOfferSubmissionPage || isStaticPage) {
    return null;
  }

  return (
    <header className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-full px-2 sm:px-6 py-2 flex justify-between items-center gap-1 sm:gap-3 z-50 transition-all w-[95%] max-w-5xl">
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

      {/* Desktop Navigation */}
      <nav className="hidden sm:flex items-center gap-2 whitespace-nowrap min-w-0">
        {/* Reset Filters Button */}
        {(selectedCity !== "All Cities" || selectedArea !== "All Areas") && (
          <button
            onClick={() => {
              onCityChange({ target: { value: "All Cities" } });
              onAreaChange({ target: { value: "All Areas" } });
            }}
            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium transition-all px-3 py-1.5 rounded-full bg-white shadow-sm border border-red-200 hover:border-red-300 min-w-0"
            title="Reset all filters"
          >
            🔄 Reset
          </button>
        )}

        {/* City dropdown */}
        <div className="relative" ref={cityDropdownRef}>
          <button
            onClick={() => setShowCityDropdown((prev) => !prev)}
            className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-300 min-w-0"
          >
            🗺️
            <span className="truncate max-w-[120px]">
              {selectedCity === "All Cities" ? "City" : selectedCity}
            </span>
          </button>

          {showCityDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 max-h-72 overflow-y-auto bg-gradient-to-br from-white via-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-xl z-50 overflow-hidden">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={(e) => {
                    onCityChange({ target: { value: city } });
                    setShowCityDropdown(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm transition font-medium ${selectedCity === city ? "bg-purple-100 text-indigo-700" : "text-gray-700 hover:bg-purple-50"}`}
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
            className={`flex items-center gap-1 text-sm font-medium transition-colors px-3 py-1.5 rounded-full shadow-sm border min-w-0 ${
              selectedCity === "All Cities" 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-white text-gray-700 hover:text-indigo-600 border-gray-300"
            }`}
          >
            📍
            <span className="truncate max-w-[120px]">
              {selectedArea === "All Areas" ? "Area" : selectedArea}
            </span>
          </button>

          {showAreaDropdown && selectedCity !== "All Cities" && (
            <div className="absolute top-full left-0 mt-2 w-64 max-h-72 overflow-y-auto bg-gradient-to-br from-white via-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <button
                onClick={(e) => {
                  onAreaChange({ target: { value: "All Areas" } });
                  setShowAreaDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm transition font-medium ${selectedArea === "All Areas" ? "bg-purple-100 text-indigo-700" : "text-gray-700 hover:bg-purple-50"}`}
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
                  className={`block w-full text-left px-4 py-2 text-sm transition font-medium ${selectedArea === area ? "bg-purple-100 text-indigo-700" : "text-gray-700 hover:bg-purple-50"}`}
                >
                  📍 {area}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="sm:hidden flex items-center gap-1">
        {/* Reset Button - Outside Magnifying Glass */}
        {(selectedCity !== "All Cities" || selectedArea !== "All Areas") && (
          <button
            onClick={() => {
              onCityChange({ target: { value: "All Cities" } });
              onAreaChange({ target: { value: "All Areas" } });
            }}
            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-medium transition-all px-2 py-1.5 rounded-full bg-white shadow-sm border border-red-200 hover:border-red-300"
            title="Reset all filters"
          >
            <span>↺</span>
          </button>
        )}

        {/* Filter Toggle Button with Magnifying Glass */}
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 text-xs font-medium transition-colors px-2 py-1.5 rounded-full bg-white shadow-sm border border-gray-300"
          >
            <span>🔍</span>
            <span className="hidden">Filters</span>
          </button>

          {/* Mobile Filters Inside Magnifying Glass */}
          {showFilters && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 min-w-[280px] max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col gap-3">
                {/* Reset Button */}
                {(selectedCity !== "All Cities" || selectedArea !== "All Areas") && (
                  <button
                    onClick={() => {
                      onCityChange({ target: { value: "All Cities" } });
                      onAreaChange({ target: { value: "All Areas" } });
                      setShowFilters(false);
                    }}
                    className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium transition-all px-3 py-2 rounded-lg bg-white shadow-sm border border-red-200 hover:border-red-300"
                  >
                    🔄 Reset All Filters
                  </button>
                )}

                {/* City Filter - All Cities */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">City</label>
                  <div className="grid grid-cols-2 gap-2">
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          onCityChange({ target: { value: city } });
                          setShowFilters(false);
                        }}
                        className={`px-3 py-2 text-xs rounded-lg transition font-medium ${
                          selectedCity === city 
                            ? "bg-purple-100 text-indigo-700 border border-purple-300" 
                            : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {city === "All Cities" ? "🌐 All" : city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Area Filter - Always show, not conditional */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Area</label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Show "All Areas" option first */}
                    <button
                      onClick={() => {
                        onAreaChange({ target: { value: "All Areas" } });
                        setShowFilters(false);
                      }}
                      className={`px-3 py-2 text-xs rounded-lg transition font-medium ${
                        selectedArea === "All Areas" 
                          ? "bg-purple-100 text-indigo-700 border border-purple-300" 
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      🗺️ All
                    </button>
                    
                    {/* Show areas for selected city, or all areas if "All Cities" is selected */}
                    {(selectedCity === "All Cities" ? areas : areas).map((area, index) => (
                      <button
                        key={`${area}-${index}`}
                        onClick={() => {
                          onAreaChange({ target: { value: area } });
                          setShowFilters(false);
                        }}
                        className={`px-3 py-2 text-xs rounded-lg transition font-medium ${
                          selectedArea === area 
                            ? "bg-purple-100 text-indigo-700 border border-purple-300" 
                            : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {area === "All Areas" ? "🗺️ All" : area}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  ✕ Close
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Dropdowns */}
      {showCityDropdown && (
        <div className="sm:hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Select City</h3>
              <button onClick={() => setShowCityDropdown(false)} className="text-gray-500">✕</button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    onCityChange({ target: { value: city } });
                    setShowCityDropdown(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium ${
                    selectedCity === city ? "bg-purple-100 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {city === "All Cities" ? "🌐 All Cities" : `🏙️ ${city}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAreaDropdown && selectedCity !== "All Cities" && (
        <div className="sm:hidden absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Select Area</h3>
              <button onClick={() => setShowAreaDropdown(false)} className="text-gray-500">✕</button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              <button
                onClick={() => {
                  onAreaChange({ target: { value: "All Areas" } });
                  setShowAreaDropdown(false);
                }}
                className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium ${
                  selectedArea === "All Areas" ? "bg-purple-100 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                🗺️ All Areas
              </button>
              {areas.map((area, index) => (
                <button
                  key={`${area}-${index}`}
                  onClick={() => {
                    onAreaChange({ target: { value: area } });
                    setShowAreaDropdown(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition font-medium ${
                    selectedArea === area ? "bg-purple-100 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  📍 {area}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 