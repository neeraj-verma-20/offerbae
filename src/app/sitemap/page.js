"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  Mail, 
  Scale, 
  MapPin,
  Tag,
  Building,
  ExternalLink
} from 'lucide-react';
import StaticPageHeader from '../components/StaticPageHeader';

export default function SitemapPage() {
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

  const sitemapSections = [
    {
      title: "Main Pages",
      icon: Home,
      color: "from-indigo-500 to-purple-600",
      links: [
        { href: "/", label: "Home", description: "Browse all offers and deals" },
        { href: "/about", label: "About Us", description: "Learn about our mission and story" },
        { href: "/contact", label: "Contact", description: "Get in touch with us" },
      ]
    },
    {
      title: "Business",
      icon: Building,
      color: "from-purple-500 to-pink-600",
      links: [
        { href: "/offer-submission", label: "Advertise with Us", description: "Submit your business offers" },
        { href: "/offers", label: "All Offers", description: "Browse all available offers" },
      ]
    },
    {
      title: "Legal",
      icon: Scale,
      color: "from-green-500 to-teal-600",
      links: [
        { href: "/privacy", label: "Privacy Policy", description: "How we protect your data" },
        { href: "/terms", label: "Terms of Service", description: "Terms and conditions of use" },
      ]
    },
    {
      title: "Categories",
      icon: Tag,
      color: "from-blue-500 to-indigo-600",
      links: [
        { href: "/?category=Food%20%26%20Beverages", label: "Food & Beverages", description: "Restaurant and cafe offers" },
        { href: "/?category=Fashion%20%26%20Clothing", label: "Fashion & Clothing", description: "Clothing and accessory deals" },
        { href: "/?category=Beauty%20%26%20Wellness", label: "Beauty & Wellness", description: "Salon and spa offers" },
        { href: "/?category=Fitness%20%26%20Gyms", label: "Fitness & Gyms", description: "Gym and fitness deals" },
        { href: "/?category=Electronics%20%26%20Gadgets", label: "Electronics & Gadgets", description: "Tech and gadget offers" },
        { href: "/?category=Entertainment", label: "Entertainment", description: "Movies, events, and fun activities" },
      ]
    }
  ];

  return (
    <>
      <StaticPageHeader />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent mb-6">
            Sitemap
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Find your way around {companyName}. Here&apos;s a complete overview of all our pages and features.
          </p>
        </div>
      </section>

      {/* Sitemap Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          {sitemapSections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div key={index} className="bg-white/70 backdrop-blur rounded-2xl p-8 shadow-xl">
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-full flex items-center justify-center mr-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">{section.title}</h2>
                </div>
                
                <div className="space-y-4">
                  {section.links.map((link, linkIndex) => (
                    <div key={linkIndex} className="group">
                      <Link 
                        href={link.href}
                        className="flex items-start justify-between p-3 rounded-lg hover:bg-white/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                            {link.label}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {link.description}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors mt-1 ml-2 flex-shrink-0" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white/70 backdrop-blur rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Need Help?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Contact Support</h3>
              <p className="text-sm text-gray-600">
                Have questions? <Link href="/contact" className="text-indigo-600 hover:underline">Get in touch</Link> with our team.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Business Owners</h3>
              <p className="text-sm text-gray-600">
                Want to list your business? <Link href="/offer-submission" className="text-indigo-600 hover:underline">Start here</Link>.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">About Us</h3>
              <p className="text-sm text-gray-600">
                Learn more <Link href="/about" className="text-indigo-600 hover:underline">about our mission</Link> and story.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}