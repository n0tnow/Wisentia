'use client';

import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

const StarEffect = () => {
  const [stars, setStars] = useState([]);
  
  // Client-side'da çalıştığından emin olmak için useEffect kullanın
  useEffect(() => {
    // Sabit seed ile rastgele değerler oluştur (hydration hatası önlemek için)
    const generateStars = () => {
      return Array.from({ length: 20 }, (_, i) => ({
        id: i,
        top: `${Math.floor(i * 5.5) % 100}%`, // Öngörülebilir pozisyonlar kullan
        left: `${Math.floor(i * 7.3) % 100}%`,
        size: 1 + (i % 3),
        duration: 2 + (i % 3),
        delay: (i * 0.3) % 3
      }));
    };
    
    setStars(generateStars());
  }, []);

  return (
    <Box sx={{ 
      position: 'absolute', 
      height: '100%', 
      width: '100%', 
      overflow: 'hidden', 
      zIndex: 0,
      // Bu stil hem sunucu hem de istemci tarafında tutarlı olacak
      '& .starPoint': {
        position: 'absolute',
        borderRadius: '50%',
        backgroundColor: 'white',
        opacity: 0.7,
        zIndex: 0
      },
      // Keyframes tanımları
      '@keyframes twinkle': {
        '0%': { opacity: 0.3, transform: 'scale(0.8)' },
        '50%': { opacity: 1, transform: 'scale(1.1)' },
        '100%': { opacity: 0.3, transform: 'scale(0.8)' },
      }
    }}>
      {stars.map((star) => (
        <Box
          key={star.id}
          className="starPoint"
          sx={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: star.top,
            left: star.left,
            animation: `twinkle ${star.duration}s ${star.delay}s infinite ease-in-out`,
          }}
        />
      ))}
    </Box>
  );
};

export default StarEffect;