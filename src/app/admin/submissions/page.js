"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function SubmissionsManagement() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Edit functionality states
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editDescription, setEditDescription] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);

  const submissionsPerPage = 10;
  const maxWords = 30;
  
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

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/submissions");
      const data = await res.json();
      setSubmissions(data);
    } catch (error) {
      setStatus("❌ Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };
  
  const loadLocations = async () => {
    try {
      const res = await fetch("/api/locations/enabled");
      const data = await res.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      setLocations([]);
    }
  };

  const getImageSrc = (submission) => {
    if (typeof submission?.imageUrl === "string" && submission.imageUrl.trim() !== "") return submission.imageUrl;
    if (typeof submission?.image === "string" && submission.image.trim() !== "") return submission.image;
    return "";
  };

  useEffect(() => {
    loadSubmissions();
    loadLocations();
  }, []);
  
  // Update available areas when city changes in edit form
  useEffect(() => {
    if (editForm.city) {
      const selectedLocation = locations.find(loc => loc.city === editForm.city);
      if (selectedLocation) {
        const sortedAreas = [...selectedLocation.areas].sort((a, b) => a.localeCompare(b));
        setAvailableAreas(sortedAreas);
      } else {
        setAvailableAreas([]);
      }
    } else {
      setAvailableAreas([]);
    }
  }, [editForm.city, locations]);

  const handleClearAllSubmissions = async () => {
    if (!confirm("❗ Are you sure you want to clear ALL submissions? This action cannot be undone!")) {
      return;
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setStatus(`✅ ${data.message}`);
        await loadSubmissions();
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("❌ Failed to clear submissions");
      }
    } catch (error) {
      setStatus("❌ Failed to clear submissions");
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await fetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus(`✅ Submission ${action}ed successfully!`);
        await loadSubmissions();
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus(`❌ Failed to ${action} submission`);
      }
    } catch (error) {
      setStatus(`❌ Failed to ${action} submission`);
    }
  };
  
  const handleEditSubmission = (submission) => {
    setEditingSubmission(submission);
    setEditForm({ ...submission });
    setEditDescription(submission.description || "");
    setImagePreview(getImageSrc(submission) || null);
    
    // Set available areas for the selected city
    if (submission.city) {
      const selectedLocation = locations.find(loc => loc.city === submission.city);
      if (selectedLocation) {
        const sortedAreas = [...selectedLocation.areas].sort((a, b) => a.localeCompare(b));
        setAvailableAreas(sortedAreas);
      }
    }
  };
  
  const handleCancelEdit = () => {
    setEditingSubmission(null);
    setEditForm({});
    setEditDescription("");
    setImagePreview(null);
    setAvailableAreas([]);
  };
  
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    
    // Handle description word limit
    if (name === 'description') {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      if (words.length > maxWords) {
        return; // Don't update if exceeds 30 words
      }
      setEditDescription(value);
      setEditForm(prev => ({ ...prev, [name]: value }));
      return;
    }
    
    setEditForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'city') {
      setEditForm(prev => ({ ...prev, city: value, area: "" }));
    }
  };
  
  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatus("❌ Image size should be under 5MB");
      setTimeout(() => setStatus(""), 5000);
      return;
    }

    const objectURL = URL.createObjectURL(file);
    const img = document.createElement("img");

    img.onload = async () => {
      if (img.width !== img.height) {
        setStatus("❌ Please upload a square image (1:1 ratio)");
        setTimeout(() => setStatus(""), 5000);
        setImagePreview(null);
      } else {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "offers_unsigned");
        formData.append("folder", "offers/img");

        setImageLoading(true);
        try {
          const res = await fetch(
            "https://api.cloudinary.com/v1_1/dn4dv5zlz/image/upload",
            {
              method: "POST",
              body: formData,
            }
          );
          const data = await res.json();
          setEditForm(prev => ({ ...prev, imageUrl: data.secure_url }));
          setImagePreview(data.secure_url);
          setImageLoading(false);
          setStatus("✅ Image uploaded successfully!");
          setTimeout(() => setStatus(""), 3000);
        } catch (error) {
          setImagePreview(null);
          setImageLoading(false);
          setStatus("❌ Failed to upload image");
        }
      }
      URL.revokeObjectURL(objectURL);
    };

    img.src = objectURL;
  };
  
  const handleSaveEdit = async () => {
    try {
      const finalForm = { ...editForm, description: editDescription };
      
      // Remove any undefined or null values
      const cleanedForm = {};
      Object.keys(finalForm).forEach(key => {
        if (finalForm[key] !== undefined && finalForm[key] !== null && finalForm[key] !== '') {
          cleanedForm[key] = finalForm[key];
        }
      });
      
      const res = await fetch("/api/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingSubmission._id, ...cleanedForm }),
      });
      
      if (res.ok) {
        setStatus("✅ Submission updated successfully!");
        await loadSubmissions();
        handleCancelEdit();
        setTimeout(() => setStatus(""), 3000);
      } else {
        const errorData = await res.json();
        setStatus(`❌ Failed to update submission: ${errorData.error || 'Unknown error'}`);
        setTimeout(() => setStatus(""), 5000);
      }
    } catch (error) {
      setStatus(`❌ Failed to update submission: ${error.message}`);
      setTimeout(() => setStatus(""), 5000);
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const searchFields = [
      submission.title || "",
      submission.description || "",
      submission.ownerName || "",
      submission.phoneNumber || "",
      submission.city || "",
      submission.area || "",
    ].join(" ").toLowerCase();
    
    const keywordMatch = searchQuery === "" || searchFields.includes(searchQuery.toLowerCase());
    const statusMatch = filterStatus === "all" || submission.status === filterStatus;
    
    return keywordMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredSubmissions.length / submissionsPerPage);
  const currentSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * submissionsPerPage,
    currentPage * submissionsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">⏳ Pending</span>;
      case "approved":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">✅ Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">❌ Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">❓ Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="text-center">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">📝 Submissions Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Back to Admin
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/admin" })}
            className="text-red-500 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {status && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">
          {status}
        </div>
      )}

      {/* Header with stats and clear button */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">📊 Submission Statistics</h2>
            <div className="flex gap-4 text-sm">
              <span>📝 Total: {submissions.length}</span>
              <span>⏳ Pending: {submissions.filter(s => s.status === 'pending').length}</span>
              <span>✅ Approved: {submissions.filter(s => s.status === 'approved').length}</span>
              <span>❌ Rejected: {submissions.filter(s => s.status === 'rejected').length}</span>
            </div>
          </div>
          <button
            onClick={handleClearAllSubmissions}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            🗑️ Clear All Submissions
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="🔍 Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="all">All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="approved">✅ Approved</option>
            <option value="rejected">❌ Rejected</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          📊 Showing {filteredSubmissions.length} of {submissions.length} submissions
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-xl shadow">
        {currentSubmissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            📝 No submissions found
          </div>
        ) : (
          <div className="divide-y">
            {currentSubmissions.map((submission) => {
              const imgSrc = getImageSrc(submission);
              return (
                <div key={submission._id} className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 flex gap-4">
                      {imgSrc ? (
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image src={imgSrc} alt={submission.title || "Submission Image"} fill className="object-cover rounded border" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 flex-shrink-0 rounded border bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{submission.title}</h3>
                          {getStatusBadge(submission.status)}
                        </div>
                        
                        <p className="text-gray-600 mb-2">{submission.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div>
                            <strong>👤 Owner:</strong> {submission.ownerName}
                          </div>
                          <div>
                            <strong>📞 Phone:</strong> {submission.phoneNumber}
                          </div>
                          <div>
                            <strong>📍 Location:</strong> {submission.city}, {submission.area}
                          </div>
                          <div>
                            <strong>📂 Category:</strong> {submission.category}
                          </div>
                        </div>

                        {submission.socialLink && (
                          <div className="mt-2">
                            <a
                              href={submission.socialLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 text-sm underline"
                            >
                              🌐 Social Link
                            </a>
                          </div>
                        )}

                        {imgSrc && (
                          <div className="mt-1">
                            <a href={imgSrc} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">Open image</a>
                          </div>
                        )}

                        <div className="mt-2 text-xs text-gray-400">
                          📅 Submitted: {new Date(submission.createdAt).toLocaleString()}
                          {submission.expiryDate && (
                            <span className="ml-4">⏰ Expires: {submission.expiryDate}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {submission.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleEditSubmission(submission)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleAction(submission._id, "approve")}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleAction(submission._id, "reject")}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}
                      {submission.status === "approved" && (
                        <span className="text-green-600 text-sm">✅ Approved</span>
                      )}
                      {submission.status === "rejected" && (
                        <span className="text-red-600 text-sm">❌ Rejected</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center p-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Edit Form Modal */}
      {editingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">✏️ Edit Submission</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📝 Offer Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title || ""}
                    onChange={handleEditFormChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 50% Off on Pizza"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📄 Description *</label>
                  <textarea
                    name="description"
                    value={editDescription}
                    onChange={handleEditFormChange}
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your offer in 30 words or less"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {getWordCount(editDescription)}/30 words
                    {getWordCount(editDescription) > 25 && getWordCount(editDescription) <= 30 && (
                      <span className="text-orange-500 ml-2">• Almost at limit</span>
                    )}
                    {getWordCount(editDescription) === 30 && (
                      <span className="text-red-500 ml-2">• Word limit reached</span>
                    )}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🖼️ Offer Image</label>
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {imageLoading && (
                    <div className="text-sm text-blue-600 animate-pulse mt-2">
                      ⏳ Uploading image...
                    </div>
                  )}
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
                  <select
                    name="category"
                    value={editForm.category || ""}
                    onChange={handleEditFormChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">👤 Business Owner Name *</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={editForm.ownerName || ""}
                      onChange={handleEditFormChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📞 Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={editForm.phoneNumber || ""}
                      onChange={handleEditFormChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91-9876543210"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🏙️ City *</label>
                    <select
                      name="city"
                      value={editForm.city || ""}
                      onChange={handleEditFormChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a city</option>
                      {locations.map((loc, idx) => (
                        <option key={`${loc.city}-${idx}`} value={loc.city}>{loc.city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📍 Area *</label>
                    <select
                      name="area"
                      value={editForm.area || ""}
                      onChange={handleEditFormChange}
                      required
                      disabled={!editForm.city}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">{!editForm.city ? "Select city first" : "Select an area"}</option>
                      {editForm.city && availableAreas.map((a, idx) => (
                        <option key={`${a}-${idx}`} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🗺️ Google Maps Link *</label>
                    <input
                      type="url"
                      name="mapLink"
                      value={editForm.mapLink || ""}
                      onChange={handleEditFormChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🌐 Website/Social Media *</label>
                    <input
                      type="url"
                      name="socialLink"
                      value={editForm.socialLink || ""}
                      onChange={handleEditFormChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">⏰ Expiry Date *</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={editForm.expiryDate || ""}
                    onChange={handleEditFormChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    💾 Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 font-medium"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 