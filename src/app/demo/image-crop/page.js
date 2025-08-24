"use client";

import { useState } from 'react';
import ImageUpload from '../../components/ImageUpload';

export default function ImageCropDemo() {
  const [bannerImage, setBannerImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [squareImage, setSquareImage] = useState(null);

  const handleBannerImageSelect = (imageData) => {
    setBannerImage(imageData);
  };

  const handleProfileImageSelect = (imageData) => {
    setProfileImage(imageData);
  };

  const handleSquareImageSelect = (imageData) => {
    setSquareImage(imageData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Image Upload & Crop Demo
          </h1>

          <div className="space-y-8">
            {/* Banner Image Upload */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Banner Image (16:9 Aspect Ratio)
              </h2>
              <ImageUpload
                onImageSelect={handleBannerImageSelect}
                aspectRatio={16/9}
                title="Upload Banner Image"
                cropTitle="Crop Banner Image"
                currentImage={bannerImage?.url}
              />
              {bannerImage && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Dimensions:</strong> {bannerImage.dimensions.width} × {bannerImage.dimensions.height} pixels
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>File Size:</strong> {Math.round(bannerImage.file.size / 1024)} KB
                  </p>
                </div>
              )}
            </div>

            {/* Profile Image Upload */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Profile Image (1:1 Square)
              </h2>
              <ImageUpload
                onImageSelect={handleProfileImageSelect}
                aspectRatio={1}
                title="Upload Profile Image"
                cropTitle="Crop Profile Image"
                currentImage={profileImage?.url}
              />
              {profileImage && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Dimensions:</strong> {profileImage.dimensions.width} × {profileImage.dimensions.height} pixels
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>File Size:</strong> {Math.round(profileImage.file.size / 1024)} KB
                  </p>
                </div>
              )}
            </div>

            {/* Free Aspect Ratio */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Custom Image (Free Aspect Ratio)
              </h2>
              <ImageUpload
                onImageSelect={handleSquareImageSelect}
                aspectRatio={null}
                title="Upload Custom Image"
                cropTitle="Crop Custom Image"
                currentImage={squareImage?.url}
              />
              {squareImage && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Dimensions:</strong> {squareImage.dimensions.width} × {squareImage.dimensions.height} pixels
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>File Size:</strong> {Math.round(squareImage.file.size / 1024)} KB
                  </p>
                </div>
              )}
            </div>

            {/* Usage Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                How to Use
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li>• Click the upload area or drag & drop an image</li>
                <li>• Choose from preset aspect ratios or use free crop</li>
                <li>• Drag to reposition, use slider to zoom</li>
                <li>• Click &quot;Crop &amp; Save&quot; to apply changes</li>
                <li>• The cropped image data is available in your callback</li>
              </ul>
            </div>

            {/* Integration Example */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Integration Example
              </h3>
              <pre className="text-sm text-gray-700 bg-white p-4 rounded border overflow-x-auto">
{`import ImageUpload from './components/ImageUpload';

function MyComponent() {
  const handleImageSelect = (imageData) => {
    // imageData contains:
    // - file: Blob object for upload
    // - url: Preview URL
    // - dimensions: { width, height }
    
    // Upload to your server or use as needed
  };

  return (
    <ImageUpload
      onImageSelect={handleImageSelect}
      aspectRatio={16/9}
      title="Upload Banner"
      cropTitle="Crop Banner"
      maxSize={5 * 1024 * 1024} // 5MB
    />
  );
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}