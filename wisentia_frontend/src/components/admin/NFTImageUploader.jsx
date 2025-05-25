// src/components/admin/NFTImageUploader.jsx
"use client";
import { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Clear as ClearIcon,
  Image as ImageIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

export default function NFTImageUploader({ onUploadSuccess }) {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset states
    setError(null);
    setUploadSuccess(false);
    
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
      console.log('Starting image upload process...');
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      // Log the file being uploaded
      console.log('Uploading file:', selectedFile.name, 'Size:', selectedFile.size, 'Type:', selectedFile.type);
      
      const response = await fetch('/api/files/nft-image/upload', {
        method: 'POST',
        body: formData,
      });
      
      const responseText = await response.text();
      console.log('Upload response status:', response.status);
      console.log('Upload response text:', responseText);
      
      if (!response.ok) {
        let errorMessage = 'Failed to upload image';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('Upload error details:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      // Parse response data
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Upload successful, received data:', data);
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      // Set success state
      setUploadSuccess(true);
      
      // Check if we have a valid URL in the response
      if (!data?.url) {
        console.error('No URL in upload response:', data);
        throw new Error('Server did not return an image URL');
      }
      
      // Call callback function with new image URL
      console.log('Calling onUploadSuccess with URL:', data.url);
      if (onUploadSuccess) {
        onUploadSuccess(data.url);
      }
      
    } catch (err) {
      console.error('Image upload error:', err);
      setError(err.message || 'Failed to upload image');
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setUploadSuccess(false);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <Box className="space-y-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/gif"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      {/* Upload status messages */}
      {error && (
        <Alert 
          severity="error" 
          variant="outlined"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <ClearIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}
      
      {uploadSuccess && (
        <Alert 
          severity="success"
          variant="outlined"
          icon={<CheckCircleIcon />}
          sx={{ mb: 3 }}
        >
          Image uploaded successfully!
        </Alert>
      )}
      
      {/* Preview Image */}
      {preview ? (
        <Box sx={{ 
          position: 'relative',
          width: '100%',
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: theme.shadows[3]
        }}>
          <img 
            src={preview} 
            alt="Preview" 
            style={{ 
              width: '100%',
              maxHeight: '280px',
              objectFit: 'contain',
              display: 'block',
              backgroundColor: alpha(theme.palette.background.paper, 0.8)
            }} 
          />
          
          {/* Cancel button */}
          <IconButton 
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
              }
            }}
            onClick={handleCancel}
            aria-label="remove image"
          >
            <ClearIcon />
          </IconButton>
        </Box>
      ) : (
        <Box 
          onClick={triggerFileInput}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '180px',
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 2,
            border: '2px dashed',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            mb: 3,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              borderColor: alpha(theme.palette.primary.main, 0.3),
            }
          }}
        >
          <ImageIcon sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.5), mb: 2 }} />
          <Typography variant="body1" color="textSecondary" align="center">
            Click to select an image
          </Typography>
          <Typography variant="caption" color="textSecondary" align="center" sx={{ mt: 1 }}>
            JPG, PNG or GIF. Max size: 10MB
          </Typography>
        </Box>
      )}
      
      {/* Action Buttons */}
      {selectedFile && !uploadSuccess && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            variant="contained"
            color="primary"
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
            sx={{ 
              minWidth: '140px',
              borderRadius: '8px',
              py: 1
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
          
          <Button
            onClick={handleCancel}
            disabled={uploading}
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
        </Box>
      )}
      
      {/* Select new file button shown after success */}
      {uploadSuccess && (
        <Button
          onClick={triggerFileInput}
          variant="outlined"
          color="primary"
          startIcon={<ImageIcon />}
          sx={{ borderRadius: '8px' }}
        >
          Select another image
        </Button>
      )}
    </Box>
  );
}