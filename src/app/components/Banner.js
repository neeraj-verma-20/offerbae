"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Slider from 'react-slick';

// Import slick carousel CSS
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Custom Arrow Components - Hidden on small screens
const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="hidden sm:block absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group-hover:opacity-100 opacity-70 hover:opacity-100"
    aria-label="Previous banner"
  >
    <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="hidden sm:block absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group-hover:opacity-100 opacity-70 hover:opacity-100"
    aria-label="Next banner"
  >
    <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>
);

export default function Banner({ banners = [] }) {
  const [loading, setLoading] = useState(true);
  const [bannerItems, setBannerItems] = useState([]);

  useEffect(() => {
    // If banners are provided as props, use them
    if (banners.length > 0) {
      setBannerItems(banners);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API only once on mount
    let isMounted = true;
    
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners');
        if (!response.ok) throw new Error('Failed to fetch banners');
        
        const data = await response.json();
        
        // Only update state if component is still mounted
        if (isMounted) {
          if (Array.isArray(data)) {
            setBannerItems(data);
          } else {
            setBannerItems([]);
          }
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Banner component: Error fetching banners:', error);
          setBannerItems([]);
          setLoading(false);
        }
      }
    };

    fetchBanners();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency - fetch only once on mount

  // Separate effect to handle prop changes
  useEffect(() => {
    if (banners.length > 0) {
      setBannerItems(banners);
      setLoading(false);
    }
  }, [banners]);

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false, // Hide arrows on mobile
          dots: false // Hide dots on mobile and smaller screens
        }
      },
      {
        breakpoint: 480,
        settings: {
          arrows: false, // Hide arrows on small screens
          dots: false // Hide dots on very small screens
        }
      }
    ]
  };

  // If no banners or loading, show placeholder or nothing
  if (loading) {
    return (
      <div className="w-full aspect-[16/9] sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/5] bg-gray-100 animate-pulse rounded-xl overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          Loading banners...
        </div>
      </div>
    );
  }

  if (bannerItems.length === 0) {
    return null; // Don't show anything if no banners
  }

  return (
    <div 
      className="banner-carousel w-full overflow-hidden rounded-xl shadow-lg relative group block leading-none"
    >
      <style jsx>{`
        .banner-carousel {
          display: block;
          line-height: 0;
          font-size: 0;
        }
        .banner-carousel :global(.slick-slider) {
          display: block;
          line-height: 0;
        }
        .banner-carousel :global(.slick-list) {
          display: block;
          line-height: 0;
        }
        .banner-carousel :global(.slick-track) {
          display: flex;
          line-height: 0;
        }
        .banner-carousel :global(.slick-slide) {
          line-height: 0;
        }
        .banner-carousel :global(.slick-slide > div) {
          line-height: 0;
        }
        .banner-carousel :global(.slick-dots) {
          bottom: 15px;
        }
        .banner-carousel :global(.slick-dots li button:before) {
          color: white;
          opacity: 0.5;
          font-size: 12px;
        }
        .banner-carousel :global(.slick-dots li.slick-active button:before) {
          opacity: 1;
          color: white;
        }
        .banner-carousel :global(.slick-dots li) {
          margin: 0 3px;
        }
      `}</style>
      <Slider {...settings}>
        {bannerItems.map((banner, index) => (
          <div key={banner.id || index} className="relative w-full aspect-[16/9] sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/5] block leading-none">
            {/* Banner Image */}
            <div className="relative w-full h-full block leading-none">
              <Image
                src={banner.imageUrl}
                alt={banner.title || `Banner ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover object-center block"
                unoptimized
              />
              
              {/* Optional overlay with text */}
              {(banner.title || banner.description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6 text-white">
                  {banner.title && (
                    <h3 className="text-lg sm:text-xl font-bold mb-1">{banner.title}</h3>
                  )}
                  {banner.description && (
                    <p className="text-sm sm:text-base line-clamp-2">{banner.description}</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Make entire banner clickable if there's a link */}
            {banner.link && (
              <Link 
                href={banner.link} 
                className="absolute inset-0 z-10"
                target={banner.openInNewTab ? "_blank" : "_self"}
                rel="noopener noreferrer"
              />
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
}