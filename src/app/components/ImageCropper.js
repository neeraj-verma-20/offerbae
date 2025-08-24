"use client";

import { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';

export default function ImageCropper({ 
  image, 
  onCropComplete, 
  onCancel,
  aspectRatio = 16/9, // Fixed banner aspect ratio
  cropShape = 'rect',
  title = "Crop Banner Image"
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  // Always use 16:9 aspect ratio for banners
  const currentAspectRatio = 16/9;

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      
      onCropComplete({
        blob: croppedImageBlob,
        url: croppedImageUrl,
        dimensions: {
          width: croppedAreaPixels.width,
          height: croppedAreaPixels.height
        }
      });
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Fixed 16:9 Aspect Ratio Info */}
          <div className="mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <svg width="16" height="16" className="text-blue-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm font-medium text-blue-900">
                  Banner Aspect Ratio: 16:9 (Perfect for banners)
                </span>
              </div>
            </div>
          </div>

          {/* Cropper */}
          <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={currentAspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={setZoom}
              cropShape={cropShape}
            />
          </div>

          {/* Zoom Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Crop Info */}
          {croppedAreaPixels && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Crop size: {croppedAreaPixels.width} × {croppedAreaPixels.height} pixels
              </p>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-gray-200 p-6 pt-4">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!croppedAreaPixels}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Crop & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}