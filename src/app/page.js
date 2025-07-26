"use client";

import { useEffect, useState, useRef } from "react";
import OfferCard from "./components/OfferCard";
import DetailedOfferCard from "./components/DetailedOfferCard";
import Header from "./components/Header";

const pageSize = 6;

function getDaysLeft(expiryDate) {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function HomePage() {
  const [offers, setOffers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const categoryDropdownRef = useRef(null);

  // Fetch offers and locations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersRes, locationsRes] = await Promise.all([
          fetch("/api/offers"),
          fetch("/api/locations")
        ]);
        
        const offersData = await offersRes.json();
        const locationsData = await locationsRes.json();

        if (Array.isArray(offersData)) {
          const sorted = [...offersData].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setOffers(sorted);
        } else {
          setOffers([]);
        }

        if (Array.isArray(locationsData)) {
          setLocations(locationsData);
        } else {
          setLocations([]);
        }
      } catch (err) {
        setOffers([]);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hidden admin access - Keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+Shift+A to access admin
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        window.location.href = '/admin-secret';
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Get available cities from locations
  const cities = [
    ...locations
      .map(loc => loc.city?.trim())
      .filter(
        (city, idx, arr) =>
          city &&
          city.toLowerCase() !== "all cities" &&
          arr.findIndex(c => c?.toLowerCase() === city?.toLowerCase()) === idx // remove duplicates
      )
  ];

  // Remove all "All Cities" (case-insensitive), then add it ONCE at the top
  // Sort cities alphabetically (except 'All Cities' at the top)
  const sortedCities = [...cities].sort((a, b) => a.localeCompare(b));
  const finalCities = ["All Cities", ...sortedCities];

  // Get available areas for selected city
  const getAvailableAreas = () => {
    if (selectedCity === "All Cities") return [];
    const selectedLocation = locations.find(loc => loc.city === selectedCity);
    return selectedLocation ? [...selectedLocation.areas].sort((a, b) => a.localeCompare(b)) : [];
  };

  const availableAreas = getAvailableAreas();

  // Reset area when city changes
  useEffect(() => {
    setSelectedArea("All Areas");
    setCurrentPage(1);
  }, [selectedCity]);

  const allCategories = ["All", ...new Set(offers.map((o) => o.category || "Uncategorized"))];

  const filteredOffers = offers.filter((offer) => {
    // Handle cases where category, city, or area might be null/undefined
    const offerCategory = offer.category || "Uncategorized";
    const offerCity = offer.city || "Unknown";
    const offerArea = offer.area || "Unknown";
    
    const categoryMatch =
      selectedCategory === "All" || offerCategory === selectedCategory;
    const cityMatch = selectedCity === "All Cities" || offerCity === selectedCity;
    const areaMatch = selectedArea === "All Areas" || offerArea === selectedArea;
    
    return categoryMatch && cityMatch && areaMatch;
  });

  const totalPages = Math.ceil(filteredOffers.length / pageSize);
  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const top3NewIds = offers.slice(0, 3).map((o) => o.id);

  const handleOfferClick = (offer) => {
    setSelectedOffer(offer);
  };

  const handleBackToOffers = () => {
    setSelectedOffer(null);
  };

  // If an offer is selected, show the detailed view
  if (selectedOffer) {
    return (
      <div>
        <Header
          cities={finalCities}
          areas={availableAreas}
          selectedCity={selectedCity}
          selectedArea={selectedArea}
          onCityChange={(e) => {
            setSelectedCity(e.target.value);
            setCurrentPage(1);
          }}
          onAreaChange={(e) => {
            setSelectedArea(e.target.value);
            setCurrentPage(1);
          }}
        />
        <main className="pt-28 min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200 px-4 py-12 font-sans">
          <DetailedOfferCard 
            offer={selectedOffer} 
            onBack={handleBackToOffers}
          />
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header
        cities={finalCities}
        areas={availableAreas}
        selectedCity={selectedCity}
        selectedArea={selectedArea}
        onCityChange={(e) => {
          setSelectedCity(e.target.value);
          setCurrentPage(1);
        }}
        onAreaChange={(e) => {
          setSelectedArea(e.target.value);
          setCurrentPage(1);
        }}
      />
      <main className="pt-28 min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200 px-4 py-12 font-sans">
        {/* 🌟 Hero */}
        {/* <section className="text-center mb-14 px-2">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-lg animate-fadeIn">
            Discover Local Deals, <br className="hidden md:inline" /> Curated
            for You ✨
          </h1>
          <p className="mt-4 text-gray-700 text-base md:text-lg max-w-3xl mx-auto font-medium leading-relaxed">
            Explore exclusive offers from cafes, gyms, boutiques, and more — all
            handpicked for the trendsetters of Indore and beyond. Unlock value,
            support local, and live your best life 💜
          </p>
        </section> */}

        {/* 🧩 Filters Section - Clean & Compact */}
        <section className="max-w-7xl mx-auto px-4 mb-12">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            {/* 🌍 City Filter - moved to Header */}
            {/* 📂 Category Filter */}
            <div className="w-full md:flex-1">
              <div className="flex flex-wrap justify-start md:justify-end items-center gap-2">
                {allCategories.slice(0, 3).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(1);
                    }}
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
                            onClick={() => {
                              setSelectedCategory(cat);
                              setCurrentPage(1);
                              setShowCategoryDropdown(false);
                            }}
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
          </div>
        </section>

        {/* 💎 Offers Grid */}
        <section className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center text-gray-600 mt-16 text-lg font-medium animate-pulse">
              ⏳ Loading offers...
            </div>
          ) : paginatedOffers.length > 0 ? (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-2">
              {paginatedOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  {...offer}
                  isNew={currentPage === 1 && top3NewIds.includes(offer.id)}
                  daysLeft={getDaysLeft(offer.expiryDate)}
                  onClick={() => handleOfferClick(offer)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-16 text-lg font-medium">
              😔 No offers found in this category...
            </p>
          )}
        </section>

        {/* 📢 Promote Your Business Section with Animation */}
        {/* <section className="mt-20 bg-white/60 backdrop-blur border border-purple-100 shadow-xl rounded-2xl max-w-4xl mx-auto p-8 text-center animate-fade-in">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-4 tracking-tight">
            📢 Want to Promote Your Business on OfferWala?
          </h2>
          <p className="text-gray-600 mb-6 text-base max-w-2xl mx-auto leading-relaxed">
            Be seen by thousands of deal-savvy Indori users! Cafes, boutiques,
            salons, gyms – get your offers in front of GenZ shoppers and boost
            your visibility 🚀
          </p>
          <a
            href="https://forms.gle/YOUR_GOOGLE_FORM_ID"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-pulse"
          >
            📋 Fill Out Our Google Form
          </a>
        </section> */}

        {/* 🔢 Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-14 space-x-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-5 py-2 rounded-full text-sm font-medium shadow-md transition ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-800 hover:bg-purple-100"
              }`}
            >
              ⬅ Prev
            </button>
            <span className="text-sm text-gray-700">
              Page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-5 py-2 rounded-full text-sm font-medium shadow-md transition ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-800 hover:bg-purple-100"
              }`}
            >
              Next ➡
            </button>
          </div>
        )}
      </main>
      <a
        href="https://wa.me/918770326893?text=Hi%2C%20I%20want%20to%20promote%20my%20business%20on%20Offerbae%21%20Please%20share%20the%20details."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 bg-gradient-to-r from-indigo-500 to-purple-600 text-white
       px-5 py-3 sm:px-6 sm:py-3 rounded-full shadow-lg 
       hover:scale-105 hover:shadow-2xl transition-all duration-300
       flex items-center justify-center text-sm sm:text-base 
       w-12 h-12 sm:w-auto sm:h-auto animate-bounce"
      >
        <span className="hidden sm:inline">📢 Advertise with Us</span>
        <span className="sm:hidden text-xl">��</span>
      </a>
      
      {/* Hidden admin access area - invisible but clickable */}
      <div 
        onClick={() => window.location.href = '/admin-secret'}
        className="fixed bottom-0 left-0 w-4 h-4 opacity-0 cursor-pointer z-40"
        title="Admin Access"
      />
    </div>
  );
}
