"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header({ cities = [], selectedCity, onCityChange }) {
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Remove duplicates from cities array
  const uniqueCities = [...new Set(cities.filter((c) => c !== "All"))];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-full px-6 py-2 flex justify-between items-center gap-3 z-50 transition-all w-[95%] max-w-5xl">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1 group whitespace-nowrap">
        <div className="w-7 h-7 relative">
          <Image
            src="https://res.cloudinary.com/dn4dv5zlz/image/upload/v1752256563/logo_bpjjex.png"
            alt="O"
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="text-base font-bold text-indigo-600 group-hover:text-purple-600 transition-colors">
          fferBae
        </span>
      </Link>

      <nav className="flex items-center gap-2 whitespace-nowrap">
        {/* City dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowCityDropdown((prev) => !prev)}
            className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-300"
          >
            📍 {selectedCity === "All" ? "Select City" : selectedCity}
          </button>

          {showCityDropdown && (
            <div className="absolute top-full left-0 mt-2 w-44 bg-gradient-to-br from-white via-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <button
                onClick={(e) => {
                  onCityChange({ target: { value: "All" } });
                  setShowCityDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm transition font-medium ${selectedCity === "All" ? "bg-purple-100 text-indigo-700" : "text-gray-700 hover:bg-purple-50"}`}
              >
                🌐 All Cities
              </button>
              {uniqueCities.map((city) => (
                <button
                  key={city}
                  onClick={(e) => {
                    onCityChange({ target: { value: city } });
                    setShowCityDropdown(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm transition font-medium ${selectedCity === city ? "bg-purple-100 text-indigo-700" : "text-gray-700 hover:bg-purple-50"}`}
                >
                  📍 {city}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
