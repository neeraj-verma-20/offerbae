"use client";

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import StaticPageHeader from '../components/StaticPageHeader';

export default function ContactPage() {
    const [siteSettings, setSiteSettings] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('');

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSubmitStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const companyName = siteSettings?.companyName || 'OfferBae';
    const contactInfo = siteSettings?.contactInfo || {
        email: 'hello@offerbae.com',
        phone: '+91 98765 43210',
        address: 'Indore, Madhya Pradesh, India'
    };

    return (
        <>
            <StaticPageHeader />
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200">
                {/* Hero Section */}
                <section className="pt-32 pb-16 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent mb-6">
                            Get in Touch
                        </h1>
                        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                            Have questions, suggestions, or want to partner with us?
                            We&apos;d love to hear from you!
                        </p>
                    </div>
                </section>

                <div className="max-w-6xl mx-auto px-4 pb-16">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Information */}
                        <div className="space-y-8">
                            <div className="bg-white/70 backdrop-blur rounded-2xl p-8 shadow-xl">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>

                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 mb-1">Email Us</h3>
                                            <a
                                                href={`mailto:${contactInfo.email}`}
                                                className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                            >
                                                {contactInfo.email}
                                            </a>
                                            <p className="text-sm text-gray-600 mt-1">
                                                We&apos;ll get back to you within 24 hours
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 mb-1">Call Us</h3>
                                            <a
                                                href={`tel:${contactInfo.phone}`}
                                                className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                            >
                                                {contactInfo.phone}
                                            </a>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Mon-Fri, 9:00 AM - 6:00 PM IST
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 mb-1">Visit Us</h3>
                                            <p className="text-gray-700">{contactInfo.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white/70 backdrop-blur rounded-2xl p-8 shadow-xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>

                            {submitStatus === 'success' && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-800 font-medium">✅ Message sent successfully! We&apos;ll get back to you soon.</p>
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800 font-medium">❌ Failed to send message. Please try again or email us directly.</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="What&apos;s this about?"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows="6"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-vertical"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-12">
                        <div className="bg-white/70 backdrop-blur rounded-2xl p-8 shadow-xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">How do I list my business?</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Visit our <a href="/offer-submission" className="text-indigo-600 hover:underline">offer submission page</a> to get started. It&apos;s free and easy!
                                    </p>

                                    <h3 className="font-semibold text-gray-800 mb-2">How do offers get verified?</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Our team reviews each submission to ensure quality and authenticity before publishing.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Is there a cost to use {companyName}?</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        {companyName} is completely free for customers. Business listings are also free with optional premium features.
                                    </p>

                                    <h3 className="font-semibold text-gray-800 mb-2">Which cities do you cover?</h3>
                                    <p className="text-gray-600 text-sm">
                                        We&apos;re currently active in multiple cities across India and expanding rapidly. Check our homepage for current locations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}