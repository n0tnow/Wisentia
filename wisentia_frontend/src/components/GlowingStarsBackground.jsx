'use client';

import { Box, useTheme, alpha } from '@mui/material';
import { useState, useEffect } from 'react';

export default function GlowingStarsBackground() {
  const theme = useTheme();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // This will only run on the client after hydration
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    // Return an empty container during server-side rendering or initial hydration
    return (
      <Box
        className="stars-container"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: -1,
        }}
      />
    );
  }
  
  // Only render stars on the client after hydration is complete
  return (
    <Box
      className="stars-container"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: -1,
      }}
    >
      {/* Small star particles */}
      {[...Array(70)].map((_, i) => (
        <Box
          key={`star-${i}`}
          className="star"
          sx={{
            position: 'absolute',
            width: Math.random() < 0.7 ? '1px' : '2px',
            height: Math.random() < 0.7 ? '1px' : '2px',
            backgroundColor: i % 5 === 0 ? theme.palette.secondary.main : theme.palette.primary.main,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `twinkle-${i % 3} ${2 + Math.random() * 4}s infinite ease-in-out`,
            opacity: 0.6 + Math.random() * 0.4,
          }}
        />
      ))}
      
      {/* Larger glow stars */}
      {[...Array(20)].map((_, i) => {
        const size = 1 + Math.random() * 2;
        return (
          <Box
            key={`glow-star-${i}`}
            className="glow-star"
            sx={{
              position: 'absolute',
              width: size,
              height: size,
              backgroundColor: i % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
              borderRadius: '50%',
              boxShadow: i % 2 === 0 
                ? `0 0 ${5 + Math.random() * 10}px ${theme.palette.primary.main}`
                : `0 0 ${5 + Math.random() * 10}px ${theme.palette.secondary.main}`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse-${i % 5} ${4 + Math.random() * 6}s infinite alternate`,
            }}
          />
        );
      })}
    </Box>
  );
} 