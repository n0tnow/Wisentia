// src/app/admin/content/courses/create/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, Typography, Button, TextField, MenuItem, 
  Box, Paper, Grid, IconButton, Divider, Card, CardContent,
  useTheme, alpha, CircularProgress
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
  const { user } = useAuth();
  const router = useRouter();

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
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2 
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="700" 
            color="primary"
            sx={{ 
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                width: '40%',
                height: '4px',
                bottom: '-8px',
                left: 0,
                backgroundColor: theme.palette.primary.main,
                borderRadius: '2px'
              }
            }}
          >
            Create New Course
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin/content/courses')} // Düzeltilmiş yönlendirme adresi
            sx={{ 
              borderRadius: '8px',
              px: 2,
              height: '40px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateX(-5px)',
                boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.2)}`
              }
            }}
          >
            Back to Courses
          </Button>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {/* Course Details */}
          <Paper 
  elevation={3} 
  sx={{ 
    mb: 5, 
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : alpha('#f9f9f9', 0.8),
    backdropFilter: 'blur(10px)'
  }}
>
  <Box sx={{ p: 3 }}>
    <Typography 
      variant="h5" 
      sx={{ 
        fontWeight: 600, 
        color: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 3
      }}
    >
      <Box 
        sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          borderRadius: '50%',
          p: 1,
        }}
      >
        <SaveIcon fontSize="small" color="primary" />
      </Box>
      Course Details
    </Typography>

    {/* İlk sıra: Title ve Category */}
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'row', 
      gap: 2,
      mb: 2
    }}>
      {/* Title */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TitleIcon 
            sx={{ 
              color: getInputColor('title'),
              mr: 1
            }} 
            fontSize="small" 
          />
          <Typography 
            variant="body2" 
            fontWeight={500} 
            color={getInputColor('title')}
          >
            Title*
          </Typography>
        </Box>
        <TextField
          fullWidth
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          variant="outlined"
          placeholder="Enter the title of your course"
          InputProps={{
            sx: { 
              backgroundColor: alpha(getInputColor('title'), 0.03),
              borderColor: alpha(getInputColor('title'), 0.2),
            }
          }}
          sx={{
            ...inputStyle,
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: getInputColor('title'),
            }
          }}
        />
      </Box>

      {/* Category */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CategoryIcon 
            sx={{ 
              color: getInputColor('category'),
              mr: 1
            }} 
            fontSize="small" 
          />
          <Typography 
            variant="body2" 
            fontWeight={500} 
            color={getInputColor('category')}
          >
            Category*
          </Typography>
        </Box>
        <TextField
          fullWidth
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
          variant="outlined"
          placeholder="E.g. Programming, Design, Marketing"
          InputProps={{
            sx: { 
              backgroundColor: alpha(getInputColor('category'), 0.03),
              borderColor: alpha(getInputColor('category'), 0.2),
            }
          }}
          sx={{
            ...inputStyle,
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: getInputColor('category'),
            }
          }}
        />
      </Box>
    </Box>

    {/* İkinci sıra: Difficulty ve Thumbnail URL */}
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'row', 
      gap: 2,
      mb: 2
    }}>
      {/* Difficulty */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SignalCellularAltIcon 
            sx={{ 
              color: getInputColor('difficulty'),
              mr: 1
            }} 
            fontSize="small" 
          />
          <Typography 
            variant="body2" 
            fontWeight={500} 
            color={getInputColor('difficulty')}
          >
            Difficulty*
          </Typography>
        </Box>
        <TextField
          select
          fullWidth
          name="difficulty"
          value={formData.difficulty}
          onChange={handleInputChange}
          required
          variant="outlined"
          InputProps={{
            sx: { 
              backgroundColor: alpha(getInputColor('difficulty'), 0.03),
              borderColor: alpha(getInputColor('difficulty'), 0.2),
            }
          }}
          sx={{
            ...inputStyle,
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: getInputColor('difficulty'),
            }
          }}
        >
          <MenuItem value="beginner">Beginner</MenuItem>
          <MenuItem value="intermediate">Intermediate</MenuItem>
          <MenuItem value="advanced">Advanced</MenuItem>
        </TextField>
      </Box>

      {/* Thumbnail URL */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ImageIcon 
            sx={{ 
              color: getInputColor('thumbnailUrl'),
              mr: 1
            }} 
            fontSize="small" 
          />
          <Typography 
            variant="body2" 
            fontWeight={500} 
            color={getInputColor('thumbnailUrl')}
          >
            Thumbnail URL
          </Typography>
        </Box>
        <TextField
          fullWidth
          name="thumbnailUrl"
          value={formData.thumbnailUrl}
          onChange={handleInputChange}
          placeholder="https://example.com/image.jpg"
          variant="outlined"
          InputProps={{
            sx: { 
              backgroundColor: alpha(getInputColor('thumbnailUrl'), 0.03),
              borderColor: alpha(getInputColor('thumbnailUrl'), 0.2),
            }
          }}
          sx={{
            ...inputStyle,
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: getInputColor('thumbnailUrl'),
            }
          }}
        />
      </Box>
    </Box>

    {/* Description - Tam genişlikte */}
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <DescriptionIcon 
          sx={{ 
            color: getInputColor('description'),
            mr: 1
          }} 
          fontSize="small" 
        />
        <Typography 
          variant="body2" 
          fontWeight={500} 
          color={getInputColor('description')}
        >
          Description*
        </Typography>
      </Box>
      <TextField
        fullWidth
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        required
        multiline
        rows={6}
        variant="outlined"
        placeholder="Provide a detailed description of what students will learn"
        InputProps={{
          sx: { 
            backgroundColor: alpha(getInputColor('description'), 0.03),
            borderColor: alpha(getInputColor('description'), 0.2),
          }
        }}
        sx={{
          ...inputStyle,
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: getInputColor('description'),
          }
        }}
      />
    </Box>
  </Box>
</Paper>
          
          {/* Course Videos */}
<Paper 
  elevation={3} 
  sx={{ 
    mb: 5,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : alpha('#f9f9f9', 0.8),
    backdropFilter: 'blur(10px)'
  }}
>
  <Box sx={{ 
    p: 3, 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  }}>
    <Typography 
      variant="h5" 
      sx={{ 
        fontWeight: 600, 
        color: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
    >
      <Box 
        sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.error.main, 0.1),
          borderRadius: '50%',
          p: 1,
        }}
      >
        <YouTubeIcon fontSize="small" color="error" />
      </Box>
      Course Videos
    </Typography>
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={addVideoField}
      sx={{ 
        borderRadius: '30px',
        px: 3,
        py: 1,
        fontWeight: 500,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        backgroundColor: '#4e54c8',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          backgroundColor: '#3f45b6',
        }
      }}
    >
      ADD VIDEO
    </Button>
  </Box>
  
  {videos.map((video, index) => (
    <Box 
      key={index} 
      sx={{ 
        px: 3,
        py: 3,
        mb: index < videos.length - 1 ? 0 : 0,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <YouTubeIcon color="error" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="600" color="error">
            Video {index + 1}
          </Typography>
        </Box>
        {videos.length > 1 && (
          <IconButton 
            color="error" 
            onClick={() => removeVideoField(index)}
            sx={{ 
              backgroundColor: 'rgba(211, 47, 47, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.15)',
                transform: 'rotate(90deg)',
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
      
      {/* İlk sıra: Video Title ve YouTube Video ID */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'row', 
        gap: 2,
        mb: 2
      }}>
        {/* Video Title */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TitleIcon 
              sx={{ 
                color: theme.palette.error.main,
                mr: 1
              }} 
              fontSize="small" 
            />
            <Typography 
              variant="body2" 
              fontWeight={500} 
              color={theme.palette.error.main}
            >
              Video Title*
            </Typography>
          </Box>
          <TextField
            fullWidth
            value={video.title}
            onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
            required
            variant="outlined"
            placeholder="Enter a descriptive title for this video"
            InputProps={{
              sx: { 
                backgroundColor: alpha(theme.palette.error.main, 0.03),
                borderColor: alpha(theme.palette.error.main, 0.2),
              }
            }}
            sx={{
              ...inputStyle,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.error.main,
              }
            }}
          />
        </Box>

        {/* YouTube Video ID */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <YouTubeIcon 
              sx={{ 
                color: theme.palette.error.main,
                mr: 1
              }} 
              fontSize="small" 
            />
            <Typography 
              variant="body2" 
              fontWeight={500} 
              color={theme.palette.error.main}
            >
              YouTube Video ID*
            </Typography>
          </Box>
          <TextField
            fullWidth
            value={video.youtubeVideoId}
            onChange={(e) => handleVideoChange(index, 'youtubeVideoId', e.target.value)}
            placeholder="dQw4w9WgXcQ"
            required
            variant="outlined"
            error={Boolean(video.error)}
            helperText={video.error || "Enter the YouTube ID only (e.g., dQw4w9WgXcQ). Full URLs like https://youtube.com/watch?v=dQw4w9WgXcQ will be automatically extracted."}
            InputProps={{
              sx: { 
                backgroundColor: alpha(theme.palette.error.main, 0.03),
                borderColor: alpha(theme.palette.error.main, 0.2),
              }
            }}
            sx={{
              ...inputStyle,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.error.main,
              }
            }}
          />
        </Box>
      </Box>

      {/* İkinci sıra: Duration ve Order in Course */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'row', 
        gap: 2,
        mb: 2
      }}>
        {/* Duration */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon 
              sx={{ 
                color: theme.palette.error.main,
                mr: 1
              }} 
              fontSize="small" 
            />
            <Typography 
              variant="body2" 
              fontWeight={500} 
              color={theme.palette.error.main}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              Duration (seconds)
              {video.loadingDuration && (
                <CircularProgress size={16} sx={{ ml: 1 }} color="primary" />
              )}
            </Typography>
          </Box>
          <TextField
            fullWidth
            type="number"
            value={video.duration}
            onChange={(e) => handleVideoChange(index, 'duration', e.target.value)}
            placeholder="300"
            variant="outlined"
            error={Boolean(video.error)}
            helperText={
              video.loadingDuration 
                ? "Fetching duration from YouTube..." 
                : video.error 
                  ? video.error 
                  : `Video duration: ${formatDuration(video.duration)}`
            }
            InputProps={{
              sx: { 
                backgroundColor: alpha(theme.palette.error.main, 0.03),
                borderColor: alpha(theme.palette.error.main, 0.2),
              },
              readOnly: video.loadingDuration // Yükleme esnasında düzenlemeyi devre dışı bırak
            }}
            sx={{
              ...inputStyle,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.error.main,
              }
            }}
          />
        </Box>

        {/* Order in Course */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FormatListNumberedIcon 
              sx={{ 
                color: theme.palette.error.main,
                mr: 1
              }} 
              fontSize="small" 
            />
            <Typography 
              variant="body2" 
              fontWeight={500} 
              color={theme.palette.error.main}
            >
              Order in Course
            </Typography>
          </Box>
          <TextField
            fullWidth
            type="number"
            value={video.orderInCourse}
            InputProps={{
              readOnly: true,
              sx: { 
                backgroundColor: alpha(theme.palette.error.main, 0.03),
                borderColor: alpha(theme.palette.error.main, 0.2),
              }
            }}
            variant="outlined"
            helperText="Position of this video in the course sequence"
            sx={{
              ...inputStyle,
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.error.main,
              }
            }}
          />
        </Box>
      </Box>

      {/* Video Description */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <DescriptionIcon 
            sx={{ 
              color: theme.palette.error.main,
              mr: 1
            }} 
            fontSize="small" 
          />
          <Typography 
            variant="body2" 
            fontWeight={500} 
            color={theme.palette.error.main}
          >
            Video Description
          </Typography>
        </Box>
        <TextField
          fullWidth
          value={video.description}
          onChange={(e) => handleVideoChange(index, 'description', e.target.value)}
          multiline
          rows={3}
          variant="outlined"
          placeholder="Brief description of what this video covers"
          InputProps={{
            sx: { 
              backgroundColor: alpha(theme.palette.error.main, 0.03),
              borderColor: alpha(theme.palette.error.main, 0.2),
            }
          }}
          sx={{
            ...inputStyle,
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.error.main,
            }
          }}
        />
      </Box>
    </Box>
  ))}
</Paper>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              startIcon={<SaveIcon />}
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: '8px',
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                },
                '&:active': {
                  transform: 'translateY(1px)',
                }
              }}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={<CancelIcon />}
              onClick={() => router.push('/admin/content/courses')} // Düzeltilmiş yönlendirme adresi
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: '8px',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                }
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
}