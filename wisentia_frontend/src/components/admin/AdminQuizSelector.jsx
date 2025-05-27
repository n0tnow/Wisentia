import { useState, useEffect } from 'react';
import { 
  FormControl, InputLabel, Select, MenuItem, FormHelperText, 
  CircularProgress, Chip, Box, Typography 
} from '@mui/material';

export default function AdminQuizSelector({ value, onChange, error, helperText }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        let token = '';
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('access_token');
        }

        const response = await fetch('/api/admin/quizzes', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setQuizzes(Array.isArray(data) ? data : data.quizzes || []);
        } else {
          setLoadError('Failed to load quizzes');
          console.error('Failed to load quizzes:', data);
        }
      } catch (error) {
        setLoadError('Error loading quizzes');
        console.error('Error loading quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  const selectedQuiz = quizzes.find(quiz => quiz.QuizID === value);

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel>Select Quiz</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        label="Select Quiz"
        disabled={loading}
      >
        {loading ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Loading quizzes...
          </MenuItem>
        ) : quizzes.length === 0 ? (
          <MenuItem disabled>
            No quizzes available
          </MenuItem>
        ) : (
          quizzes.map((quiz) => (
            <MenuItem key={quiz.QuizID} value={quiz.QuizID}>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {quiz.Title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip 
                    label={`Passing: ${quiz.PassingScore}%`} 
                    size="small" 
                    color="success" 
                    variant="outlined" 
                  />
                  {quiz.QuestionCount && (
                    <Chip 
                      label={`${quiz.QuestionCount} questions`} 
                      size="small" 
                      color="info" 
                      variant="outlined" 
                    />
                  )}
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
      {selectedQuiz && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Selected: {selectedQuiz.Title} (Passing Score: {selectedQuiz.PassingScore}%)
          </Typography>
        </Box>
      )}
    </FormControl>
  );
} 