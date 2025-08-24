"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import ImageCropper from './ImageCropper';

export default function ImagePreviewCrop({ 
  onImageReady, 
  onCropStart,
  currentImage = null,
  title = "Upload Banner Image"
}) {
  // Always use 16:9 aspect ratio for banners
  const aspectRatio = 16/9;
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setCroppedImage(null);
  };

  const openCropper = () => {
    if (previewUrl) {
      setShowCropper(true);
      // Notify parent that cropping has started
      if (onCropStart) {
        onCropStart();
      }
    }
  };

  const handleCropComplete = (croppedData) => {
    setCroppedImage(croppedData);
    setShowCropper(false);
    
    // Call parent callback with cropped image
    if (onImageReady) {
      onImageReady({
        originalFile: selectedFile,
        croppedBlob: croppedData.blob,
        croppedUrl: croppedData.url,
        dimensions: croppedData.dimensions
      });
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setCroppedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageReady) {
      onImageReady(null);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title}
      </label>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl ? (
        // Image Preview with Controls
        <div className="space-y-4">
          {/* Preview Image */}
          <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="relative w-full h-40 sm:h-48 md:h-56">
              <Image
                src={croppedImage ? croppedImage.url : previewUrl}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            
            {/* Status Badge */}
            <div className="absolute top-2 left-2">
              {croppedImage ? (
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                  ✓ Cropped ({croppedImage.dimensions.width}×{croppedImage.dimensions.height})
                </span>
              ) : (
                <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Original Image
                </span>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openCropper}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <svg width="16" height="16" className="mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L6 2L8 2L8 4L16 4L16 6L18 6L18 8L20 8L20 10L18 10L18 18L10 18L10 20L8 20L8 18L2 18L2 16L4 16L4 8L6 8L6 9Z" fill="currentColor"/>
              </svg>
              {croppedImage ? 'Re-crop Image' : 'Crop to Banner Size'}
            </button>

            <button
              type="button"
              onClick={openFileDialog}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <svg width="16" height="16" className="mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Change Image
            </button>

            <button
              type="button"
              onClick={removeImage}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <svg width="16" height="16" className="mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Remove
            </button>
          </div>

          {/* Info Panel */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Image Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              {croppedImage ? (
                <>
                  <p><strong>Status:</strong> Ready for banner use</p>
                  <p><strong>Dimensions:</strong> {croppedImage.dimensions.width} × {croppedImage.dimensions.height} pixels</p>
                  <p><strong>Aspect Ratio:</strong> 16:9 (Perfect Banner Size)</p>
                </>
              ) : (
                <>
                  <p><strong>Status:</strong> Original image - needs cropping</p>
                  <p><strong>Recommended:</strong> Crop to 16:9 banner ratio</p>
                  <p><strong>Action:</strong> Click &quot;Crop to Banner Size&quot; to optimize</p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Upload Area
        <div
          onClick={openFileDialog}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-gray-600">
            <p className="text-lg font-medium">Click to select an image</p>
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPG, GIF up to 10MB
            </p>
            <p className="text-sm text-gray-500 mt-1">
              You can crop it to banner size after selection
            </p>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && previewUrl && (
        <ImageCropper
          image={previewUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
          title="Crop Your Banner Image"
        />
      )}
    </div>
  );
}