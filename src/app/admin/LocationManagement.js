"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export default function LocationManagement() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    city: "",
    areas: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [editingCity, setEditingCity] = useState("");
  const [status, setStatus] = useState("");

  const loadLocations = async () => {
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      // Sort locations by city name alphabetically
      const sortedLocations = data.sort((a, b) => a.city.localeCompare(b.city));
      setLocations(sortedLocations);
    } catch (error) {
      setStatus("❌ Failed to load locations");
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.city.trim() || !form.areas.trim()) {
      setStatus("❌ City and areas are required");
      return;
    }

    const areasArray = form.areas.split(',').map(area => area.trim()).filter(area => area);

    try {
      const method = editMode ? "PUT" : "POST";
      const res = await fetch("/api/locations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: form.city.trim(),
          areas: areasArray
        })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(editMode ? "✅ Location updated!" : "✅ Location added!");
        setForm({ city: "", areas: "" });
        setEditMode(false);
        setEditingCity("");
        await loadLocations();
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus(`❌ ${data.error || "Failed to save location"}`);
      }
    } catch (error) {
      setStatus("❌ Failed to save location");
    }
  };

  const handleEdit = (location) => {
    setForm({
      city: location.city,
      areas: location.areas.join(", ")
    });
    setEditMode(true);
    setEditingCity(location.city);
    setStatus("📝 Edit mode - " + location.city);
  };

  const handleDelete = async (city) => {
    if (!confirm(`Are you sure you want to delete "${city}" and all its areas?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/locations?city=${encodeURIComponent(city)}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("✅ Location deleted!");
        await loadLocations();
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus(`❌ ${data.error || "Failed to delete location"}`);
      }
    } catch (error) {
      setStatus("❌ Failed to delete location");
    }
  };

  const handleCancel = () => {
    setForm({ city: "", areas: "" });
    setEditMode(false);
    setEditingCity("");
    setStatus("🟡 Edit cancelled");
    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">📍 Location Management</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/admin" })}
          className="text-red-500 text-sm"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editMode ? `Edit Location: ${editingCity}` : "Add New Location"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">City Name</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Enter city name"
              className="w-full border p-2 rounded"
              disabled={editMode}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Areas (comma-separated)</label>
            <textarea
              value={form.areas}
              onChange={(e) => setForm({ ...form, areas: e.target.value })}
              placeholder="Enter areas separated by commas (e.g., Vijaynagar, Palasia, Rajwada)"
              className="w-full border p-2 rounded"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple areas with commas
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editMode ? "Update Location" : "Add Location"}
            </button>
            
            {editMode && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        
        {status && (
          <p className="text-sm mt-3 text-gray-600">{status}</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Current Locations</h2>
        
        {locations.length === 0 ? (
          <p className="text-gray-500">No locations added yet.</p>
        ) : (
          <div className="space-y-4">
            {locations.map((location) => (
              <div
                key={location.city}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-blue-600">
                      🏙️ {location.city}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {[...location.areas].sort((a, b) => a.localeCompare(b)).map((area, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            📍 {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(location)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(location.city)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 