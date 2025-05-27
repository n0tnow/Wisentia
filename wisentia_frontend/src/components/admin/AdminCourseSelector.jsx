import { useState, useEffect } from 'react';
import { 
  FormControl, InputLabel, Select, MenuItem, FormHelperText, 
  CircularProgress, Chip, Box, Typography 
} from '@mui/material';

export default function AdminCourseSelector({ value, onChange, error, helperText }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        
        if (response.ok) {
          setCourses(Array.isArray(data) ? data : data.courses || []);
        } else {
          setLoadError('Failed to load courses');
          console.error('Failed to load courses:', data);
        }
      } catch (error) {
        setLoadError('Error loading courses');
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const selectedCourse = courses.find(course => course.CourseID === value);

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel>Select Course</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        label="Select Course"
        disabled={loading}
      >
        {loading ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Loading courses...
          </MenuItem>
        ) : courses.length === 0 ? (
          <MenuItem disabled>
            No courses available
          </MenuItem>
        ) : (
          courses.map((course) => (
            <MenuItem key={course.CourseID} value={course.CourseID}>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {course.Title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip 
                    label={course.Category} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={course.Difficulty} 
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
      {selectedCourse && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Selected: {selectedCourse.Title} ({selectedCourse.Category})
          </Typography>
        </Box>
      )}
    </FormControl>
  );
} 