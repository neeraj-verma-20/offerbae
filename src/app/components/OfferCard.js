import Image from "next/image";
import Link from "next/link";

export default function OfferCard({
  title,
  description,
  image,
  mapLink,
  category,
  isNew,
  daysLeft,
  city,
  onClick,
}) {
  const getValidImage = (src) => {
    if (!src) return "/placeholder.png";
    if (src.startsWith("http")) return src;
    if (src.startsWith("/")) return src;
    return `/${src}`;
  };

  const truncateDescription = (text, maxWords = 25) => {
    if (!text) return "";
    const words = text.trim().split(" ");
    return words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + "..."
      : text;
  };

  const handleCardClick = (e) => {
    // Don't trigger if clicking on map link
    if (e.target.closest('.map-link')) {
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`bg-white/60 backdrop-blur-lg border border-gray-100 rounded-2xl shadow-md overflow-hidden transition-all duration-300 group hover:scale-[1.025] hover:shadow-2xl cursor-pointer ${
        typeof daysLeft === "number" && daysLeft <= 5 ? "glow-red" : ""
      }`}
      onClick={handleCardClick}
    >
      {/* 📸 Image */}
      <div className="relative w-full aspect-square overflow-hidden">
        {image ? (
          <Image
            src={getValidImage(image)}
            alt={title}
            fill
            priority
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-100">
            No Image
          </div>
        )}

        {/* 🏷️ Category Badge */}
        {category && (
          <div className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-fuchsia-600 via-purple-500 to-indigo-500 rounded-full shadow-md z-10">
            #{category}
          </div>
        )}

        {/* 🆕 New Badge */}
        {isNew && (
          <div className="absolute top-3 right-3 px-3 py-1 text-xs font-bold text-white rounded-full shadow-md z-10 pulse-badge">
            🆕 New
          </div>
        )}
      </div>

      {/* 📄 Content */}
      <div className="flex flex-col justify-between min-h-[260px] p-8">
        <h2 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-gray-600">{truncateDescription(description)}</p>
        )}

        {/* Bottom Row */}
        <div className="mt-4 flex justify-between flex-wrap text-xs text-gray-500">
          {city && (
            <div className="flex items-center gap-1">
              🏙️ <span className="font-medium text-gray-700">{city}</span>
            </div>
          )}
          {typeof daysLeft === "number" && daysLeft >= 0 && (
            <div
              className={`flex items-center gap-1 ${
                daysLeft <= 3 ? "text-red-600 font-semibold" : ""
              }`}
            >
              ⏳{" "}
              {daysLeft === 0
                ? "Expires today!"
                : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`}
            </div>
          )}
          {mapLink && (
            <Link
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="map-link flex items-center gap-1 text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              📍 Map
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .pulse-badge {
          background: linear-gradient(to right, #ff416c, #ff4b2b);
          animation: pulseFast 1s infinite;
        }

        @keyframes pulseFast {
          0% {
            box-shadow: 0 0 0px rgba(255, 75, 43, 0.7);
          }
          50% {
            box-shadow: 0 0 10px rgba(255, 65, 108, 0.8),
              0 0 20px rgba(255, 65, 108, 0.6);
          }
          100% {
            box-shadow: 0 0 0px rgba(255, 75, 43, 0.7);
          }
        }
      `}</style>
    </div>
  );
}
