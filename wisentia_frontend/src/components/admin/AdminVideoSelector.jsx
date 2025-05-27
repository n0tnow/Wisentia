import { useState, useEffect } from 'react';
import { 
  FormControl, InputLabel, Select, MenuItem, FormHelperText, 
  CircularProgress, Chip, Box, Typography 
} from '@mui/material';

export default function AdminVideoSelector({ value, onChange, error, helperText }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadVideos = async () => {
      try {
        console.log('AdminVideoSelector: Loading videos...');
        
        // Load videos directly from the videos endpoint
        const response = await fetch('/api/courses/videos');
        const videosData = await response.json();
        
        console.log('AdminVideoSelector: Videos response:', videosData);
        
        if (response.ok) {
          const videos = Array.isArray(videosData) ? videosData : [];
          console.log('AdminVideoSelector: Loaded videos count:', videos.length);
          setVideos(videos);
        } else {
          setLoadError('Failed to load videos');
          console.error('Failed to load videos:', videosData);
        }
      } catch (error) {
        setLoadError('Error loading videos');
        console.error('Error loading videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  const selectedVideo = videos.find(video => video.VideoID === value);

  const formatDuration = (duration) => {
    if (!duration) return '';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel>Select Video</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        label="Select Video"
        disabled={loading}
      >
        {loading ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Loading videos...
          </MenuItem>
        ) : videos.length === 0 ? (
          <MenuItem disabled>
            No videos available
          </MenuItem>
        ) : (
          videos.map((video) => (
            <MenuItem key={video.VideoID} value={video.VideoID}>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {video.Title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip 
                    label={video.CourseTitle} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  {video.Duration && (
                    <Chip 
                      label={formatDuration(video.Duration)} 
                      size="small" 
                      color="info" 
                      variant="outlined" 
                    />
                  )}
                  <Chip 
                    label={`Order: ${video.OrderInCourse}`} 
                    size="small" 
                    color="secondary" 
                    variant="outlined" 
                  />
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Select>
      {(error || helperText || loadError) && (
        <FormHelperText error={!!error}>
          {error || loadError || helperText}
        </FormHelperText>
      )}
      {selectedVideo && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Selected: {selectedVideo.Title} from {selectedVideo.CourseTitle}
          </Typography>
        </Box>
      )}
    </FormControl>
  );
} 