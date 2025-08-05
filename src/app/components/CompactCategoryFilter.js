"use client";

import { useState, useRef, useEffect } from "react";

export default function CompactCategoryFilter({ 
  allCategories = [], 
  selectedCategory, 
  onCategoryChange 
}) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategorySelect = (category) => {
    onCategoryChange(category);
    setShowCategoryDropdown(false);
    setShowAllCategories(false);
  };

  const visibleCategories = showAllCategories ? allCategories : allCategories.slice(0, 6);

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden sm:block">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Categories:</span>
        </div>
        
        <div className="flex flex-wrap justify-start items-center gap-2">
          {allCategories.slice(0, 3).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold shadow-sm transition duration-200 whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white scale-105 border-2 border-purple-400"
                  : "bg-gradient-to-br from-white via-purple-50 to-indigo-50 text-indigo-700 border border-purple-200 hover:bg-purple-100 hover:border-indigo-300"
              }`}
            >
              {cat === "All" ? "🌐 All" : `📂 ${cat}`}
            </button>
          ))}

          {/* Custom dropdown for more categories */}
          {allCategories.length > 3 && (
            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => setShowCategoryDropdown((prev) => !prev)}
                className="flex items-center gap-1 min-w-[140px] px-4 py-2 rounded-full text-sm font-medium text-indigo-700 bg-gradient-to-br from-white via-purple-50 to-indigo-50 border border-purple-200 shadow-sm hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
              >
                {allCategories.slice(0, 3).includes(selectedCategory) || !selectedCategory
                  ? "More Categories"
                  : `📂 ${selectedCategory}`}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-gradient-to-br from-white via-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  {allCategories.slice(3).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`block w-full text-left px-4 py-2 text-sm transition font-medium ${selectedCategory === cat ? "bg-purple-100 text-indigo-700" : "text-gray-700 hover:bg-purple-50"}`}
                    >
                      📂 {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-gray-600">Categories:</span>
        </div>
        
        {/* Horizontal scrollable container for category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {visibleCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition duration-200 whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white scale-105 border-2 border-purple-400"
                    : "bg-gradient-to-br from-white via-purple-50 to-indigo-50 text-indigo-700 border border-purple-200 hover:bg-purple-100 hover:border-indigo-300"
                }`}
              >
                {cat === "All" ? "🌐 All" : `📂 ${cat}`}
              </button>
            ))}

            {/* Show more/less button */}
            {allCategories.length > 6 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-indigo-700 bg-gradient-to-br from-white via-purple-50 to-indigo-50 border border-purple-200 shadow-sm hover:border-indigo-300 transition flex-shrink-0"
              >
                {showAllCategories ? "Show Less" : `+${allCategories.length - 6} More`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 