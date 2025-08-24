"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StaticPageHeader() {
  const router = useRouter();

  const handleLogoClick = (e) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <header className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg rounded-full px-4 sm:px-6 py-2 flex justify-between items-center z-50 transition-all w-[95%] max-w-4xl">
      {/* Logo */}
      <div 
        onClick={handleLogoClick}
        className="flex items-center gap-2 group whitespace-nowrap hover:scale-105 transition-transform duration-200 cursor-pointer"
      >
        <div className="w-7 h-7 relative flex-shrink-0">
          <Image
            src="https://res.cloudinary.com/dn4dv5zlz/image/upload/v1752256563/logo_bpjjex.png"
            alt="Offerbae Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="text-base font-bold text-indigo-600 group-hover:text-purple-600 transition-colors">
          OfferBae
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex items-center gap-4">
        <Link 
          href="/" 
          className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-full hover:bg-indigo-50"
        >
          Home
        </Link>
        <Link 
          href="/about" 
          className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-full hover:bg-indigo-50"
        >
          About
        </Link>
        <Link 
          href="/contact" 
          className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-full hover:bg-indigo-50"
        >
          Contact
        </Link>
      </nav>
    </header>
  );
}