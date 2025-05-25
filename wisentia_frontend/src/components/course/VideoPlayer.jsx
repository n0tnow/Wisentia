'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  CircularProgress, 
  alpha, 
  useTheme,
  Paper 
} from '@mui/material';

// Video oynatıcı bileşeni - sadece istemci tarafında çalışır
const VideoPlayer = ({ video, onVideoProgress, userView }) => {
  const theme = useTheme();
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const youtubeApiLoadedRef = useRef(false);
  const playerInitializedRef = useRef(false);
  const progressIntervalRef = useRef(null);
  const lastReportedProgressRef = useRef({
    played: 0,          // Played percentage as a decimal (0-1)
    time: 0,            // Current play position in seconds
    completed: false,   // Whether the video is completed
    timestamp: 0,       // Last time progress was reported
    sessionStartTime: null // When this viewing session started
  });
  const videoStartTimeRef = useRef(Date.now());
  const isMounted = useRef(true);
  
  // Player durumu için daha basit bir state - daha az render yaratır
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // İzleme ilerlemesini raporlama - useCallback ile memoize edilmiş
  const onProgress = useCallback(
    (progress) => {
      // Disable automatic progress tracking
      console.log("Progress tracking disabled");
      const { playedSeconds, played } = progress;
      setCurrentTime(playedSeconds);
    },
    [duration]
  );

  // YouTube API'yi yükleme fonksiyonu 
  const loadYouTubeApi = useCallback(() => {
    // Skip if not in browser environment
    if (typeof window === 'undefined') {
      return Promise.resolve(null);
    }
    
    if (youtubeApiLoadedRef.current) return Promise.resolve(window.YT);
    
    return new Promise((resolve) => {
      // Global callback fonksiyon
      window.onYouTubeIframeAPIReady = () => {
        youtubeApiLoadedRef.current = true;
        resolve(window.YT);
      };
      
      // Script yükleme
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    });
  }, []);

  // Player başlatma fonksiyonu
  const initializePlayer = useCallback(async () => {
    // Skip if not in browser environment
    if (typeof window === 'undefined') return;
    
    // Eğer zaten başlatılmışsa veya gerekli veriler yoksa çık
    if (playerInitializedRef.current || !video?.YouTubeVideoID || !containerRef.current) {
      return;
    }
    
    try {
      setLoading(true);
      
      // YouTube API'yi yükle
      const YT = await loadYouTubeApi();
      
      // Reset view start time when initializing player
      videoStartTimeRef.current = Date.now();
      
      // Determine the best starting position:
      // 1. Check if userView has lastPosition (direct seconds)
      // 2. If not, use watchedPercentage
      // 3. Default to 0
      let startSeconds = 0;
      
      if (userView) {
        console.log('User view data found:', userView);
        
        if (userView.lastPosition && userView.lastPosition > 0) {
          // If there's a direct second position, use that
          startSeconds = Math.floor(userView.lastPosition);
          console.log(`Using exact position from userView.lastPosition: ${startSeconds} seconds`);
        } else if (userView.watchedPercentage && userView.watchedPercentage > 0) {
          // Otherwise calculate from percentage
          startSeconds = Math.floor((userView.watchedPercentage / 100) * video.Duration);
          console.log(`Calculated position from percentage (${userView.watchedPercentage}%): ${startSeconds} seconds`);
        }
        
        // Don't start from the very end - if we're close to the end, back up a bit
        if (video.Duration && startSeconds > (video.Duration - 10)) {
          startSeconds = Math.max(0, video.Duration - 30);
          console.log(`Adjusted start position away from end: ${startSeconds} seconds`);
        }
      } else {
        console.log('No user view data found, starting from beginning');
      }
      
      console.log(`Video başlatılıyor: ID=${video.YouTubeVideoID}, başlangıç=${startSeconds} saniye`);
      
      // Player'ı temizle
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      
      // Yeni player oluştur
      playerRef.current = new YT.Player(containerRef.current, {
        videoId: video.YouTubeVideoID,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          start: startSeconds,
          enablejsapi: 1,
          origin: window.location.origin,
          widget_referrer: window.location.href
        },
        events: {
          onReady: (event) => {
            console.log('YouTube player hazır');
            setLoading(false);
            playerInitializedRef.current = true;
            
            // If we have a specific position to seek to that's not the start,
            // explicitly seek to make sure we're at the right spot
            if (startSeconds > 0) {
              try {
                event.target.seekTo(startSeconds, true);
                console.log(`Player explicitly seeked to ${startSeconds} seconds`);
              } catch (seekError) {
                console.error('Error seeking to position:', seekError);
              }
            }
            
            // Interval'ı temizle
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
            
            // İlerleme takibi için interval başlat - sıklığı artır
            progressIntervalRef.current = setInterval(() => {
              try {
                if (!playerRef.current) return;
                
                const currentTime = playerRef.current.getCurrentTime() || 0;
                const duration = playerRef.current.getDuration() || video.Duration;
                
                // Make sure we have valid numbers
                if (isNaN(currentTime) || isNaN(duration)) {
                  console.warn('Invalid currentTime or duration values:', { currentTime, duration });
                  return;
                }
                
                // Disabled automatic progress tracking
                console.log('Automatic progress tracking disabled');
              } catch (error) {
                console.error('Progress tracking error:', error);
              }
            }, 2000);
          },
          onStateChange: (event) => {
            // Update loading state based on player state
            if (event.data === YT.PlayerState.BUFFERING) {
              setLoading(true);
            } else if (event.data === YT.PlayerState.PLAYING) {
              setLoading(false);
            }
            
            // Video completion handling disabled
            if (event.data === YT.PlayerState.ENDED) {
              console.log('Video ended - automatic completion disabled');
            }
          },
          onError: (event) => {
            console.error(`YouTube player hatası: ${event.data}`);
            setLoading(false);
          }
        }
      });
    } catch (error) {
      console.error('Player başlatma hatası:', error);
      setLoading(false);
    }
  }, [video, userView, loadYouTubeApi, onProgress]);

  // Video değiştiğinde player'ı yeniden başlat
  useEffect(() => {
    // Mevcut durumu temizle
    playerInitializedRef.current = false;
    lastReportedProgressRef.current = {
      played: 0,
      time: 0,
      completed: false,
      timestamp: 0,
      sessionStartTime: null
    };
    
    // Reset view start time when video changes
    videoStartTimeRef.current = Date.now();
    
    // Player'ı başlat
    initializePlayer();
    
    // Temizleme işlemi
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Final progress report on unmount if player exists
      if (playerRef.current) {
        try {
          const currentTime = playerRef.current.getCurrentTime() || 0;
          const duration = playerRef.current.getDuration() || (video ? video.Duration : 0);
          
          if (duration && currentTime) {
            onProgress({ playedSeconds: currentTime, played: currentTime / duration, loaded: currentTime / duration, loadedSeconds: currentTime });
          }
          
          playerRef.current.destroy();
        } catch (error) {
          console.error('Player temizleme hatası:', error);
        }
        playerRef.current = null;
      }
    };
  }, [video?.YouTubeVideoID, initializePlayer, onProgress, video]);
  
  // Clean up function when component unmounts
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      
      // Report final progress before unmounting
      if (playerRef.current) {
        try {
          const finalTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          if (finalTime && duration) {
            onProgress({ 
              playedSeconds: finalTime, 
              played: finalTime / duration, 
              loaded: 1, 
              loadedSeconds: duration 
            });
            console.log('Final progress reported on unmount:', finalTime, duration);
          }
        } catch (e) {
          console.warn('Error reporting final progress:', e);
        }
      }
    };
  }, []);
  
  return (
    <Paper 
      elevation={4}
      sx={{ 
        position: 'relative', 
        width: '100%', 
        paddingTop: '56.25%', // 16:9 oranı
        backgroundColor: 'black', 
        borderRadius: 2, 
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.005)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }
      }}
    >
      {/* Loading göstergesi */}
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 10
          }}
        >
          <CircularProgress 
            size={60} 
            thickness={5} 
            sx={{ 
              color: theme.palette.secondary.main,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
        </Box>
      )}
      
      {/* YouTube player container */}
      <Box 
        ref={containerRef}
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          zIndex: 1
        }} 
      />
      
      {/* Alt gradyan overlay */}
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: '80px', 
          background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))', 
          pointerEvents: 'none',
          zIndex: 5
        }} 
      />
    </Paper>
  );
};

export default VideoPlayer;