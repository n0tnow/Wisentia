// src/app/admin/content/courses/create/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';
import { 
  Container, Typography, Button, TextField, MenuItem, 
  Box, Paper, Grid, IconButton, Divider, Card, CardContent,
  useTheme, alpha, CircularProgress, Snackbar, Alert, Tooltip, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TitleIcon from '@mui/icons-material/Title';
import CategoryIcon from '@mui/icons-material/Category';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

// Quantum Theme Colors
const QUANTUM_COLORS = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  accent: '#06B6D4',
  info: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  neon: '#00D4FF',
  plasma: '#FF006E',
  quantum: '#7C3AED',
  gradients: {
    primary: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
    secondary: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
    hero: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 25%, #6366F1 50%, #8B5CF6 75%, #06B6D4 100%)',
    card: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(6, 182, 212, 0.05) 100%)',
    neon: 'linear-gradient(135deg, #00D4FF 0%, #7C3AED 50%, #FF006E 100%)',
    plasma: 'linear-gradient(45deg, #FF006E 0%, #8B5CF6 50%, #00D4FF 100%)',
    quantum: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 25%, #6366F1 50%, #8B5CF6 75%, #06B6D4 100%)'
  },
  shadows: {
    neon: '0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(139, 92, 246, 0.3), 0 0 60px rgba(6, 182, 212, 0.2)',
    plasma: '0 0 20px rgba(255, 0, 110, 0.4), 0 0 40px rgba(139, 92, 246, 0.3)',
    quantum: '0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(139, 92, 246, 0.3), 0 0 90px rgba(6, 182, 212, 0.2)'
  }
};

// Quantum Styled Components
const QuantumContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(4),
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #0F0A1A 0%, #1E1B4B 25%, #1A1B3A 50%, #0F172A 100%)'
    : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 25%, #CBD5E1 50%, #94A3B8 100%)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  }
}));

const QuantumGlassCard = styled(Card)(({ theme, variant = 'default' }) => ({
  background: variant === 'primary' 
    ? QUANTUM_COLORS.gradients.card
    : theme.palette.mode === 'dark'
      ? 'rgba(30, 27, 75, 0.3)'
      : 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: variant === 'primary' 
    ? `1px solid ${alpha(QUANTUM_COLORS.primary, 0.3)}`
    : `1px solid ${alpha(QUANTUM_COLORS.accent, 0.2)}`,
  borderRadius: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: QUANTUM_COLORS.shadows.neon,
    border: `1px solid ${alpha(QUANTUM_COLORS.neon, 0.4)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: variant === 'primary' ? QUANTUM_COLORS.gradients.primary : QUANTUM_COLORS.gradients.neon,
    borderRadius: `${theme.spacing(3)} ${theme.spacing(3)} 0 0`,
  }
}));

const QuantumHeaderContainer = styled(Box)(({ theme }) => ({
  background: QUANTUM_COLORS.gradients.hero,
  borderRadius: theme.spacing(4),
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: QUANTUM_COLORS.shadows.quantum,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(255, 0, 110, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0, 212, 255, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(124, 58, 237, 0.4) 0%, transparent 50%)
    `,
    animation: 'quantumPulse 4s ease-in-out infinite alternate',
    zIndex: 0,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
  '@keyframes quantumPulse': {
    '0%': {
      opacity: 0.7,
      transform: 'scale(1)',
    },
    '100%': {
      opacity: 1,
      transform: 'scale(1.05)',
    },
  }
}));

const QuantumTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(30, 27, 75, 0.4)' 
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(15px)',
    border: `1px solid ${alpha(QUANTUM_COLORS.accent, 0.3)}`,
    transition: 'all 0.3s ease',
    position: 'relative',
    '&:hover': {
      border: `1px solid ${alpha(QUANTUM_COLORS.neon, 0.5)}`,
      boxShadow: `0 0 20px ${alpha(QUANTUM_COLORS.neon, 0.2)}`,
    },
    '&.Mui-focused': {
      border: `2px solid ${QUANTUM_COLORS.neon}`,
      boxShadow: `0 0 30px ${alpha(QUANTUM_COLORS.neon, 0.4)}`,
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(30, 27, 75, 0.6)' 
        : 'rgba(255, 255, 255, 0.9)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    }
  },
  '& .MuiInputLabel-root': {
    color: alpha(QUANTUM_COLORS.accent, 0.8),
    '&.Mui-focused': {
      color: QUANTUM_COLORS.neon,
    }
  }
}));

