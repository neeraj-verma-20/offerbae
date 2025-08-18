"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function OfferSubmission() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    imageUrl: "",
    mapLink: "",
    category: "",
    expiryDate: "",
    city: "",
    area: "",
    ownerName: "",
    phoneNumber: "",
    socialLink: ""
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const categories = [
    "Food & Beverages",
    "Fashion & Clothing",
    "Electronics & Gadgets",
    "Beauty & Wellness",
    "Fitness & Gyms",
    "Cafes & Bakeries",
    "Entertainment",
    "Education & Coaching",
    "Travel & Tourism",
    "Health & Medicine",
    "Furniture & Home",
    "Events & Activities",
    "Grocery & Essentials",
    "Mobile & Accessories",
    "Salon & Spa",
    "Gifts & Stationery",
    "Others"
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
    fetchLocations();

    // Refresh locations when returning to the page
    const handleFocus = () => {
      fetchLocations();
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      // Use the browser's built-in validation instead of alert
      e.target.setCustomValidity("Image size should be under 5MB");
      e.target.reportValidity();
      return;
    }
    if (!file.type.startsWith('image/')) {
      e.target.setCustomValidity('Please select an image file');
      e.target.reportValidity();
      return;
    }

    const objectURL = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.onload = () => {
      if (img.width !== img.height) {
        // Use custom validity for better UX
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.setCustomValidity('Please upload a square image (1:1 ratio)');
          fileInput.reportValidity();
        }
        setFormData(prev => ({ ...prev, image: null }));
        setImagePreview(null);
        URL.revokeObjectURL(objectURL);
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      URL.revokeObjectURL(objectURL);
    };
    img.src = objectURL;
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

    const required = ['title','description','image','category','ownerName','phoneNumber','city','area','mapLink','socialLink','expiryDate'];
    for (const key of required) {
      const val = formData[key];
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        e.target.reportValidity();
        return;
      }
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const imageUrl = await uploadImageToCloudinary(formData.image);
      const submissionData = { ...formData, imageUrl, status: 'pending', submittedAt: new Date().toISOString() };
      delete submissionData.image;

      const resp = await fetch('/api/submit-offer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(submissionData) });
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Failed to submit offer');
      }
      const result = await resp.json();
      setSubmissionId(result.submissionId || result.insertedId || 'NA');
      setSubmitted(true);
      setFormData({ title:"", description:"", image:null, imageUrl:"", mapLink:"", category:"", expiryDate:"", city:"", area:"", ownerName:"", phoneNumber:"", socialLink:"" });
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold text-green-600 mb-4">Offer Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">Submission ID: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{submissionId}</span></p>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📝 Offer Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., 50% Off on Pizza" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📄 Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Describe your offer in 30 words or less" />
                <p className="text-xs text-gray-500 mt-1">
                  {getWordCount(formData.description)}/30 words
                  {getWordCount(formData.description) > 25 && getWordCount(formData.description) <= 30 && (
                    <span className="text-orange-500 ml-2">• Almost at limit</span>
                  )}
                  {getWordCount(formData.description) === 30 && (
                    <span className="text-red-500 ml-2">• Word limit reached</span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🖼️ Offer Image *</label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-500 mt-0.5">ℹ️</div>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Image Requirements:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li><strong>Ratio:</strong> Square images only (1:1 ratio)</li>
                        <li><strong>Size:</strong> Maximum 5MB</li>
                        <li><strong>Format:</strong> JPG, PNG, WebP supported</li>
                        <li><strong>Recommended:</strong> 500x500px or higher</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                {imagePreview && (
                  <div className="mt-3">
                    <p className="text-xs text-green-600 mb-2">✅ Square image detected - Perfect!</p>
                    <div className="relative w-48 h-48">
                      <Image src={imagePreview} alt="Preview" fill className="rounded-lg border object-cover" />
                    </div>
                  </div>
                )}
              </div>

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
                  <label className="block text-sm font-medium text-gray-700 mb-2">👤 Business Owner Name *</label>
                  <input type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📞 Phone Number *</label>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="+91-9876543210" />
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🗺️ Google Maps Link *</label>
                  <input type="url" name="mapLink" value={formData.mapLink} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://maps.google.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🌐 Website/Social Media *</label>
                  <input type="url" name="socialLink" value={formData.socialLink} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://instagram.com/..." />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">⏰ Expiry Date *</label>
                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
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
    </div>
  );
}

