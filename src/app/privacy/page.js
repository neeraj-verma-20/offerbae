"use client";

import { useState, useEffect } from 'react';
import { Shield, Eye, Lock, UserCheck, Database, Mail } from 'lucide-react';
import StaticPageHeader from '../components/StaticPageHeader';

export default function PrivacyPolicyPage() {
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
  const contactEmail = siteSettings?.contactInfo?.email || 'hello@offerbae.com';
  const lastUpdated = "January 1, 2024";

  return (
    <>
      <StaticPageHeader />
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Your privacy is important to us. This policy explains how we collect, 
            use, and protect your information.
          </p>
          <p className="text-sm text-gray-600 mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white/70 backdrop-blur rounded-2xl p-8 shadow-xl space-y-8">
          
          {/* Information We Collect */}
          <section>
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>We collect information you provide directly to us, such as when you:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Browse offers on our platform</li>
                <li>Submit business information or offers</li>
                <li>Contact us through our contact form</li>
                <li>Subscribe to our newsletter or updates</li>
              </ul>
              <p>
                This may include your name, email address, phone number, business information, 
                and any other information you choose to provide.
              </p>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">How We Use Your Information</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process and display business offers and information</li>
                <li>Communicate with you about our services</li>
                <li>Send you updates about new offers and features</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect, investigate, and prevent fraudulent activities</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <div className="flex items-center mb-4">
              <UserCheck className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Information Sharing</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties, 
                except in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights, property, or safety</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
              <p>
                Business information submitted for offers may be displayed publicly on our platform 
                as part of our service.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Data Security</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                We implement appropriate technical and organizational measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>
                However, no method of transmission over the internet or electronic storage is 
                100% secure. While we strive to protect your information, we cannot guarantee 
                its absolute security.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Contact Us</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                If you have any questions about this privacy policy or our practices, 
                please contact us at:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-800">{companyName}</p>
                <p>Email: <a href={`mailto:${contactEmail}`} className="text-indigo-600 hover:underline">{contactEmail}</a></p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}