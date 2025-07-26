"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BasicHeader() {
  const router = useRouter();

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
        <Link 
          href="/" 
          className="text-gray-700 hover:text-indigo-600 text-xs sm:text-sm font-medium transition-colors px-2 sm:px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-300"
        >
          <span className="hidden sm:inline">🏠 Home</span>
          <span className="sm:hidden">🏠</span>
        </Link>
      </nav>
    </header>
  );
} 