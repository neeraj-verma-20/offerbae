import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const infoBlocks = [
  {
    key: "city",
    icon: <span className="text-xl">🌆</span>,
    label: "Location",
    getValue: (offer) => offer.city,
    bg: "bg-indigo-50 border-indigo-100",
  },
  {
    key: "category",
    icon: <span className="text-xl">📁</span>,
    label: "Category",
    getValue: (offer) => offer.category,
    bg: "bg-purple-50 border-purple-100",
  },
  {
    key: "expiryDate",
    icon: <span className="text-xl">⏳</span>,
    label: "Expires On",
    getValue: (offer) => offer.expiryDate && new Date(offer.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    bg: "bg-orange-50 border-orange-100",
  },
  {
    key: "createdAt",
    icon: <span className="text-xl">📅</span>,
    label: "Posted On",
    getValue: (offer) => offer.createdAt && new Date(offer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    bg: "bg-green-50 border-green-100",
  },
];

export default function DetailedOfferCard({ offer, onBack }) {
  const [descExpanded, setDescExpanded] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getValidImage = (src) => {
    if (!src) return "/placeholder.png";
    if (src.startsWith("http")) return src;
    if (src.startsWith("/")) return src;
    return `/${src}`;
  };

  const getDaysLeft = (expiryDate) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diff;
  };
  const daysLeft = getDaysLeft(offer.expiryDate);

  // Description truncation for mobile
  const descMaxLines = descExpanded ? undefined : 3;

  return (
    <div className="max-w-2xl md:max-w-4xl mx-auto px-2 sm:px-4 pb-24 md:pb-8">
      {/* Back Arrow - Above Image */}
      <div className="mb-4 flex justify-start">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 via-purple-500 to-indigo-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <span className="text-lg">←</span>
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* Image Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-4 md:p-8 relative">
          
          <div className="relative w-full aspect-square max-w-xs md:max-w-none">
            <Image
              src={getValidImage(offer.image)}
              alt={offer.title}
              fill
              className="object-contain rounded-xl bg-white"
              unoptimized
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-4 sm:p-8 gap-4">
          {/* Badges */}
          <div className="flex flex-row gap-2 mb-2">
            {offer.category && (
              <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-fuchsia-600 via-purple-500 to-indigo-500 rounded-full">
                #{offer.category}
              </span>
            )}
            {typeof daysLeft === "number" && daysLeft >= 0 && (
              <span className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${daysLeft <= 3 ? "bg-red-500" : "bg-green-500"}`}>
                {daysLeft === 0 ? "Expires today!" : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
            {offer.title}
          </h1>

          {/* Description */}
          {offer.description && (
            <div className={`text-gray-700 text-base sm:text-lg leading-relaxed mb-2 ${!descExpanded ? 'line-clamp-3' : ''}`}
                 style={{ WebkitLineClamp: descMaxLines }}>
              {offer.description}
              {offer.description.length > 120 && !descExpanded && (
                <button
                  className="ml-2 text-indigo-500 underline text-xs font-medium"
                  onClick={() => setDescExpanded(true)}
                >
                  Read more
                </button>
              )}
            </div>
          )}

          {/* Info Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-2">
            {infoBlocks.map((block) => {
              const value = block.getValue(offer);
              if (!value) return null;
              return (
                <div key={block.key} className={`flex items-center gap-3 p-3 rounded-lg border ${block.bg} w-full min-h-[56px]`}>
                  {block.icon}
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-0.5">{block.label}</p>
                    <p className="text-base font-semibold text-gray-800 break-words">{value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social Media Link */}
          {offer.socialLink && (
            <div className="flex flex-col sm:flex-row gap-3 mt-2 mb-4 w-full">
              <a
                href={offer.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg text-center hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="flex-shrink-0">
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                </svg>
                Visit Instagram
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full">
            {offer.mapLink && (
              <a
                href={offer.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg text-center hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg text-base"
              >
                📍 View on Google Maps
              </a>
            )}
            <button
              onClick={onBack}
              className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200 text-base"
            >
              ← Back to Offers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}