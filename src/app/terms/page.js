"use client";

import { useState, useEffect } from 'react';
import { FileText, Users, AlertTriangle, Shield, Mail } from 'lucide-react';
import StaticPageHeader from '../components/StaticPageHeader';

export default function TermsOfServicePage() {
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Please read these terms carefully before using our platform. 
            By using {companyName}, you agree to these terms.
          </p>
          <p className="text-sm text-gray-600 mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white/70 backdrop-blur rounded-2xl p-8 shadow-xl space-y-8">
          
          {/* Acceptance of Terms */}
          <section>
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Acceptance of Terms</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                By accessing and using {companyName}, you accept and agree to be bound by the 
                terms and provision of this agreement. If you do not agree to abide by the 
                above, please do not use this service.
              </p>
              <p>
                These terms apply to all visitors, users, and others who access or use the service.
              </p>
            </div>
          </section>

          {/* Use of Service */}
          <section>
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Use of Service</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>You may use our service for lawful purposes only. You agree not to use the service:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>In any way that violates applicable laws or regulations</li>
                <li>To transmit or procure sending of any advertising or promotional material</li>
                <li>To impersonate or attempt to impersonate the company or other users</li>
                <li>To engage in any other conduct that restricts or inhibits anyone&apos;s use of the service</li>
                <li>To submit false, misleading, or fraudulent information</li>
              </ul>
            </div>
          </section>

          {/* Business Listings */}
          <section>
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Business Listings and Offers</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>When submitting business information or offers:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You must provide accurate and truthful information</li>
                <li>You must have the right to submit the information</li>
                <li>You grant us the right to display and promote your offers</li>
                <li>You are responsible for keeping your information up to date</li>
                <li>We reserve the right to review and approve all submissions</li>
                <li>We may remove listings that violate our guidelines</li>
              </ul>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Disclaimers</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                The information on this service is provided on an &quot;as is&quot; basis. To the 
                fullest extent permitted by law, this company:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Excludes all representations and warranties relating to this service</li>
                <li>Does not guarantee the accuracy of offers or business information</li>
                <li>Is not responsible for the quality of products or services offered by businesses</li>
                <li>Does not endorse any particular business or offer</li>
              </ul>
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
                If you have any questions about these Terms of Service, please contact us at:
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