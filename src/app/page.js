"use client";

import { useEffect, useState } from "react";
import OfferCard from "./components/OfferCard";

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
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCity, setSelectedCity] = useState("All");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch("/api/save-offers");
        const data = await res.json();

        if (Array.isArray(data)) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setOffers(sorted);
        } else {
          console.error("Invalid data format:", data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch offers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const allCategories = ["All", ...new Set(offers.map((o) => o.category))];

  const filteredOffers = offers.filter((offer) => {
    const categoryMatch =
      selectedCategory === "All" || offer.category === selectedCategory;
    const cityMatch = selectedCity === "All" || offer.city === selectedCity;
    return categoryMatch && cityMatch;
  });

  const totalPages = Math.ceil(filteredOffers.length / pageSize);
  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const top3NewIds = offers.slice(0, 3).map((o) => o.id);

  return (
    <div>
      <main className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-purple-50 to-[#e0f7fa] px-4 py-12 font-sans">
        {/* 🌟 Hero */}
        <section className="text-center mb-14 px-2">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm animate-fadeIn">
            💥 OfferBae 💥
          </h1>
          <p className="mt-4 text-gray-700 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Where vibes meet value 💸 | Curated local deals for GenZ like you 💜
          </p>
        </section>

        {/* 🧩 Filters Section - Clean & Compact */}
        <section className="max-w-7xl mx-auto px-4 mb-12">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            {/* 🌍 City Filter */}
            <div className="w-full max-w-xs">
              <select
                id="cityFilter"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded-full py-2 px-4 text-sm font-medium text-gray-700 bg-white shadow-sm hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              >
                <option disabled value="All">
                  🌍 Filter by City
                </option>
                {[
                  "All",
                  ...new Set(offers.map((o) => o.city || "Unknown")),
                ].map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

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
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white scale-105"
                        : "bg-white text-gray-800 border border-gray-300 hover:bg-purple-100"
                    }`}
                  >
                    {cat === "All" ? "🌐 All" : `📂 ${cat}`}
                  </button>
                ))}

                {allCategories.length > 3 && (
                  <select
                    value={
                      allCategories.slice(0, 3).includes(selectedCategory)
                        ? ""
                        : selectedCategory
                    }
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="min-w-[140px] border border-gray-300 rounded-full py-2 px-4 text-sm font-medium text-gray-700 bg-white shadow-sm hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                  >
                    <option value="">More Categories</option>
                    {allCategories.slice(3).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
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
        <span className="sm:hidden text-xl">📢</span>
      </a>
    </div>
  );
}
