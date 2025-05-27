import { useState, useEffect } from 'react';
import { 
  FormControl, InputLabel, Select, MenuItem, FormHelperText, 
  CircularProgress, Chip, Box, Typography 
} from '@mui/material';

export default function AdminTopicSelector({ value, onChange, error, helperText }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadTopics = async () => {
      try {
        // For now, we'll create some default topics since we don't have a topics API yet
        // In the future, this should load from a real API endpoint
        const defaultTopics = [
          { id: 1, title: 'General Programming Discussion', category: 'Programming' },
          { id: 2, title: 'Web Development Best Practices', category: 'Web Development' },
          { id: 3, title: 'Data Science Techniques', category: 'Data Science' },
          { id: 4, title: 'Mobile App Development', category: 'Mobile Development' },
          { id: 5, title: 'DevOps and Deployment', category: 'DevOps' },
          { id: 6, title: 'UI/UX Design Principles', category: 'Design' },
          { id: 7, title: 'Business Strategy', category: 'Business' },
          { id: 8, title: 'Learning and Study Tips', category: 'General Learning' }
        ];
        
        setTopics(defaultTopics);
      } catch (error) {
        setLoadError('Error loading topics');
        console.error('Error loading topics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, []);

  const selectedTopic = topics.find(topic => topic.id === value);

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel>Select Discussion Topic</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        label="Select Discussion Topic"
        disabled={loading}
      >
        {loading ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Loading topics...
          </MenuItem>
        ) : topics.length === 0 ? (
          <MenuItem disabled>
            No topics available
          </MenuItem>
        ) : (
          topics.map((topic) => (
            <MenuItem key={topic.id} value={topic.id}>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {topic.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip 
                    label={topic.category} 
                    size="small" 
                    color="primary" 
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
      {selectedTopic && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Selected: {selectedTopic.title} ({selectedTopic.category})
          </Typography>
        </Box>
      )}
    </FormControl>
  );
} 