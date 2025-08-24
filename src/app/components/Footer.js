"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Smartphone, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  ExternalLink,
  Download
} from 'lucide-react';

export default function Footer() {
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  const currentYear = new Date().getFullYear();

  // Default values if settings not loaded
  const settings = siteSettings || {
    companyName: 'OfferBae',
    companyDescription: 'Discover exclusive offers from top malls and shops across India',
    showDownloadButton: false,
    androidAppUrl: '',
    iosAppUrl: '',
    downloadButtonText: 'Download App',
    socialLinks: {},
    contactInfo: {
      email: 'hello@offerbae.com',
      phone: '+91 98765 43210',
      address: 'Indore, Madhya Pradesh, India'
    }
  };

  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
                {settings.companyName}
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed max-w-md">
                {settings.companyDescription}
              </p>
            </div>

            {/* Download App Section */}
            {settings.showDownloadButton && (settings.androidAppUrl || settings.iosAppUrl) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-indigo-400" />
                  Get Our App
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {settings.androidAppUrl && (
                    <a
                      href={settings.androidAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-sm font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Play Store
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  )}
                  {settings.iosAppUrl && (
                    <a
                      href={settings.iosAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-sm font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      App Store
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Social Links */}
            {settings.socialLinks && Object.entries(settings.socialLinks).some(([_, url]) => url) && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {Object.entries(settings.socialLinks).map(([platform, url]) => {
                    if (!url) return null;
                    const IconComponent = socialIcons[platform];
                    if (!IconComponent) return null;

                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-slate-700 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        aria-label={`Follow us on ${platform}`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 text-sm">
                  All Offers
                </Link>
              </li>
              <li>
                <Link href="/offer-submission" className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 text-sm">
                  Advertise with Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              {settings.contactInfo.email && (
                <li className="flex items-start">
                  <Mail className="w-4 h-4 mr-3 mt-0.5 text-indigo-400 flex-shrink-0" />
                  <a 
                    href={`mailto:${settings.contactInfo.email}`}
                    className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 text-sm"
                  >
                    {settings.contactInfo.email}
                  </a>
                </li>
              )}
              {settings.contactInfo.phone && (
                <li className="flex items-start">
                  <Phone className="w-4 h-4 mr-3 mt-0.5 text-indigo-400 flex-shrink-0" />
                  <a 
                    href={`tel:${settings.contactInfo.phone}`}
                    className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 text-sm"
                  >
                    {settings.contactInfo.phone}
                  </a>
                </li>
              )}
              {settings.contactInfo.address && (
                <li className="flex items-start">
                  <MapPin className="w-4 h-4 mr-3 mt-0.5 text-indigo-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">
                    {settings.contactInfo.address}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} {settings.companyName}. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-indigo-400 transition-colors duration-200">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}