const QuantumActionButton = styled(Button)(({ theme, variant: buttonVariant = 'primary', glow = false }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.95rem',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  background: buttonVariant === 'primary' ? QUANTUM_COLORS.gradients.primary :
             buttonVariant === 'secondary' ? QUANTUM_COLORS.gradients.secondary :
             buttonVariant === 'neon' ? QUANTUM_COLORS.gradients.neon :
             'transparent',
  border: glow ? `2px solid ${alpha(QUANTUM_COLORS.neon, 0.6)}` : 'none',
  boxShadow: glow 
    ? `0 0 20px ${alpha(QUANTUM_COLORS.neon, 0.4)}`
    : '0 4px 15px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: glow 
      ? `0 0 30px ${alpha(QUANTUM_COLORS.neon, 0.6)}, 0 10px 30px rgba(0, 0, 0, 0.3)`
      : '0 8px 25px rgba(0, 0, 0, 0.3)',
    '&::before': {
      opacity: 1,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease',
    opacity: 0,
  },
  '&:hover::before': {
    transform: 'translateX(100%)',
    opacity: 1,
  }
}));

export default function CreateCoursePage() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    thumbnailUrl: '',
  });
  
  const [videos, setVideos] = useState([
    { 
      title: '', 
      description: '', 
      youtubeVideoId: '', 
      duration: 0, 
      orderInCourse: 1,
      loadingDuration: false,
      error: null
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const { user } = useAuth();
  const router = useRouter();

  // Categories for the course
  const categories = ['Programming', 'Design', 'Marketing', 'Business', 'Science', 'Art'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
    }
    
    // YouTube API'yi yükleyelim
    const loadYouTubeApi = () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        
        window.onYouTubeIframeAPIReady = () => {
          console.log('YouTube API ready');
        };
        
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    };
    
    loadYouTubeApi();
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const addVideoField = () => {
    setVideos([
      ...videos,
      { 
        title: '', 
        description: '', 
        youtubeVideoId: '', 
        duration: 0, 
        orderInCourse: videos.length + 1,
        loadingDuration: false,
        error: null
      }
    ]);
  };

  const extractYouTubeID = (input) => {
    if (!input) return '';
    
    // If it's already just an ID (not a URL), return it
    if (!input.includes('/') && !input.includes('.')) {
      // Basic validation for YouTube ID format
      if (/^[a-zA-Z0-9_-]{6,20}$/.test(input)) {
        return { id: input, isValid: true };
      } else {
        return { id: input, isValid: false, error: 'Invalid YouTube ID format' };
      }
    }
    
    // Try to extract the ID from various YouTube URL formats
    try {
      // Check if it's a YouTube URL
      if (!input.includes('youtube.com') && !input.includes('youtu.be')) {
        return { id: input, isValid: false, error: 'Not a valid YouTube URL' };
      }
      
      // Handle youtube.com/watch?v=ID format
      let match = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/e\/|youtube.com\/shorts\/|youtube\.com\/watch\?.*v=)([^&?#\/\s]+)/);
      if (match && match[1]) {
        return { id: match[1], isValid: true };
      }
      
      // Handle youtu.be/ID format
      match = input.match(/youtu\.be\/([^&?#\/\s]+)/);
      if (match && match[1]) {
        return { id: match[1], isValid: true };
      }
      
      // If we got here, it looks like a YouTube URL but we couldn't extract the ID
      return { id: input, isValid: false, error: 'Could not extract YouTube ID from URL' };
    } catch (e) {
      console.error("Error extracting YouTube ID:", e);
      return { id: input, isValid: false, error: 'Error processing URL' };
    }
  };

  const handleVideoChange = (index, field, value) => {
    const updatedVideos = [...videos];
    
    // Special handling for YouTube video ID field
    if (field === 'youtubeVideoId') {
      // Extract YouTube ID if a URL was pasted
      const result = extractYouTubeID(value);
      
      // Update the field value
      updatedVideos[index][field] = value;
      
      // Clear previous errors
      updatedVideos[index].error = null;
      
      if (!result.isValid) {
        // Set error message if not valid
        updatedVideos[index].error = result.error;
        console.log(`YouTube validation error: ${result.error}`);
      } else if (result.id !== value) {
        // If we extracted an ID and it's different from input, update the field
        console.log(`Extracted YouTube ID: ${result.id} from ${value}`);
        updatedVideos[index][field] = result.id;
        
        // Eğer geçerli bir YouTube ID'si varsa, süreyi otomatik al
        if (result.id && result.id.length > 5) {
          fetchYouTubeVideoDuration(result.id, index);
        }
      } else if (result.isValid && result.id.length > 5) {
        // If the ID is already valid, fetch duration
        fetchYouTubeVideoDuration(result.id, index);
      }
    } else {
      updatedVideos[index][field] = value;
    }
    
    setVideos(updatedVideos);
  };

  // YouTube video süresini ve başlığını çeken fonksiyon
  const fetchYouTubeVideoDuration = async (youtubeId, index) => {
    try {
      // Yükleniyor durumunu göster
      const loadingVideos = [...videos];
      loadingVideos[index].loadingDuration = true;
      loadingVideos[index].error = null; // Önceki hataları temizle
      setVideos(loadingVideos);
      
      // YouTube API'nin hazır olmasını bekleyelim
      const getYouTubeData = () => {
        return new Promise((resolve, reject) => {
          // YouTube API yüklü değilse belirli aralıklarla kontrol edelim
          const checkYT = setInterval(() => {
            if (window.YT && window.YT.Player) {
              clearInterval(checkYT);
              
              // Görünmez bir player oluşturalım
              const playerDiv = document.createElement('div');
              playerDiv.style.display = 'none';
              document.body.appendChild(playerDiv);
              
              try {
                const player = new window.YT.Player(playerDiv, {
                  videoId: youtubeId,
                  width: 1,
                  height: 1,
                  events: {
                    onReady: (event) => {
                      try {
                        // Video süresini alalım (saniye cinsinden)
                        const duration = event.target.getDuration();
                        // Video başlığını alalım
                        const title = event.target.getVideoData().title;
                        
                        // Player'ı temizleyelim
                        event.target.destroy();
                        if (playerDiv.parentNode) {
                          playerDiv.parentNode.removeChild(playerDiv);
                        }
                        
                        resolve({ duration, title });
                      } catch (error) {
                        reject(error);
                        if (playerDiv.parentNode) {
                          playerDiv.parentNode.removeChild(playerDiv);
                        }
                      }
                    },
                    onError: (error) => {
                      reject(new Error(`YouTube video yüklenemedi: ${error.data}`));
                      if (playerDiv.parentNode) {
                        playerDiv.parentNode.removeChild(playerDiv);
                      }
                    }
                  }
                });
                
                // 10 saniye içinde hazır olmazsa timeout
                setTimeout(() => {
                  reject(new Error('YouTube video bilgisi yüklenirken zaman aşımı'));
                  if (playerDiv.parentNode) {
                    playerDiv.parentNode.removeChild(playerDiv);
                  }
                }, 10000);
                
              } catch (error) {
                reject(error);
                if (playerDiv.parentNode) {
                  playerDiv.parentNode.removeChild(playerDiv);
                }
              }
            }
          }, 100);
          
          // 10 saniye içinde API yüklenmezse hata verelim
          setTimeout(() => {
            clearInterval(checkYT);
            reject(new Error('YouTube API yüklenemedi'));
          }, 10000);
        });
      };
      
      // API'yi çağıralım ve verileri alalım
      const data = await getYouTubeData();
      
      // Videoları güncelle
      const updatedVideos = [...videos];
      updatedVideos[index].duration = data.duration || 0;
      updatedVideos[index].error = null;
      
      // Süresi uzun videoların formatını oluştur (ekstra bilgi olarak ekle)
      if (data.duration > 0) {
        updatedVideos[index].formattedDuration = formatDuration(data.duration);
        console.log(`Video duration: ${updatedVideos[index].formattedDuration}`);
      }
      
      // Eğer başlık boşsa ve API'den bir başlık geldiyse onu kullan
      if (!updatedVideos[index].title && data.title) {
        updatedVideos[index].title = data.title;
      }
      
      // Yükleme durumunu kaldır
      updatedVideos[index].loadingDuration = false;
      
      setVideos(updatedVideos);
    } catch (error) {
      console.error('Video süresi alma hatası:', error);
      
      // Hatayı göster ve yükleme durumunu kaldır
      const updatedVideos = [...videos];
      updatedVideos[index].loadingDuration = false;
      updatedVideos[index].error = error.message || 'Video süresi alınamadı';
      setVideos(updatedVideos);
    }
  };

  const removeVideoField = (index) => {
    if (videos.length <= 1) return;
    
    const updatedVideos = [...videos];
    updatedVideos.splice(index, 1);
    
    // Update orderInCourse for remaining videos
    updatedVideos.forEach((video, idx) => {
      video.orderInCourse = idx + 1;
    });
    
    setVideos(updatedVideos);
  };

  const validateVideos = () => {
    const invalidVideos = [];
    
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const errors = [];
      
      if (!video.title.trim()) {
        errors.push('Title is required');
      }
      
      if (!video.youtubeVideoId.trim()) {
        errors.push('YouTube Video ID is required');
      } else {
        // Validate YouTube ID format (typically 11 characters, alphanumeric with some special chars)
        const isValidID = /^[a-zA-Z0-9_-]{6,15}$/.test(video.youtubeVideoId);
        if (!isValidID) {
          errors.push('Invalid YouTube Video ID format. Please enter just the ID, not the full URL.');
        }
      }
      
      if (errors.length > 0) {
        invalidVideos.push({ index: i, title: video.title || `Video ${i+1}`, errors });
      }
    }
    
    return invalidVideos;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate videos have required fields with the new validation function
      const invalidVideos = validateVideos();
      if (invalidVideos.length > 0) {
        const errorMessages = invalidVideos.map(v => 
          `${v.title}: ${v.errors.join(', ')}`
        ).join('\n');
        
        alert(`Please fix the following issues before submitting:\n\n${errorMessages}`);
        setLoading(false);
        return;
      }
      
      // Create course
      console.log("Sending course creation request with data:", formData);
      const courseResponse = await fetch('/api/admin/courses/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      // Get the full response text first before trying to parse as JSON (for better error handling)
      const courseResponseText = await courseResponse.text();
      console.log("Raw course creation response:", courseResponseText);
      
      // Try to parse the response
      let courseData;
      try {
        courseData = JSON.parse(courseResponseText);
      } catch (parseError) {
        console.error("Error parsing course creation response:", parseError);
        throw new Error(`Failed to parse course creation response: ${courseResponseText.substring(0, 100)}...`);
      }
      
      if (!courseResponse.ok) {
        console.error('Course creation error:', courseData);
        throw new Error(`Failed to create course: ${courseData.error || 'Unknown error'}`);
      }
      
      console.log("Course creation response:", courseData);
      
      // Ensure courseId exists and is a number - check both courseId and course_id (backend might send either)
      const courseId = courseData.courseId || courseData.course_id;
      if (!courseId) {
        throw new Error(`Course was created but no courseId was returned. Cannot create videos.`);
      }
      
      const parsedCourseId = Number(courseId);
      if (isNaN(parsedCourseId)) {
        throw new Error(`Invalid course ID format: ${courseId}`);
      }
      
      console.log(`Course created successfully with ID: ${parsedCourseId}. Now adding ${videos.length} videos...`);
      
      // Add videos one by one instead of using Promise.all to avoid race conditions
      let successCount = 0;
      let errors = [];
      
      for (let index = 0; index < videos.length; index++) {
        const video = videos[index];
        try {
          // Make sure we have the correct field names
          const videoData = {
            course_id: parsedCourseId, // Use proper field name expected by backend
            title: video.title,
            description: video.description || '',
            youtube_video_id: video.youtubeVideoId, // Use proper field name expected by backend
            duration: parseInt(video.duration) || 0,
            order_in_course: index + 1 // Use proper field name expected by backend
          };
          
          console.log(`Creating video ${index + 1}/${videos.length}:`, videoData);
          
          const response = await fetch('/api/admin/courses/videos/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(videoData),
          });
          
          const responseText = await response.text();
          console.log(`Response for video ${index + 1}:`, response.status, responseText);
          
          if (!response.ok) {
            let errorData;
            try {
              errorData = JSON.parse(responseText);
            } catch (e) {
              errorData = { error: responseText || 'Unknown error' };
            }
            console.error(`Video creation error for "${video.title}":`, errorData);
            errors.push(`${video.title}: ${errorData.error || 'Unknown error'}`);
          } else {
            let result;
            try {
              result = JSON.parse(responseText);
            } catch (e) {
              result = { message: 'Success (no parseable response)' };
            }
            console.log(`Video created successfully: ${video.title}`, result);
            successCount++;
          }
        } catch (videoErr) {
          console.error(`Error creating video "${video.title}":`, videoErr);
          errors.push(`${video.title}: ${videoErr.message}`);
        }
      }
      
      if (errors.length === 0) {
        console.log('All videos created successfully!');
        alert('Course created successfully with all videos!');
      } else {
        console.error('Some videos failed:', errors);
        alert(`Course created with ${successCount}/${videos.length} videos. Errors: ${errors.join(', ')}`);
      }
      
      router.push('/admin/content/courses');
    } catch (err) {
      console.error('Course creation error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
      }
    },
    '& .MuiInputLabel-root': {
      transition: 'all 0.3s ease-in-out',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme.palette.primary.main,
      fontWeight: 500,
    },
    '& .MuiInputBase-input': {
      padding: '14px 16px',
    }
  };

  const getInputColor = (name) => {
    const colors = {
      title: theme.palette.primary.main,
      category: theme.palette.secondary.main,
      difficulty: theme.palette.success.main,
      thumbnailUrl: theme.palette.info.main,
      description: theme.palette.primary.main
    };
    return colors[name] || theme.palette.primary.main;
  };

  // Süreyi saat:dakika:saniye formatına çeviren yardımcı fonksiyon
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  return (
    <MainLayout>
      <QuantumContainer maxWidth="lg">
        {/* Header Section */}
        <QuantumHeaderContainer>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <AutoAwesomeIcon sx={{ fontSize: '3rem' }} />
              <Box>
                <Typography variant="h3" fontWeight="800" gutterBottom>
                  Create New Course
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Design and publish an engaging learning experience
                </Typography>
              </Box>
            </Box>
            <QuantumActionButton
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/admin/content/courses')}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Back to Courses
            </QuantumActionButton>
          </Stack>
        </QuantumHeaderContainer>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Course Details Section */}
          <QuantumGlassCard variant="primary" sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={4}>
                <Box 
                  sx={{ 
                    background: QUANTUM_COLORS.gradients.primary,
                    borderRadius: '50%',
                    p: 1.5,
                  }}
                >
                  <TitleIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                </Box>
                <Typography variant="h4" fontWeight="700" sx={{ color: QUANTUM_COLORS.primary }}>
                  Course Information
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {/* Title */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.primary }}>
                    Course Title *
                  </Typography>
                  <QuantumTextField
                    fullWidth
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter an engaging course title"
                    InputProps={{
                      startAdornment: (
                        <TitleIcon sx={{ color: QUANTUM_COLORS.primary, mr: 1 }} />
                      )
                    }}
                  />
                </Grid>

                {/* Category */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.secondary }}>
                    Category *
                  </Typography>
                  <QuantumTextField
                    fullWidth
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    select
                    placeholder="Select a category"
                    InputProps={{
                      startAdornment: (
                        <CategoryIcon sx={{ color: QUANTUM_COLORS.secondary, mr: 1 }} />
                      )
                    }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </QuantumTextField>
                </Grid>

                {/* Difficulty */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.warning }}>
                    Difficulty Level *
                  </Typography>
                  <QuantumTextField
                    fullWidth
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    required
                    select
                    InputProps={{
                      startAdornment: (
                        <SignalCellularAltIcon sx={{ color: QUANTUM_COLORS.warning, mr: 1 }} />
                      )
                    }}
                  >
                    {difficulties.map((difficulty) => (
                      <MenuItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </MenuItem>
                    ))}
                  </QuantumTextField>
                </Grid>

                {/* Thumbnail URL */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.info }}>
                    Thumbnail URL
                  </Typography>
                  <QuantumTextField
                    fullWidth
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    InputProps={{
                      startAdornment: (
                        <ImageIcon sx={{ color: QUANTUM_COLORS.info, mr: 1 }} />
                      )
                    }}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: QUANTUM_COLORS.primary }}>
                    Course Description
                  </Typography>
                  <QuantumTextField
                    fullWidth
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    placeholder="Describe what students will learn in this course..."
                    InputProps={{
                      startAdornment: (
                        <DescriptionIcon sx={{ color: QUANTUM_COLORS.primary, mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </QuantumGlassCard>

          {/* Videos Section */}
          <QuantumGlassCard variant="primary" sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box 
                    sx={{ 
                      background: QUANTUM_COLORS.gradients.secondary,
                      borderRadius: '50%',
                      p: 1.5,
                    }}
                  >
                    <PlayCircleIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="700" sx={{ color: QUANTUM_COLORS.secondary }}>
                      Course Videos
                    </Typography>
                    <Typography variant="body1" sx={{ color: alpha(QUANTUM_COLORS.secondary, 0.7) }}>
                      Add YouTube videos to your course
                    </Typography>
                  </Box>
                </Box>
                <QuantumActionButton
                  variant="secondary"
                  startIcon={<AddIcon />}
                  onClick={addVideoField}
                  glow
                >
                  Add Video
                </QuantumActionButton>
              </Box>

              <Stack spacing={3}>
                {videos.map((video, index) => (
                  <QuantumGlassCard key={index} sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                      <Typography variant="h6" sx={{ color: QUANTUM_COLORS.accent }}>
                        Video {index + 1}
                      </Typography>
                      {videos.length > 1 && (
                        <Tooltip title="Remove Video">
                          <IconButton
                            onClick={() => removeVideoField(index)}
                            sx={{ 
                              color: QUANTUM_COLORS.error,
                              '&:hover': {
                                background: alpha(QUANTUM_COLORS.error, 0.1)
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <Grid container spacing={3}>
                      {/* Video Title */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom sx={{ color: QUANTUM_COLORS.primary }}>
                          Video Title *
                        </Typography>
                        <QuantumTextField
                          fullWidth
                          value={video.title}
                          onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                          required
                          placeholder="Enter video title"
                          InputProps={{
                            startAdornment: (
                              <TitleIcon sx={{ color: QUANTUM_COLORS.primary, mr: 1 }} />
                            )
                          }}
                        />
                      </Grid>

                      {/* YouTube Video ID */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom sx={{ color: QUANTUM_COLORS.error }}>
                          YouTube Video ID *
                        </Typography>
                        <QuantumTextField
                          fullWidth
                          value={video.youtubeVideoId}
                          onChange={(e) => handleVideoChange(index, 'youtubeVideoId', e.target.value)}
                          required
                          placeholder="Enter YouTube Video ID or URL"
                          error={!!video.error}
                          helperText={video.error}
                          InputProps={{
                            startAdornment: (
                              <YouTubeIcon sx={{ color: QUANTUM_COLORS.error, mr: 1 }} />
                            ),
                            endAdornment: video.loadingDuration && (
                              <CircularProgress size={20} />
                            )
                          }}
                        />
                      </Grid>

                      {/* Video Description */}
                      <Grid item xs={12} md={8}>
                        <Typography variant="subtitle1" gutterBottom sx={{ color: QUANTUM_COLORS.info }}>
                          Description
                        </Typography>
                        <QuantumTextField
                          fullWidth
                          value={video.description}
                          onChange={(e) => handleVideoChange(index, 'description', e.target.value)}
                          placeholder="Brief description of video content"
                          multiline
                          rows={2}
                          InputProps={{
                            startAdornment: (
                              <DescriptionIcon sx={{ color: QUANTUM_COLORS.info, mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                            )
                          }}
                        />
                      </Grid>

                      {/* Duration & Order */}
                      <Grid item xs={12} md={4}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ color: QUANTUM_COLORS.warning }}>
                              Duration (seconds)
                            </Typography>
                            <QuantumTextField
                              fullWidth
                              type="number"
                              value={video.duration}
                              onChange={(e) => handleVideoChange(index, 'duration', e.target.value)}
                              placeholder="Auto-filled"
                              InputProps={{
                                startAdornment: (
                                  <AccessTimeIcon sx={{ color: QUANTUM_COLORS.warning, mr: 1 }} />
                                )
                              }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ color: QUANTUM_COLORS.success }}>
                              Order
                            </Typography>
                            <QuantumTextField
                              fullWidth
                              type="number"
                              value={video.orderInCourse}
                              onChange={(e) => handleVideoChange(index, 'orderInCourse', e.target.value)}
                              InputProps={{
                                startAdornment: (
                                  <FormatListNumberedIcon sx={{ color: QUANTUM_COLORS.success, mr: 1 }} />
                                )
                              }}
                            />
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </QuantumGlassCard>
                ))}
              </Stack>
            </CardContent>
          </QuantumGlassCard>

          {/* Action Buttons */}
          <QuantumGlassCard>
            <CardContent>
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <QuantumActionButton
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => router.push('/admin/content/courses')}
                  disabled={loading}
                >
                  Cancel
                </QuantumActionButton>
                <QuantumActionButton
                  type="submit"
                  variant="primary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={loading}
                  glow
                >
                  {loading ? 'Creating Course...' : 'Create Course'}
                </QuantumActionButton>
              </Stack>
            </CardContent>
          </QuantumGlassCard>
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ 
              borderRadius: 2,
              fontWeight: 500
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </QuantumContainer>
    </MainLayout>
  );
}