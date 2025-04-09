// src/components/admin/NFTImageUploader.jsx
"use client";
import { useState } from 'react';

export default function NFTImageUploader({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset error
    setError(null);
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const response = await fetch('/api/files/nft-image/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      
      // Call callback function with new image URL
      if (onUploadSuccess && data.url) {
        onUploadSuccess(data.url);
      }
      
      // Reset states
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Preview Image */}
      {preview && (
        <div className="w-full mb-4">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-h-64 max-w-full object-contain rounded border" 
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">NFT Image</label>
        <div className="flex items-center">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleFileChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded
                      file:border-0 file:text-sm file:font-semibold file:bg-blue-50
                      file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          JPG, PNG or GIF. Max size: 10MB
        </p>
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}
      
      {selectedFile && (
        <div className="flex space-x-3">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          <button
            onClick={handleCancel}
            disabled={uploading}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}