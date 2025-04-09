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
  const lastReportedProgressRef = useRef(null);
  
  // Player durumu için daha basit bir state - daha az render yaratır
  const [loading, setLoading] = useState(true);
  
  // İzleme ilerlemesini raporlama - useCallback ile memoize edilmiş
  const reportProgress = useCallback((currentTime, duration) => {
    if (!duration || duration <= 0 || !onVideoProgress) return;
    
    // İzleme yüzdesini hesapla
    const watchedPercentage = Math.min(Math.round((currentTime / duration) * 100), 100);
    const isCompleted = watchedPercentage >= 90; // %90 ve üzeri tamamlandı sayılır
    
    // Önceki raporlama değeri ile karşılaştır - gereksiz güncellemeleri önle
    if (lastReportedProgressRef.current) {
      const { percentage: lastPercentage, completed: lastCompleted } = lastReportedProgressRef.current;
      
      // Önemli bir değişiklik yoksa raporlama
      if (Math.abs(watchedPercentage - lastPercentage) < 5 && isCompleted === lastCompleted) {
        return;
      }
    }
    
    // Yeni ilerlemeyi kaydet
    lastReportedProgressRef.current = {
      percentage: watchedPercentage,
      completed: isCompleted
    };
    
    // İlerlemeyi raporla
    onVideoProgress(watchedPercentage, isCompleted);
  }, [onVideoProgress]);

  // YouTube API'yi yükleme fonksiyonu 
  const loadYouTubeApi = useCallback(() => {
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
    // Eğer zaten başlatılmışsa veya gerekli veriler yoksa çık
    if (playerInitializedRef.current || !video?.YouTubeVideoID || !containerRef.current) {
      return;
    }
    
    try {
      setLoading(true);
      
      // YouTube API'yi yükle
      const YT = await loadYouTubeApi();
      
      // Kullanıcı izleme yüzdesine göre başlangıç zamanı
      const startSeconds = userView && userView.watchedPercentage 
        ? Math.floor((userView.watchedPercentage / 100) * video.Duration) 
        : 0;
        
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
            
            // Interval'ı temizle
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
            
            // İlerleme takibi için interval başlat - 3 saniyede bir kontrol et
            progressIntervalRef.current = setInterval(() => {
              try {
                if (!playerRef.current) return;
                
                const currentTime = playerRef.current.getCurrentTime() || 0;
                const duration = playerRef.current.getDuration() || video.Duration;
                
                // İlerlemeyi raporla
                reportProgress(currentTime, duration);
              } catch (error) {
                console.error('İlerleme takip hatası:', error);
              }
            }, 3000);
          },
          onStateChange: (event) => {
            // Oynatma durumuna göre yükleme durumunu güncelle
            if (event.data === YT.PlayerState.BUFFERING) {
              setLoading(true);
            } else if (event.data === YT.PlayerState.PLAYING) {
              setLoading(false);
            }
            
            // Video tamamlandığında
            if (event.data === YT.PlayerState.ENDED) {
              // Video bittiğinde %100 tamamlandı olarak işaretle
              reportProgress(video.Duration, video.Duration);
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
  }, [video, userView, loadYouTubeApi, reportProgress]);

  // Video değiştiğinde player'ı yeniden başlat
  useEffect(() => {
    // Mevcut durumu temizle
    playerInitializedRef.current = false;
    lastReportedProgressRef.current = null;
    
    // Player'ı başlat
    initializePlayer();
    
    // Temizleme işlemi
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Player temizleme hatası:', error);
        }
        playerRef.current = null;
      }
    };
  }, [video?.YouTubeVideoID, initializePlayer]);
  
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