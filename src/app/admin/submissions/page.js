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

  const submissionsPerPage = 10;

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

  const getImageSrc = (submission) => {
    if (typeof submission?.imageUrl === "string" && submission.imageUrl.trim() !== "") return submission.imageUrl;
    if (typeof submission?.image === "string" && submission.image.trim() !== "") return submission.image;
    return "";
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

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
    </div>
  );
} 