"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import ImageCropper from './ImageCropper';

export default function ImageUpload({ 
  onImageSelect, 
  currentImage = null,
  aspectRatio = 16/9,
  title = "Upload Image",
  acceptedFormats = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  cropTitle = "Crop Image",
  showPreview = true
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      alert(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleCropComplete = (croppedData) => {
    setPreviewUrl(croppedData.url);
    setShowCropper(false);
    setSelectedImage(null);
    
    // Call the parent callback with the cropped image data
    onImageSelect({
      file: croppedData.blob,
      url: croppedData.url,
      dimensions: croppedData.dimensions
    });
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImage(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        accept={acceptedFormats}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${previewUrl ? 'border-solid border-gray-200' : ''}
        `}
      >
        {previewUrl && showPreview ? (
          // Image Preview
          <div className="relative">
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog();
                }}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-full shadow-md transition-all"
                title="Change image"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="bg-red-500 bg-opacity-90 hover:bg-opacity-100 text-white p-2 rounded-full shadow-md transition-all"
                title="Remove image"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          // Upload Placeholder
          <div className="py-8">
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
              <p className="text-lg font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, GIF up to {Math.round(maxSize / 1024 / 1024)}MB
              </p>
              {aspectRatio && (
                <p className="text-sm text-gray-500 mt-1">
                  Recommended ratio: {aspectRatio === 16/9 ? '16:9' : aspectRatio === 1 ? '1:1' : `${aspectRatio}:1`}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Cropper Modal */}
      {showCropper && selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
          title={cropTitle}
        />
      )}
    </div>
  );
}