'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton, Box } from '@mui/material';

/**
 * Enhanced IPFS Image component.
 * Handles various image sources:
 * - IPFS URIs (ipfs://)
 * - Backend media paths (/media/)
 * - HTTP/HTTPS URLs
 * - Relative paths
 * - Blockchain metadata URIs
 * 
 * Provides fallback for failed loads and loading states.
 */
const IPFSImage = ({
  src,
  alt = 'Image',
  width = 200,
  height = 200,
  quality = 90,
  priority = false,
  className = '',
  fallbackSrc = 'https://via.placeholder.com/300/0a192f/64ffda?text=NFT',
  showPlaceholderOnLoad = true,
  objectFit = 'contain',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Reset states when src changes
    setLoading(true);
    setError(false);

    if (!src) {
      setImageSrc(fallbackSrc);
      setLoading(false);
      return;
    }

    // Process different types of image sources
    // IPFS URIs
    if (src.startsWith('ipfs://')) {
      // Use local IPFS proxy or a gateway
      const cid = src.replace('ipfs://', '');
      // First try our local proxy
      setImageSrc(`/ipfs/${cid}`);
    } 
    // Backend media paths - ensure they're properly proxied
    else if (src.startsWith('/media/')) {
      // Use the API_MEDIA_URL prefix for media files
      setImageSrc(`/api/media${src}`);
    }
    // Localhost or backend URLs - normalize them
    else if (src.includes('localhost:8000') || src.startsWith('http://localhost:8000')) {
      const relativePath = src.split('localhost:8000')[1];
      setImageSrc(`/api/media${relativePath}`);
    }
    // Already HTTP/HTTPS URLs
    else if (src.startsWith('http://') || src.startsWith('https://')) {
      setImageSrc(src);
    }
    // Handle direct blockchain metadata URLs
    else if (src.includes('metadata') && src.includes('blockchain')) {
      setImageSrc(`/api/ipfs/resolve?uri=${encodeURIComponent(src)}`);
    }
    // Relative paths and other cases
    else {
      setImageSrc(src);
    }

    setLoading(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    console.warn(`Image failed to load: ${src}`);
    setError(true);
    setImageSrc(fallbackSrc);
  };

  // Show skeleton loader while loading
  if (loading && showPlaceholderOnLoad) {
    return (
      <Skeleton
        variant="rectangular"
        width={width}
        height={height}
        animation="wave"
      />
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: width,
        height: height,
        overflow: 'hidden',
        borderRadius: props.borderRadius || 'inherit',
      }}
      className={className}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill
        style={{ objectFit: objectFit }}
        onError={handleError}
        priority={priority}
        quality={quality}
        sizes={`(max-width: 768px) 100vw, ${width}px`}
        {...props}
      />
    </Box>
  );
};

export default IPFSImage; 