"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Wand2, Upload, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function ImageUploadWithAI({
  onImageSelect,
  currentImage = null,
  formData = {},
  aiAvailable = false,
  required = false
}) {
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'ai'
  const [aiStyle, setAiStyle] = useState('realistic');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(currentImage);
  const [aiAvailability, setAiAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const aiStyles = [
    { value: 'realistic', label: 'Realistic', description: 'Photo-realistic commercial style' },
    { value: 'modern', label: 'Modern', description: 'Clean, minimalist design' },
    { value: 'vibrant', label: 'Vibrant', description: 'Bright, colorful and eye-catching' },
    { value: 'professional', label: 'Professional', description: 'Corporate and polished' }
  ];

  // Check AI availability when AI method is selected
  useEffect(() => {
    if (uploadMethod === 'ai') {
      checkAiAvailability();
    }
  }, [uploadMethod]);

  const checkAiAvailability = async () => {
    setCheckingAvailability(true);
    try {
      const response = await fetch('/api/ai-availability?feature=image');
      if (response.ok) {
        const data = await response.json();
        setAiAvailability(data);
      } else {
        setAiAvailability({ available: false, message: 'Unable to check AI availability' });
      }
    } catch (error) {
      console.error('Error checking AI availability:', error);
      setAiAvailability({ available: false, message: 'Unable to check AI availability' });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setImagePreview(imageUrl);
        onImageSelect({
          file,
          url: imageUrl,
          method: 'upload'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAIImage = async () => {
    // Check if essential fields are filled
    const requiredFields = ['title', 'description', 'category'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());

    if (missingFields.length > 0) {
      alert(`Please fill in these fields first: ${missingFields.join(', ')}`);
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: formData,
          style: aiStyle
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data);
      setImagePreview(data.imageUrl);

      onImageSelect({
        url: data.imageUrl,
        prompt: data.enhancedPrompt,
        style: aiStyle,
        method: 'ai'
      });

    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setGeneratedImage(null);
    onImageSelect(null);
  };

  return (
    <div className="space-y-4">
      {/* Method Selection */}
      <div className={`flex space-x-4 mb-6 ${!aiAvailable ? 'justify-center' : ''}`}>
        <button
          type="button"
          onClick={() => setUploadMethod('upload')}
          className={`${aiAvailable ? 'flex-1' : 'px-8'} flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${uploadMethod === 'upload'
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
            }`}
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload Image
        </button>
        {aiAvailable && (
          <button
            type="button"
            onClick={() => setUploadMethod('ai')}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${uploadMethod === 'ai'
              ? 'border-purple-500 bg-purple-50 text-purple-700'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
              }`}
          >
            <Wand2 className="w-5 h-5 mr-2" />
            Generate with AI
            {aiAvailability && !aiAvailability.available && (
              <AlertCircle className="w-4 h-4 ml-1 text-red-500" />
            )}
          </button>
        )}
      </div>

      {/* Show message when AI is disabled */}
      {!aiAvailable && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            📷 Please upload your own image - AI generation is currently unavailable
          </p>
        </div>
      )}

      {/* Upload Method */}
      {uploadMethod === 'upload' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="text-blue-500 mt-0.5">ℹ️</div>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Image Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Ratio:</strong> Square images preferred (1:1 ratio)</li>
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
            onChange={handleFileUpload}
            required={required && !imagePreview}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* AI Generation Method */}
      {uploadMethod === 'ai' && (
        <div className="space-y-4">
          {/* AI Availability Status */}
          {checkingAvailability ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                <p className="text-sm text-blue-700">Checking AI availability...</p>
              </div>
            </div>
          ) : aiAvailability && !aiAvailability.available ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">AI Generation Unavailable</p>
                  <p className="text-xs">{aiAvailability.message}</p>
                  {aiAvailability.dailyUsage !== undefined && (
                    <p className="text-xs mt-1">
                      Daily usage: {aiAvailability.dailyUsage}/{aiAvailability.dailyLimit} | 
                      Monthly usage: {aiAvailability.monthlyUsage}/{aiAvailability.monthlyLimit}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : aiAvailability && aiAvailability.available ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="text-sm text-green-700">
                  <p className="font-medium mb-1">AI Image Generation Available</p>
                  <p className="text-xs">We'll use your offer details to create a professional image!</p>
                  <p className="text-xs mt-1">
                    Daily usage: {aiAvailability.dailyUsage}/{aiAvailability.dailyLimit} | 
                    Monthly usage: {aiAvailability.monthlyUsage}/{aiAvailability.monthlyLimit}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
                <div className="text-sm text-purple-700">
                  <p className="font-medium mb-1">AI Image Generation:</p>
                  <p className="text-xs">We'll use your offer description to create a professional image!</p>
                </div>
              </div>
            </div>
          )}

          {formData.title && formData.description && formData.category ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Using your offer details:</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Title:</span> {formData.title}</p>
                <p><span className="font-medium">Category:</span> {formData.category}</p>
                <p><span className="font-medium">Description:</span> {formData.description}</p>
                {formData.city && <p><span className="font-medium">Location:</span> {formData.city}{formData.area && `, ${formData.area}`}</p>}
                {formData.keywords && <p><span className="font-medium">Keywords:</span> {formData.keywords}</p>}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">
                📝 Please fill in the <strong>Title</strong>, <strong>Category</strong>, and <strong>Description</strong> fields above first to generate a relevant image.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {aiStyles.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setAiStyle(style.value)}
                  className={`p-3 text-left border rounded-lg transition-all ${aiStyle === style.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                >
                  <div className="font-medium text-sm">{style.label}</div>
                  <div className="text-xs opacity-75">{style.description}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={generateAIImage}
            disabled={
              generating || 
              !formData.title || 
              !formData.description || 
              !formData.category ||
              (aiAvailability && !aiAvailability.available)
            }
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating Image...
              </>
            ) : aiAvailability && !aiAvailability.available ? (
              <>
                <AlertCircle className="w-5 h-5 mr-2" />
                AI Generation Unavailable
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Image from Offer Details
              </>
            )}
          </button>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Preview:</p>
            <button
              type="button"
              onClick={clearImage}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Remove Image
            </button>
          </div>

          <div className="relative w-48 h-48 mx-auto">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="rounded-lg border object-cover"
            />
          </div>

          {generatedImage && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                <span className="font-medium">✨ AI Generated:</span> {generatedImage.message}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Style: {aiStyles.find(s => s.value === generatedImage.style)?.label}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}