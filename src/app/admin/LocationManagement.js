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

  const handleToggleStatus = async (city, currentStatus) => {
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
    const action = newStatus === 'enabled' ? 'enable' : 'disable';
    
    if (!confirm(`Are you sure you want to ${action} "${city}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/locations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: city,
          status: newStatus
        })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(`✅ Location ${action}d successfully!`);
        await loadLocations();
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus(`❌ ${data.error || `Failed to ${action} location`}`);
      }
    } catch (error) {
      setStatus(`❌ Failed to ${action} location`);
    }
  };

  const handleDelete = async (city) => {
    if (!confirm(`⚠️ Are you sure you want to PERMANENTLY DELETE "${city}" and all its areas? This action cannot be undone!`)) {
      return;
    }

    try {
      const res = await fetch(`/api/locations?city=${encodeURIComponent(city)}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("🗑️ Location permanently deleted!");
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

  const enabledLocations = locations.filter(loc => loc.status !== 'disabled');
  const disabledLocations = locations.filter(loc => loc.status === 'disabled');

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

      {/* Statistics */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">📊 Location Statistics</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">{enabledLocations.length}</div>
            <div className="text-sm text-green-700">✅ Enabled</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded">
            <div className="text-2xl font-bold text-yellow-600">{disabledLocations.length}</div>
            <div className="text-sm text-yellow-700">⏸️ Disabled</div>
          </div>
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">{locations.length}</div>
            <div className="text-sm text-blue-700">📍 Total</div>
          </div>
        </div>
      </div>

      {/* Enabled Locations */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          ✅ Enabled Locations ({enabledLocations.length})
        </h2>
        
        {enabledLocations.length === 0 ? (
          <p className="text-gray-500">No enabled locations.</p>
        ) : (
          <div className="space-y-4">
            {enabledLocations.map((location) => (
              <div
                key={location.city}
                className="border border-green-200 rounded-lg p-4 hover:bg-green-50 bg-green-50/30"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-green-700">
                        🏙️ {location.city}
                      </h3>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        ✅ Active
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {[...location.areas].sort((a, b) => a.localeCompare(b)).map((area, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
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
                      onClick={() => handleToggleStatus(location.city, location.status || 'enabled')}
                      className="text-yellow-600 text-sm hover:underline"
                    >
                      ⏸️ Disable
                    </button>
                    <button
                      onClick={() => handleDelete(location.city)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disabled Locations */}
      {disabledLocations.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ⏸️ Disabled Locations ({disabledLocations.length})
          </h2>
          
          <div className="space-y-4">
            {disabledLocations.map((location) => (
              <div
                key={location.city}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 bg-gray-50/30 opacity-75"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-600">
                        🏙️ {location.city}
                      </h3>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        ⏸️ Disabled
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {[...location.areas].sort((a, b) => a.localeCompare(b)).map((area, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
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
                      onClick={() => handleToggleStatus(location.city, location.status)}
                      className="text-green-600 text-sm hover:underline"
                    >
                      ✅ Enable
                    </button>
                    <button
                      onClick={() => handleDelete(location.city)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 