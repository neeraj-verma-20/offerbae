// app/admin/AdminPanel.js

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";

export default function AdminPanel() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    mapLink: "",
    category: "",
    expiryDate: "",
    city: "",
  });
  const [offers, setOffers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState("form");
  const [description, setDescription] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  const wordCount = description.trim().split(/\s+/).length;
  const maxWords = 30;

  const offersPerPage = 5;

  const loadOffers = async () => {
    const res = await fetch("/api/save-offers");
    const data = await res.json();
    setOffers(data);
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image size should be under 5MB.");
      return;
    }

    const objectURL = URL.createObjectURL(file);
    const img = document.createElement("img");

    img.onload = async () => {
      if (img.width !== img.height) {
        alert("Please upload a square image (1:1 ratio).");
        setForm((prev) => ({ ...prev, image: "" }));
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
          setForm((prev) => ({ ...prev, image: data.secure_url }));
          setImagePreview(data.secure_url);
          setImageLoading(false);
          URL.revokeObjectURL(objectURL); // Clean up object URL
          setStatus("✅ Image uploaded successfully!");
          setTimeout(() => setStatus(""), 3000);
        } catch (error) {
          setImageLoading(false);
          console.error("Image upload error:", error);
          alert("❌ Failed to upload image. Try again.");
        }
      }
    };

    img.src = objectURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmSubmit = confirm(
      "📋 Are you sure you want to save this offer? Please recheck all details."
    );
    if (!confirmSubmit) {
      setStatus("🟡 Submission cancelled.");
      return;
    }

    // sync description state back into form before sending
    const finalForm = { ...form, description };

    let newId = editId;
    if (!editId) {
      const maxId =
        offers.length > 0 ? Math.max(...offers.map((o) => o.id)) : 0;
      newId = maxId + 1;
    }

    const offer = { id: newId, ...finalForm };

    const res = await fetch("/api/save-offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(offer),
    });

    if (res.ok) {
      setStatus(editId ? "✅ Offer updated!" : "✅ Offer added!");
      setForm({
        title: "",
        description: "",
        image: "",
        mapLink: "",
        category: "",
        expiryDate: "",
        city: "",
        ownerName: "", // ✅ New
        phoneNumber: "", // ✅ New
        socialLink: "", // ✅ New
      });
      setDescription(""); // Reset description state too
      setImagePreview(null);
      setEditId(null);
      setTimeout(() => setStatus(""), 3000);
      await loadOffers();
    } else {
      const errorData = await res.json();
      setStatus(`❌ Failed to save offer. ${errorData?.error || ""}`);
    }
  };

  const handleEdit = (offer) => {
    setForm({ ...offer });
    setEditId(offer.id);
    setImagePreview(offer.image);
    setStatus("📝 Edit mode");
    setTab("form");
    setDescription(offer.description || "");
  };

  const handleDelete = async (id) => {
    const res = await fetch("/api/delete-offer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setStatus("🗑️ Offer deleted!");
      await loadOffers();
    } else {
      setStatus("❌ Failed to delete offer.");
    }
  };

  const filteredOffers = offers.filter((offer) =>
    `${offer.title} ${offer.description} ${offer.category}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 5 && diffDays >= 0;
  };

  const getDaysLeft = (expiryDate) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : null;
  };

  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);
  const currentOffers = filteredOffers.slice(
    (currentPage - 1) * offersPerPage,
    currentPage * offersPerPage
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">📋 Offer Management</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/admin" })}
          className="text-red-500 text-sm"
        >
          Logout
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded-full ${
            tab === "form" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTab("form")}
        >
          Add/Edit
        </button>
        <button
          className={`px-4 py-2 rounded-full ${
            tab === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTab("list")}
        >
          Manage
        </button>
      </div>

      {tab === "form" && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-4 rounded-xl shadow"
        >
          {editId && (
            <p className="text-sm font-medium text-yellow-600">
              ✏️ You are currently editing offer ID: {editId}
            </p>
          )}
          <input
            name="ownerName"
            placeholder="Business Owner Name"
            value={form.ownerName || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="phoneNumber"
            placeholder="Phone Number"
            value={form.phoneNumber || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="socialLink"
            placeholder="Linktree / Website / Instagram"
            value={form.socialLink || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
          <textarea
            value={description}
            onChange={(e) => {
              const words = e.target.value.trim().split(/\s+/);
              if (words.length <= maxWords) {
                setDescription(e.target.value);
              }
            }}
            className="w-full border rounded p-2"
            placeholder="Enter a short description (max 30 words)"
            rows={3}
          />

          <p className="text-sm mt-1 text-right">
            {wordCount}/{maxWords} words
            {wordCount > maxWords && (
              <span className="text-red-500 font-semibold ml-2">Too long!</span>
            )}
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border p-2 rounded"
          />
          {imageLoading && (
            <div className="text-sm text-blue-600 animate-pulse mt-2">
              ⏳ Uploading image...
            </div>
          )}

          {imagePreview && (
            <Image
              src={imagePreview}
              alt="Preview"
              width={100}
              height={100}
              className="rounded border"
            />
          )}
          <input
            name="mapLink"
            placeholder="Google Maps Link"
            value={form.mapLink}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded bg-white"
          >
            <option value="">-- Select a Category --</option>
            <option value="Food & Beverages">🍔 Food & Beverages</option>
            <option value="Fashion & Clothing">👗 Fashion & Clothing</option>
            <option value="Electronics & Gadgets">
              📱 Electronics & Gadgets
            </option>
            <option value="Beauty & Wellness">💅 Beauty & Wellness</option>
            <option value="Fitness & Gyms">🏋️ Fitness & Gyms</option>
            <option value="Cafes & Bakeries">☕ Cafes & Bakeries</option>
            <option value="Entertainment">🎬 Entertainment</option>
            <option value="Education & Coaching">
              📚 Education & Coaching
            </option>
            <option value="Travel & Tourism">✈️ Travel & Tourism</option>
            <option value="Health & Medicine">💊 Health & Medicine</option>
            <option value="Furniture & Home">🛋️ Furniture & Home</option>
            <option value="Events & Activities">🎉 Events & Activities</option>
            <option value="Grocery & Essentials">
              🛒 Grocery & Essentials
            </option>
            <option value="Mobile & Accessories">
              📱 Mobile & Accessories
            </option>
            <option value="Salon & Spa">💇 Salon & Spa</option>
            <option value="Gifts & Stationery">🎁 Gifts & Stationery</option>
            <option value="Others">🔖 Others</option>
          </select>

          <input
            name="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <select
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded bg-white"
          >
            <option value="">-- Select a City --</option>
            <option value="Indore">🏙️ Indore</option>
            <option value="Bhopal">🏙️ Bhopal</option>
          </select>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            {editId ? "Update Offer" : "Add Offer"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm({
                  title: "",
                  description: "",
                  image: "",
                  mapLink: "",
                  category: "",
                  expiryDate: "",
                  city: "",
                });
                setDescription("");
                setImagePreview(null);
                setStatus("🟡 Edit cancelled.");
                setTimeout(() => setStatus(""), 3000);
              }}
              className="ml-4 text-sm text-gray-600 hover:text-red-600 underline"
            >
              ❌ Exit Edit Mode
            </button>
          )}
          {status && <p className="text-sm mt-2 text-gray-600">{status}</p>}
        </form>
      )}

      {tab === "list" && (
        <div>
          <input
            type="text"
            placeholder="Search offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />
          {currentOffers.map((offer) => (
            <div
              key={offer.id}
              className={`p-4 rounded-xl shadow mb-4 flex gap-4 items-start transition ${
                isExpiringSoon(offer.expiryDate)
                  ? "bg-red-100 animate-pulse"
                  : "bg-white"
              }`}
            >
              {offer.image && (
                <Image
                  src={offer.image}
                  alt="Offer"
                  width={80}
                  height={80}
                  className="rounded cursor-pointer border"
                  onClick={() => {
                    setModalImage(offer.image);
                    setModalOpen(true);
                  }}
                />
              )}
              <div className="flex-grow">
                <h3 className="text-lg font-semibold">{offer.title}</h3>
                <p className="text-sm text-gray-700 mb-1">
                  {offer.description}
                </p>

                {/* ✅ Owner Name */}
                {offer.ownerName && (
                  <p className="text-xs text-gray-700 font-medium">
                    👤 {offer.ownerName}
                  </p>
                )}

                {/* ✅ Phone Number */}
                {offer.phoneNumber && (
                  <p className="text-xs text-gray-600">
                    📞 {offer.phoneNumber}
                  </p>
                )}

                {/* ✅ Social Link */}
                {offer.socialLink && (
                  <a
                    href={offer.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline"
                  >
                    🌐 Social / Website
                  </a>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  📂 {offer.category} | ⏳ Expires: {offer.expiryDate}
                  {getDaysLeft(offer.expiryDate) !== null && (
                    <span className="ml-1 text-red-500 font-semibold">
                      ({getDaysLeft(offer.expiryDate)} days left)
                    </span>
                  )}
                </p>

                {isExpiringSoon(offer.expiryDate) && (
                  <p className="text-xs font-semibold text-red-600 animate-pulse">
                    ⚠️ Expiring Soon
                  </p>
                )}

                {offer.mapLink && (
                  <a
                    href={offer.mapLink}
                    target="_blank"
                    className="text-xs text-blue-600 underline"
                  >
                    📍 View on Map
                  </a>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    const proceed = confirm(
                      `✏️ Do you want to edit "${offer.title}"?`
                    );
                    if (proceed) handleEdit(offer);
                  }}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `❗ Are you sure you want to delete "${offer.title}"? This cannot be undone.`
                      )
                    ) {
                      handleDelete(offer.id);
                    }
                  }}
                  className="text-red-600 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-full ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setModalOpen(false)}
        >
          <Image
            src={modalImage}
            alt="Full View"
            width={400}
            height={400}
            className="rounded shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
