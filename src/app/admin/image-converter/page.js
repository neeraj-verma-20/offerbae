"use client";

import { useState } from "react";

export default function ImageConverter() {
  const [base64Result, setBase64Result] = useState("");
  const [fileName, setFileName] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setBase64Result(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(base64Result);
    alert('Base64 copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">🖼️ Image to Base64 Converter</h1>
        <p className="text-gray-600 mb-6">
          Convert images to base64 format for use in Excel files. This is useful when you want to include images directly in your Excel offers.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📁 Select Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full border p-2 rounded"
            />
          </div>

          {base64Result && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📋 Base64 Result
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    📋 Copy Base64
                  </button>
                  <span className="text-sm text-gray-600 self-center">
                    File: {fileName}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                <img 
                  src={base64Result} 
                  alt="Preview" 
                  className="max-w-full h-auto max-h-48 rounded border"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-xs text-gray-600 mb-2">Base64 (first 100 chars):</p>
                <p className="text-xs font-mono break-all">
                  {base64Result.substring(0, 100)}...
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded border">
            <h3 className="font-semibold text-blue-800 mb-2">💡 How to use:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Upload an image using the file input above</li>
              <li>2. Copy the generated base64 string</li>
              <li>3. Paste it into the "ImageURL" column of your Excel file</li>
              <li>4. Upload the Excel file in the admin panel</li>
            </ol>
          </div>

          <div className="mt-4">
            <a
              href="/admin"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Admin Panel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 