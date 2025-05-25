import { useState } from 'react';
import { 
  Box, Button, CircularProgress, Card, CardContent, Typography,
  Alert, Divider, Chip, Stack, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, DialogContentText, Tooltip
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function AIQuestSuggestor({ onSuggestionsApply, currentFormData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [open, setOpen] = useState(false);
  
  const handleOpen = () => {
    setOpen(true);
    // Clear previous suggestion and error when opening
    setError('');
    setSuggestion(null);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleGenerateSuggestion = async () => {
    setLoading(true);
    setError('');
    setSuggestion(null);
    
    try {
      let token = '';
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('access_token');
      }
      
      // Extract parameters from current form data
      const requestData = {
        difficulty: currentFormData.difficultyLevel || 'intermediate',
        category: 'Learning', // Default category
        requiredPoints: currentFormData.requiredPoints || 0,
        rewardPoints: currentFormData.rewardPoints || 50
      };
      
      const response = await fetch('/api/admin/quests/ai-suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to generate quest suggestion');
      }
      
      setSuggestion(data.quest);
    } catch (err) {
      console.error('Failed to generate quest suggestion:', err);
      setError(err.message || 'Failed to generate suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle applying the AI suggestions to the form
  const handleApplySuggestion = () => {
    if (!suggestion) return;
    
    // Map AI suggestion format to form data format
    const mappedConditions = suggestion.conditions.map(condition => {
      // Convert AI condition format to form condition format
      const conditionType = mapAIConditionType(condition.type);
      
      return {
        conditionType,
        targetId: null, // Will need to be selected by user
        targetValue: condition.points || 1,
        description: condition.description || ''
      };
    });
    
    // Create updated form data
    const updatedData = {
      title: suggestion.title,
      description: suggestion.description,
      // Keep other form fields the same
      difficultyLevel: currentFormData.difficultyLevel,
      requiredPoints: currentFormData.requiredPoints,
      rewardPoints: currentFormData.rewardPoints,
      rewardNftId: currentFormData.rewardNftId,
      isActive: currentFormData.isActive,
      // Add the new conditions
      conditions: mappedConditions
    };
    
    // Pass the updated data to parent component
    onSuggestionsApply(updatedData);
    handleClose();
  };
  
  // Helper function to map AI condition types to form condition types
  const mapAIConditionType = (aiType) => {
    const typeMap = {
      'course': 'course_completion',
      'quiz': 'quiz_score',
      'video': 'watch_videos',
      'discussion': 'start_discussion',
      'points': 'total_points',
      'complete': 'course_completion',
      'score': 'quiz_score',
      'watch': 'watch_videos',
      'take_quiz': 'take_quiz'
    };
    
    return typeMap[aiType] || 'course_completion';
  };
  
  return (
    <>
      <Tooltip title="Use AI to generate quest suggestions">
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<AutoAwesomeIcon />}
          onClick={handleOpen}
          sx={{ ml: 1 }}
        >
          AI Suggest
        </Button>
      </Tooltip>
      
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LightbulbIcon color="warning" />
            <Typography variant="h6">AI Quest Suggestions</Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText paragraph>
            Our AI can suggest quest ideas based on your current settings. You can then edit and customize them.
          </DialogContentText>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {!suggestion && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HelpOutlineIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Click "Generate Suggestion" to get AI-powered quest ideas
              </Typography>
            </Box>
          )}
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          )}
          
          {suggestion && (
            <Card sx={{ mt: 2, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {suggestion.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {suggestion.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Suggested Conditions:
                </Typography>
                
                {suggestion.conditions.map((condition, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Chip 
                      label={condition.type || 'condition'} 
                      size="small" 
                      color="primary" 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                    <Typography variant="body2">
                      {condition.name || condition.description}
                      {condition.points && ` (${condition.points} points)`}
                    </Typography>
                  </Box>
                ))}
                
                {suggestion.estimated_completion_time && (
                  <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                    Estimated completion time: {suggestion.estimated_completion_time} minutes
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          
          <Button 
            onClick={handleGenerateSuggestion}
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
            disabled={loading}
          >
            {loading ? 'Generating...' : suggestion ? 'Regenerate' : 'Generate Suggestion'}
          </Button>
          
          {suggestion && (
            <Button
              onClick={handleApplySuggestion}
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              disabled={loading}
            >
              Apply Suggestion
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
} 