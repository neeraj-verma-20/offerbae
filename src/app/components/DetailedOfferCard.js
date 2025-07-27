import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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