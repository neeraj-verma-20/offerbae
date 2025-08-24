"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, Edit, ArrowUp, ArrowDown, ExternalLink, Link as LinkIcon } from 'lucide-react';
import ImagePreviewCrop from '../../components/ImagePreviewCrop';

export default function BannerManagement() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [croppedImageData, setCroppedImageData] = useState(null);
  const croppedImageRef = useRef(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    openInNewTab: true,
    active: true,
    order: 0
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/banners');
      if (!res.ok) throw new Error('Failed to fetch banners');
      
      const data = await res.json();
      // Sort by order
      const sortedBanners = [...data].sort((a, b) => a.order - b.order);
      setBanners(sortedBanners);
    } catch (err) {
      setError('Error loading banners: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle cropped image ready
  const handleImageReady = (imageData) => {
    setCroppedImageData(imageData);
    croppedImageRef.current = imageData; // Store in ref for immediate access
    setImageProcessing(false); // Image processing complete
    // Force a small re-render to ensure state is updated
    setTimeout(() => {
      setError(null);
    }, 10);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };



  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null); // Clear previous errors

    try {
      // Wait a bit longer to ensure state is fully updated
      await new Promise(resolve => setTimeout(resolve, 200));

      // Create or update banner
      const url = editMode ? `/api/banners/${editId}` : '/api/banners';
      const method = editMode ? 'PUT' : 'POST';

      let res;

      // Get the most current image data - check state first, then ref
      let currentImageData = croppedImageData || croppedImageRef.current;
      

      
      // For new banners, image is required
      if (!editMode) {
        // Wait up to 2 seconds for image data to be available
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts && (!croppedImageData || !croppedImageData.croppedBlob)) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;

        }
        
        const finalImageData = croppedImageData || croppedImageRef.current;
        
        if (!finalImageData) {
          throw new Error('Please select an image for the banner');
        }
        if (!finalImageData.croppedBlob) {
          throw new Error('Please crop the selected image before saving');
        }
        
        // Update currentImageData with the final data
        currentImageData = finalImageData;
      }

      if (currentImageData && currentImageData.croppedBlob) {
        // Send as FormData with the cropped image
        const formDataToSend = new FormData();
        formDataToSend.append('image', currentImageData.croppedBlob, 'banner.jpg');
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('link', formData.link);
        formDataToSend.append('openInNewTab', formData.openInNewTab);
        formDataToSend.append('active', formData.active);
        formDataToSend.append('order', formData.order);

        res = await fetch(url, {
          method,
          body: formDataToSend
        });
      } else if (editMode) {
        // For edit mode without new image, send as JSON
        const bannerData = { ...formData };
        res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bannerData)
        });
      } else {
        // This should not happen due to validation above
        throw new Error('Image is required for new banners');
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Admin: Response error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `Failed to ${editMode ? 'update' : 'create'} banner: ${res.status}`);
      }

      const responseData = await res.json();

      // Reset form
      setFormData({
        title: '',
        description: '',
        link: '',
        openInNewTab: true,
        active: true,
        order: 0
      });
      setCroppedImageData(null);
      croppedImageRef.current = null;
      setImageProcessing(false);
      setEditMode(false);
      setEditId(null);

      // Refresh banners list
      fetchBanners();
    } catch (err) {
      setError('Error saving banner: ' + err.message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle banner deletion
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete banner');

      // Refresh banners list
      fetchBanners();
    } catch (err) {
      setError('Error deleting banner: ' + err.message);
      console.error(err);
    }
  };

  // Handle banner edit
  const handleEdit = (banner) => {
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      link: banner.link || '',
      openInNewTab: banner.openInNewTab || false,
      active: banner.active || true,
      order: banner.order || 0
    });
    // Reset cropped image data for editing
    setCroppedImageData(null);
    croppedImageRef.current = null;
    setEditMode(true);
    setEditId(banner._id);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle banner reordering
  const handleReorder = async (id, direction) => {
    const bannerIndex = banners.findIndex(b => b._id === id);
    if (bannerIndex === -1) return;

    // Can't move first item up or last item down
    if (
      (direction === 'up' && bannerIndex === 0) ||
      (direction === 'down' && bannerIndex === banners.length - 1)
    ) {
      return;
    }

    const swapIndex = direction === 'up' ? bannerIndex - 1 : bannerIndex + 1;
    const updatedBanners = [...banners];
    
    // Swap orders
    const temp = updatedBanners[bannerIndex].order;
    updatedBanners[bannerIndex].order = updatedBanners[swapIndex].order;
    updatedBanners[swapIndex].order = temp;

    // Update in UI first for responsiveness
    [updatedBanners[bannerIndex], updatedBanners[swapIndex]] = 
    [updatedBanners[swapIndex], updatedBanners[bannerIndex]];
    
    setBanners(updatedBanners);

    // Update in database
    try {
      await Promise.all([
        fetch(`/api/banners/${updatedBanners[bannerIndex]._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: updatedBanners[bannerIndex].order })
        }),
        fetch(`/api/banners/${updatedBanners[swapIndex]._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: updatedBanners[swapIndex].order })
        })
      ]);
    } catch (err) {
      setError('Error reordering banners: ' + err.message);
      console.error(err);
      // Revert UI changes on error
      fetchBanners();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Banner Management</h1>
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back to Admin
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button
            className="float-right font-bold"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Banner Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? 'Edit Banner' : 'Add New Banner'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {/* Banner Dimension Guidelines */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">📐 Recommended Banner Dimensions</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>For AI Generation:</strong> 1920 × 1080 pixels (16:9 ratio)</p>
                  <p><strong>Alternative:</strong> 2048 × 1152 pixels (16:9 ratio)</p>
                  <p className="text-xs text-blue-600 mt-2">💡 You can crop it to banner size after selection</p>
                  <p className="text-xs text-green-600">☁️ Images are automatically uploaded to Cloudinary</p>
                </div>
              </div>
              
              <div className="mb-4">
                <ImagePreviewCrop
                  onImageReady={handleImageReady}
                  onCropStart={() => setImageProcessing(true)}
                  title="Banner Image *"
                  currentImage={null}
                />
                {!editMode && (!croppedImageData || !croppedImageData.croppedBlob) && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 font-medium">
                      ⚠️ Image Required: Please select and crop an image before saving
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Banner Title (optional)"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Short description (optional)"
                  rows="2"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://example.com (optional)"
                />
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="openInNewTab"
                  name="openInNewTab"
                  checked={formData.openInNewTab}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="openInNewTab" className="text-sm text-gray-700">
                  Open link in new tab
                </label>
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Active (visible on site)
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <div>
              {/* Image Status Info */}
              {croppedImageData && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">✓ Image Ready</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Dimensions:</strong> {croppedImageData.dimensions.width} × {croppedImageData.dimensions.height} pixels</p>
                    <p><strong>File Size:</strong> {Math.round(croppedImageData.croppedBlob.size / 1024)} KB</p>
                    <p><strong>Aspect Ratio:</strong> 16:9 (Perfect for banners)</p>
                  </div>
                </div>
              )}
              
              {editMode && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Edit Mode</h4>
                  <div className="text-sm text-blue-800">
                    <p>Current image will be kept if no new image is selected.</p>
                    <p>Upload a new image above to replace the current one.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {/* Help text when button is disabled */}
            {!editMode && (!croppedImageData || !croppedImageData.croppedBlob) && !imageProcessing && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <div className="text-yellow-500 mt-0.5">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Complete these steps to add your banner:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Upload an image using the file selector above</li>
                      <li>Click &quot;Crop Image&quot; to open the cropping tool</li>
                      <li>Adjust the crop area and click &quot;Crop and Save&quot;</li>
                      <li>Fill in the banner details (title, description, etc.)</li>
                      <li>Click &quot;Add Banner&quot; to save</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
            
            {/* Processing message */}
            {imageProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Processing image... Please wait for cropping to complete.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || imageProcessing || (!editMode && (!croppedImageData || !croppedImageData.croppedBlob))}
                className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors ${(isSubmitting || imageProcessing || (!editMode && (!croppedImageData || !croppedImageData.croppedBlob))) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting
                  ? 'Saving Banner...'
                  : imageProcessing
                  ? 'Wait - Processing Image...'
                  : !editMode && (!croppedImageData || !croppedImageData.croppedBlob)
                  ? 'Crop Image First'
                  : editMode
                  ? 'Update Banner'
                  : 'Add Banner'}
              </button>
            {editMode && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    title: '',
                    description: '',
                    link: '',
                    openInNewTab: true,
                    active: true,
                    order: 0
                  });
                  setCroppedImageData(null);
                  croppedImageRef.current = null;
                  setImageProcessing(false);
                  setEditMode(false);
                  setEditId(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Banners List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Current Banners</h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No banners found. Add your first banner above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner) => (
                  <tr key={banner._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative w-32 bg-gray-100 rounded overflow-hidden aspect-video">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title || 'Banner'}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {banner.title || 'Untitled Banner'}
                      </div>
                      {banner.description && (
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {banner.description}
                        </div>
                      )}
                      {banner.link && (
                        <div className="text-xs text-blue-500 flex items-center mt-1">
                          <LinkIcon size={12} className="mr-1" />
                          <a
                            href={banner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline truncate max-w-xs"
                          >
                            {banner.link}
                          </a>
                          {banner.openInNewTab && (
                            <ExternalLink size={12} className="ml-1" />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {banner.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {banner.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReorder(banner._id, 'up')}
                          className="text-gray-600 hover:text-gray-900"
                          title="Move Up"
                          disabled={banners.indexOf(banner) === 0}
                        >
                          <ArrowUp size={18} />
                        </button>
                        <button
                          onClick={() => handleReorder(banner._id, 'down')}
                          className="text-gray-600 hover:text-gray-900"
                          title="Move Down"
                          disabled={banners.indexOf(banner) === banners.length - 1}
                        >
                          <ArrowDown size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(banner)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}