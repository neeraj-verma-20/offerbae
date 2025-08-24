"use client";

import { useState, useEffect } from 'react';
import { Users, Target, Heart, Zap, MapPin, Calendar } from 'lucide-react';
import StaticPageHeader from '../components/StaticPageHeader';

export default function AboutPage() {
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        if (response.ok) {
          const data = await response.json();
          setSiteSettings(data);
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    fetchSiteSettings();
  }, []);

  const companyName = siteSettings?.companyName || 'OfferBae';

  return (
    <>
      <StaticPageHeader />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent mb-6">
            About {companyName}
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Connecting local businesses with deal-savvy customers across India. 
            We're on a mission to make amazing offers accessible to everyone.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/70 backdrop-blur rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-indigo-600 mr-4" />
                <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To bridge the gap between local businesses and customers by providing a platform 
                where exclusive deals and offers are easily discoverable. We believe in supporting 
                local commerce while helping people save money and discover new experiences.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-6">
                <Heart className="w-8 h-8 text-purple-600 mr-4" />
                <h2 className="text-2xl font-bold text-gray-800">Our Vision</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To become India's most trusted platform for local deals and offers, 
                fostering a community where businesses thrive and customers discover 
                value in every corner of their city.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 px-4 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Connect Businesses</h3>
              <p className="text-gray-600">
                We help local businesses reach more customers by showcasing their best offers 
                and deals on our platform.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Curate Deals</h3>
              <p className="text-gray-600">
                Every offer on our platform is carefully curated to ensure quality and value 
                for our users across different categories.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Local Focus</h3>
              <p className="text-gray-600">
                We focus on local businesses in cities across India, making it easy to 
                discover great deals in your neighborhood.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/70 backdrop-blur rounded-2xl p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <Calendar className="w-8 h-8 text-indigo-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-800">Our Story</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                {companyName} was born from a simple observation: amazing local businesses 
                often struggle to reach customers, while people miss out on great deals 
                happening right in their neighborhood.
              </p>
              <p>
                We started with a vision to create a platform that would benefit both sides - 
                helping businesses grow their customer base while giving people access to 
                exclusive offers from cafes, gyms, boutiques, and more.
              </p>
              <p>
                Today, we're proud to serve multiple cities across India, connecting thousands 
                of customers with local businesses and helping communities thrive through 
                commerce and discovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-xl mb-6 opacity-90">
              Discover amazing deals from local businesses in your city
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Explore Offers
              </a>
              <a
                href="/offer-submission"
                className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
              >
                List Your Business
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}