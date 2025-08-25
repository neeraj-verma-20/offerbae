"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ImageUploadWithAI from "../components/ImageUploadWithAI";

export default function OfferSubmission() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    imageUrl: "",
    imageMethod: "", // 'upload' or 'ai'
    aiPrompt: "",
    aiStyle: "",
    mapLink: "",
    category: "",
    expiryDate: "",
    city: "",
    area: "",
    keywords: "",
    ownerName: "",
    phoneNumber: "",
    socialLink: ""
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropData, setCropData] = useState({ x: 0, y: 0, size: 0 });
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [generateLoading, setGenerateLoading] = useState({ title: false, description: false });
  const [aiError, setAiError] = useState(null);
  const [aiAvailable, setAiAvailable] = useState({
    image: false,
    title: false,
    description: false
  });
  const [checkingAiAvailability, setCheckingAiAvailability] = useState(true);

  const categories = [
    "🎁 Gifts & Stationery",
    "🛋️ Furniture & Home Decor",
    "🎉 Events & Activities",
    "🍽️ Food & Beverages",
    "🍽️ Restaurants & Dining",
    "🎤 Live Music & Nightlife",
    "📱 Electronics & Gadgets",
    "🍿 Entertainment",
    "🎮 Gaming & eSports Lounges",
    "📸 Photography & Videography",
    "🧴 Beauty & Wellness",
    "💇 Salon & Spa",
    "🧘‍♂️ Yoga & Meditation",
    "🛒 Grocery & Essentials",
    "📱 Mobile & Accessories",
    "👗 Fashion & Clothing",
    "🧩 Hobbies & Crafts",
    "🏥 Health & Medicine",
    "🪴 Gardening & Outdoor",
    "🛠️ Construction & Renovation",
    "🚪 Interior Design & Decor",
    "💼 Professional & Business Services",
    "💊 Pharmacy & Supplements",
    "📚 Education & Coaching",
    "🏋️ Fitness & Gyms",
    "🧹 Cleaning & Maintenance",
    "🐾 Pet Supplies & Services",
    "🧾 Legal & Financial Services",
    "🌿 Organic & Ayurvedic Products",
    "🚖 Transportation & Rentals",
    "✈️ Travel & Tourism",
    "🏨 Hotels & Stays",
    "🗺️ Tours & Guides",
    "☕ Cafes & Bakeries",
    "🌍 NGOs & Social Causes",
    "🌱 Organic & Fresh Produce",
    "🧑‍💻 Tech & IT Services",
    "❓ Others"
  ];

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations/enabled');
        if (response.ok) {
          const data = await response.json();
          setLocations(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoadingLocations(false);
      }
    };

    const checkAiAvailability = async () => {
      try {
        const [imageRes, titleRes, descRes] = await Promise.all([
          fetch('/api/ai-availability?feature=image'),
          fetch('/api/ai-availability?feature=title'),
          fetch('/api/ai-availability?feature=description')
        ]);

        const [imageData, titleData, descData] = await Promise.all([
          imageRes.ok ? imageRes.json() : { available: false },
          titleRes.ok ? titleRes.json() : { available: false },
          descRes.ok ? descRes.json() : { available: false }
        ]);

        setAiAvailable({
          image: imageData.available && imageData.enabled,
          title: titleData.available && titleData.enabled,
          description: descData.available && descData.enabled
        });
      } catch (error) {
        console.error('Error checking AI availability:', error);
        setAiAvailable({
          image: false,
          title: false,
          description: false
        });
      } finally {
        setCheckingAiAvailability(false);
      }
    };

    fetchLocations();
    checkAiAvailability();

    // Refresh locations when returning to the page
    const handleFocus = () => {
      fetchLocations();
      checkAiAvailability();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle description word limit
    if (name === 'description') {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length > 30) {
        return; // Don't update if exceeds 30 words
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'city') {
      setFormData(prev => ({ ...prev, city: value, area: "" }));
    }
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleImageSelect = (imageData) => {
    if (!imageData) {
      // Clear image
      setFormData(prev => ({ 
        ...prev, 
        image: null, 
        imageUrl: "", 
        imageMethod: "",
        aiPrompt: "",
        aiStyle: ""
      }));
      setImagePreview(null);
      return;
    }

    if (imageData.method === 'upload') {
      // Handle uploaded file
      setFormData(prev => ({ 
        ...prev, 
        image: imageData.file, 
        imageUrl: "",
        imageMethod: 'upload'
      }));
      setImagePreview(imageData.url);
    } else if (imageData.method === 'ai') {
      // Handle AI generated image
      setFormData(prev => ({ 
        ...prev, 
        image: null,
        imageUrl: imageData.url,
        imageMethod: 'ai',
        aiPrompt: imageData.prompt,
        aiStyle: imageData.style
      }));
      setImagePreview(imageData.url);
    }
  };

  const handleCropConfirm = () => {
    if (!originalImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = cropData.size;
    canvas.height = cropData.size;
    
    const img = document.createElement('img');
    img.onload = () => {
      ctx.drawImage(
        img, 
        cropData.x, 
        cropData.y, 
        cropData.size, 
        cropData.size, 
        0, 
        0, 
        cropData.size, 
        cropData.size
      );
      
      canvas.toBlob((blob) => {
        const croppedFile = new File([blob], originalImage.file.name, {
          type: originalImage.file.type,
          lastModified: Date.now()
        });
        
        setFormData(prev => ({ ...prev, image: croppedFile }));
        setImagePreview(canvas.toDataURL());
        setShowCropModal(false);
        setOriginalImage(null);
      }, originalImage.file.type, 0.9);
    };
    img.src = originalImage.dataUrl;
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setOriginalImage(null);
    setCropData({ x: 0, y: 0, size: 0 });
  };

  const updateCropArea = (newX, newY) => {
    if (!originalImage) return;
    
    const maxX = originalImage.width - cropData.size;
    const maxY = originalImage.height - cropData.size;
    
    setCropData(prev => ({
      ...prev,
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    }));
  };

  const uploadImageToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', 'offers_unsigned');
      fd.append('folder', 'offers/img');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.cloudinary.com/v1_1/dn4dv5zlz/image/upload', true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        setUploadProgress(100);
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          resolve(data.secure_url);
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error.message || 'Failed to upload image'));
          } catch {
            reject(new Error('Failed to upload image'));
          }
        }
      };

      xhr.onerror = () => {
        setUploadProgress(0);
        reject(new Error('A network error occurred during the image upload.'));
      };

      xhr.send(fd);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const required = ['title','description','category','ownerName','phoneNumber','city','area','mapLink','socialLink','expiryDate'];
    for (const key of required) {
      const val = formData[key];
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        e.target.reportValidity();
        return;
      }
    }

    // Validate image (either uploaded file or AI-generated URL)
    if (!formData.image && !formData.imageUrl) {
      alert('Please upload an image or generate one with AI');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      let finalImageUrl = formData.imageUrl; // For AI-generated images

      // Upload to Cloudinary for both file uploads and AI-generated images
      if (formData.imageMethod === 'upload' && formData.image) {
        // Handle regular file upload
        finalImageUrl = await uploadImageToCloudinary(formData.image);
      } else if (formData.imageMethod === 'ai' && formData.imageUrl) {
        // Convert AI-generated base64 image to file and upload to Cloudinary
        try {
          const base64Data = formData.imageUrl.split(',')[1]; // Remove data:image/png;base64, prefix
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          
          // Create a file from the blob
          const aiImageFile = new File([blob], `ai-generated-${Date.now()}.png`, { type: 'image/png' });
          
          // Upload the AI-generated image to Cloudinary
          finalImageUrl = await uploadImageToCloudinary(aiImageFile);
        } catch (conversionError) {
          console.error('Error converting AI image to file:', conversionError);
          // Fallback to using the base64 URL if conversion fails
          finalImageUrl = formData.imageUrl;
        }
      }

      const submissionData = { 
        ...formData, 
        imageUrl: finalImageUrl, 
        status: 'pending', 
        submittedAt: new Date().toISOString() 
      };
      
      // Clean up form data
      delete submissionData.image;

      const resp = await fetch('/api/submit-offer', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(submissionData) 
      });
      
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Failed to submit offer');
      }
      
      const result = await resp.json();
      setSubmissionId(result.submissionId || result.insertedId || 'NA');
      setSubmitted(true);
      
      // Reset form
      setFormData({ 
        title:"", 
        description:"", 
        image:null, 
        imageUrl:"", 
        imageMethod: "",
        aiPrompt: "",
        aiStyle: "",
        mapLink:"", 
        category:"", 
        expiryDate:"", 
        city:"", 
        area:"", 
        keywords:"", 
        ownerName:"", 
        phoneNumber:"", 
        socialLink:"" 
      });
      setImagePreview(null);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getAreasForCity = (cityName) => {
    const location = locations.find(l => l.city === cityName);
    return location ? location.areas : [];
  };

  const generateContent = async (type) => {
    // Check if specific AI features are available
    const isAvailable = type === 'title' ? aiAvailable.title : 
                       type === 'description' ? aiAvailable.description :
                       type === 'both' ? (aiAvailable.title || aiAvailable.description) : false;
    
    if (!isAvailable) {
      const featureName = type === 'title' ? 'AI title generation' : 
                         type === 'description' ? 'AI description generation' : 
                         'AI content generation';
      setAiError(`${featureName} is currently unavailable.`);
      return;
    }

    // Validate required fields before generating
    if (!formData.category || !formData.city || !formData.area || !formData.expiryDate) {
      setAiError('Please fill in Category, City, Area, and Expiry Date before generating AI suggestions.');
      return;
    }

    setAiError(null);
    setGenerateLoading(prev => ({ ...prev, [type]: true }));

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.category,
          city: formData.city,
          area: formData.area,
          expiryDate: formData.expiryDate,
          keywords: formData.keywords
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      
      if (type === 'title' && aiAvailable.title) {
        setFormData(prev => ({ ...prev, title: data.title }));
      } else if (type === 'description' && aiAvailable.description) {
        setFormData(prev => ({ ...prev, description: data.description }));
      } else if (type === 'both') {
        const updates = {};
        if (aiAvailable.title) updates.title = data.title;
        if (aiAvailable.description) updates.description = data.description;
        setFormData(prev => ({ 
          ...prev, 
          ...updates
        }));
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setAiError(error.message || 'Failed to generate AI content. Please try again.');
    } finally {
      setGenerateLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold text-green-600 mb-4">Offer Submitted Successfully!</h2>
          <p className="text-gray-600 mb-3">Submission ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{submissionId}</span></p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 mb-1"><span className="font-semibold">🔍 Review Process:</span> We will review your offer carefully.</p>
            <p className="text-gray-700"><span className="font-semibold">⏱️ Timeline:</span> After successful verification, your offer will go live within 3 working days.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setSubmitted(false)} className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Submit Another</button>
            <Link href="/" className="flex-1 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 text-center">🏠 Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">📋 Submit Your Offer</h1>
          <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">🏠 Go Home</Link>
        </div>
      </div>

      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Share Your Amazing Deals!</h2>
              <p className="text-gray-600">All fields are required to submit your offer</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Factual Inputs Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                  Basic Information
                </h3>
                <p className="text-sm text-gray-600 mb-6">Let&apos;s start with the essential details about your offer</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📂 Category *</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select a category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🏙️ City *</label>
                      <select name="city" value={formData.city} onChange={handleInputChange} required disabled={loadingLocations} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                        <option value="">{loadingLocations ? "Loading cities..." : "Select a city"}</option>
                        {locations.map((loc, idx) => (
                          <option key={`${loc.city}-${idx}`} value={loc.city}>{loc.city}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">📍 Area *</label>
                      <select name="area" value={formData.area} onChange={handleInputChange} required disabled={!formData.city || loadingLocations} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                        <option value="">{!formData.city ? "Select city first" : "Select an area"}</option>
                        {formData.city && getAreasForCity(formData.city).map((a, idx) => (
                          <option key={`${a}-${idx}`} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">⏰ Expiry Date *</label>
                    <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🏷️ Keywords (Optional)</label>
                    <input type="text" name="keywords" value={formData.keywords} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., discount, sale, premium, fresh" />
                    <p className="text-xs text-gray-500 mt-1">Add relevant keywords to help generate better suggestions (optional)</p>
                  </div>
                </div>
              </div>

              {/* Step 2: AI-Suggested Content Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                  Offer Details
                </h3>
                <p className="text-sm text-gray-600 mb-6">Create compelling title and description for your offer</p>
                
                {/* AI Error Display */}
                {aiError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <div className="flex items-center">
                      <span className="mr-2">⚠️</span>
                      <span className="text-sm">{aiError}</span>
                    </div>
                  </div>
                )}

                {/* Generate Both Button - Only show if AI is available */}
                {(aiAvailable.title || aiAvailable.description) && (
                  <div className="text-center mb-4">
                    <button 
                      type="button" 
                      onClick={() => generateContent('both')}
                      disabled={generateLoading.title || generateLoading.description}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {(generateLoading.title || generateLoading.description) ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </span>
                      ) : (
                        '🤖 Generate Title & Description'
                      )}
                    </button>
                  </div>
                )}

                {/* Show message when AI is disabled */}
                {!aiAvailable.title && !aiAvailable.description && !checkingAiAvailability && (
                  <div className="text-center mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      ✍️ Please enter your offer title and description manually
                    </p>
                  </div>
                )}
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">📝 Offer Title *</label>
                      {aiAvailable.title && (
                        <button 
                          type="button" 
                          onClick={() => generateContent('title')}
                          disabled={generateLoading.title || generateLoading.description}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generateLoading.title ? '⏳' : '🤖'} Generate Title
                        </button>
                      )}
                    </div>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="e.g., 50% Off on Pizza" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">📄 Description *</label>
                      {aiAvailable.description && (
                        <button 
                          type="button" 
                          onClick={() => generateContent('description')}
                          disabled={generateLoading.title || generateLoading.description}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generateLoading.description ? '⏳' : '🤖'} Generate Description
                        </button>
                      )}
                    </div>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Describe your offer in 30 words or less" />
                    <p className="text-xs text-gray-500 mt-1">
                      {getWordCount(formData.description)}/30 words
                      {getWordCount(formData.description) > 25 && getWordCount(formData.description) <= 30 && (
                        <span className="text-orange-500 ml-2">• Approaching limit</span>
                      )}
                      {getWordCount(formData.description) === 30 && (
                        <span className="text-red-500 ml-2">• Word limit reached</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Image Upload Section with AI */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
                  Offer Image
                </h3>
                <p className="text-sm text-gray-600 mb-6">Upload your own image or generate one with AI</p>
                
                <ImageUploadWithAI
                  onImageSelect={handleImageSelect}
                  currentImage={imagePreview}
                  formData={formData}
                  aiAvailable={aiAvailable.image}
                  required={true}
                />
              </div>

              {/* Step 4: Business Details Section */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">4</span>
                  Business Details
                </h3>
                <p className="text-sm text-gray-600 mb-6">Tell customers how to find and contact you</p>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">👤 Business Owner Name *</label>
                      <input type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">📞 Phone Number *</label>
                      <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="+91-9876543210" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🗺️ Google Maps Link *</label>
                      <input type="url" name="mapLink" value={formData.mapLink} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="https://maps.google.com/..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🌐 Website/Social Media *</label>
                      <input type="url" name="socialLink" value={formData.socialLink} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="https://instagram.com/..." />
                    </div>
                  </div>
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-lg h-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-lg text-center text-white text-xs leading-4 transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                  <p className="text-sm text-center text-gray-600">
                    {uploadProgress < 100 ? "Uploading image..." : "Finalizing submission..."}
                  </p>
                </div>
              )}

              <button type="submit" disabled={uploading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                {uploading ? '⏳ Submitting...' : '📤 Submit Offer'}
              </button>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center mt-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Instagram-style Crop Modal */}
      {showCropModal && originalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 text-center">✂️ Crop Your Image</h3>
              <p className="text-sm text-gray-600 text-center mt-1">Adjust the square to crop your image like Instagram</p>
            </div>
            
            <div className="p-6">
              <div className="relative mx-auto" style={{ width: '300px', height: '300px' }}>
                {/* Original Image */}
                <Image
                  src={originalImage.dataUrl}
                  alt="Original"
                  className="w-full h-full object-contain"
                  width={300}
                  height={300}
                  style={{
                    maxWidth: '300px',
                    maxHeight: '300px'
                  }}
                />
                
                {/* Crop Overlay */}
                <div
                  className="absolute border-2 border-white shadow-lg cursor-move"
                  style={{
                    left: `${(cropData.x / originalImage.width) * 300}px`,
                    top: `${(cropData.y / originalImage.height) * 300}px`,
                    width: `${(cropData.size / originalImage.width) * 300}px`,
                    height: `${(cropData.size / originalImage.height) * 300}px`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                  }}
                  onMouseDown={(e) => {
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startCropX = cropData.x;
                    const startCropY = cropData.y;
                    
                    const handleMouseMove = (moveEvent) => {
                      const deltaX = moveEvent.clientX - startX;
                      const deltaY = moveEvent.clientY - startY;
                      
                      const scaleX = originalImage.width / 300;
                      const scaleY = originalImage.height / 300;
                      
                      updateCropArea(
                        startCropX + (deltaX * scaleX),
                        startCropY + (deltaY * scaleY)
                      );
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div className="absolute inset-0 border border-white opacity-50">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border border-white opacity-30"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-3">Preview:</p>
                <div className="relative w-24 h-24 mx-auto border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="absolute"
                    style={{
                      width: `${(originalImage.width / cropData.size) * 96}px`,
                      height: `${(originalImage.height / cropData.size) * 96}px`,
                      left: `${-(cropData.x / cropData.size) * 96}px`,
                      top: `${-(cropData.y / cropData.size) * 96}px`
                    }}
                  >
                    <Image
                      src={originalImage.dataUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      width={originalImage.width || 300}
                      height={originalImage.height || 300}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                type="button"
                onClick={handleCropCancel}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                ✅ Use Cropped Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
