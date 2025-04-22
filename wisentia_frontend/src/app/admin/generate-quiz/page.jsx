"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

// MUI components
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Grid,
  useTheme,
  Chip,
  Fade,
  Zoom,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  alpha,
  Backdrop,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  FormControlLabel,
  Tooltip
} from '@mui/material';

// MUI icons
import {
  School as SchoolIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  VideoLibrary as VideoIcon,
  QuestionAnswer as QuestionIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Star as StarIcon,
  HelpOutline as HelpIcon,
  Quiz as QuizIcon,
  YouTube as YouTubeIcon
} from '@mui/icons-material';

export default function GenerateQuizPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  // State for form
  const [videoId, setVideoId] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoContent, setVideoContent] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('intermediate');
  
  // State for request
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // Difficulties
  const difficulties = [
    { value: 'beginner', label: 'Beginner', color: 'success' },
    { value: 'intermediate', label: 'Intermediate', color: 'warning' },
    { value: 'advanced', label: 'Advanced', color: 'error' }
  ];

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  // Handle generating quiz
  const handleGenerateQuiz = async () => {
    // Validate form
    if (!videoId.trim()) {
      setError('Video ID is required');
      return;
    }
    
    if (!videoTitle.trim()) {
      setError('Video title is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          videoTitle,
          videoContent,
          numQuestions,
          difficulty
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }
      
      setGeneratedQuiz(data.quiz);
      setActiveStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle saving quiz
  const handleSaveQuiz = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/approve-quiz/${generatedQuiz.contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          passingScore: generatedQuiz.passing_score
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save quiz');
      }
      
      setActiveStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Steps for the quiz generation process
  const steps = [
    'Configure Quiz Parameters',
    'Review Generated Quiz',
    'Quiz Saved'
  ];
  
  // Get difficulty chip color
  const getDifficultyColor = (difficultyValue) => {
    const found = difficulties.find(d => d.value === difficultyValue);
    return found ? found.color : 'default';
  };
  
  const getDifficultyLabel = (difficultyValue) => {
    const found = difficulties.find(d => d.value === difficultyValue);
    return found ? found.label : difficultyValue;
  };
  
  // Parse YouTube URL to get video ID
  const handleYouTubeUrlChange = (e) => {
    const url = e.target.value;
    try {
      // Try to extract the video ID from different YouTube URL formats
      let extractedId = '';
      
      if (url.includes('youtube.com/watch?v=')) {
        // Format: https://www.youtube.com/watch?v=VIDEO_ID
        const urlObj = new URL(url);
        extractedId = urlObj.searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        // Format: https://youtu.be/VIDEO_ID
        const parts = url.split('youtu.be/');
        if (parts.length > 1) {
          extractedId = parts[1].split('?')[0].split('&')[0];
        }
      } else if (url.includes('youtube.com/embed/')) {
        // Format: https://www.youtube.com/embed/VIDEO_ID
        const parts = url.split('youtube.com/embed/');
        if (parts.length > 1) {
          extractedId = parts[1].split('?')[0].split('&')[0];
        }
      } else {
        // Maybe the user entered just the video ID directly
        extractedId = url.trim();
      }
      
      if (extractedId) {
        setVideoId(extractedId);
      }
    } catch (error) {
      // If URL parsing fails, assume the user is just typing the video ID directly
      setVideoId(url.trim());
    }
  };

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        {/* Page Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          mb: 4
        }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                onClick={() => router.push('/admin/content/courses')}
                sx={{ mr: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
              >
                <BackIcon />
              </IconButton>
              <Fade in={true} timeout={800}>
                <Typography 
                  variant="h4" 
                  component="h1"
                  fontWeight="700"
                  sx={{ 
                    fontSize: { xs: '1.7rem', sm: '2rem', md: '2.125rem' },
                    background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  AI Quiz Generator
                </Typography>
              </Fade>
            </Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              Create engaging quizzes based on educational videos with artificial intelligence
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-root .Mui-completed': {
              color: 'primary.main', 
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: 'primary.main', 
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {/* Step 1: Configure */}
        {activeStep === 0 && (
          <Paper
            elevation={3}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Box 
              sx={{ 
                p: 3, 
                background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <QuizIcon sx={{ fontSize: 32, mr: 2 }} />
              <Typography variant="h5" fontWeight="bold">
                Quiz Configuration
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <YouTubeIcon sx={{ color: 'error.main', mr: 1 }} />
                    <Typography variant="h6">
                      YouTube Video Details
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ ml: 4 }}>
                    Enter details about the video for which you want to generate a quiz.
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="youtube-url"
                    label="YouTube Video URL or ID"
                    variant="outlined"
                    onChange={handleYouTubeUrlChange}
                    InputProps={{
                      startAdornment: (
                        <VideoIcon sx={{ mr: 1, color: 'action.active' }} />
                      ),
                      endAdornment: (
                        <Tooltip title="Enter full YouTube URL or just the video ID">
                          <HelpIcon color="action" />
                        </Tooltip>
                      ),
                    }}
                    helperText="Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ or just dQw4w9WgXcQ"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="video-id"
                    label="Video ID"
                    variant="outlined"
                    value={videoId}
                    onChange={(e) => setVideoId(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <VideoIcon sx={{ mr: 1, color: 'action.active' }} />
                      ),
                    }}
                    helperText="This will be auto-filled when you enter a YouTube URL above"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="video-title"
                    label="Video Title"
                    variant="outlined"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <SchoolIcon sx={{ mr: 1, color: 'action.active' }} />
                      ),
                    }}
                    helperText="Enter the title of the video"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="video-content"
                    label="Video Content Summary (Optional)"
                    variant="outlined"
                    value={videoContent}
                    onChange={(e) => setVideoContent(e.target.value)}
                    multiline
                    rows={4}
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ mt: 1.5, mr: 1 }}>
                          <QuestionIcon color="action" />
                        </Box>
                      ),
                    }}
                    helperText="Provide a summary of the video content to improve quiz quality"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <QuizIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6">
                      Quiz Settings
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="difficulty-select-label">Difficulty Level</InputLabel>
                    <Select
                      labelId="difficulty-select-label"
                      id="difficulty-select"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      label="Difficulty Level"
                      startAdornment={<StarIcon sx={{ mr: 1, color: 'action.active' }} />}
                    >
                      {difficulties.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip 
                              label={option.label} 
                              size="small" 
                              color={option.color} 
                              sx={{ mr: 1 }} 
                            />
                            <Typography variant="body2">
                              {option.value === 'beginner' ? '(Basic understanding)' : 
                               option.value === 'intermediate' ? '(Moderate complexity)' : 
                               '(Deep comprehension)'}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      id="num-questions"
                      label="Number of Questions"
                      type="number"
                      variant="outlined"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Math.max(1, Math.min(10, Number(e.target.value))))}
                      InputProps={{
                        startAdornment: (
                          <QuestionIcon sx={{ mr: 1, color: 'action.active' }} />
                        ),
                        inputProps: { min: 1, max: 10 }
                      }}
                      helperText="Choose between 1-10 questions"
                    />
                    <IconButton 
                      color="primary" 
                      onClick={() => setNumQuestions(prev => Math.min(10, prev + 1))}
                      sx={{ ml: 1 }}
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton 
                      color="primary" 
                      onClick={() => setNumQuestions(prev => Math.max(1, prev - 1))}
                      sx={{ ml: 0.5 }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleGenerateQuiz}
                  disabled={loading || !videoId.trim() || !videoTitle.trim()}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: 3,
                    background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                  }}
                >
                  {loading ? 'Generating...' : 'Generate Quiz'}
                </Button>
              </Box>
            </CardContent>
          </Paper>
        )}

        {/* Step 2: Review */}
        {activeStep === 1 && generatedQuiz && (
          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 3, 
                      background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <QuizIcon sx={{ fontSize: 32, mr: 2 }} />
                    <Typography variant="h5" fontWeight="bold">
                      Generated Quiz
                    </Typography>
                  </Box>
                  
                  <CardContent sx={{ p: 3, pt: 4, flexGrow: 1, overflow: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <VideoIcon sx={{ color: 'error.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Video ID: {videoId}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h4" gutterBottom fontWeight="500">
                      {generatedQuiz.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      <Chip 
                        label={getDifficultyLabel(difficulty)} 
                        color={getDifficultyColor(difficulty)} 
                        size="small" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`${generatedQuiz.questions.length} Questions`} 
                        color="primary" 
                        size="small" 
                        variant="outlined"
                      />
                      <Chip 
                        icon={<CheckIcon />}
                        label={`Passing: ${generatedQuiz.passing_score}%`} 
                        color="success" 
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                      {generatedQuiz.description}
                    </Typography>
                    
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: 'primary.main',
                        mb: 2
                      }}
                    >
                      <QuestionIcon sx={{ mr: 1 }} />
                      Quiz Questions
                    </Typography>
                    
                    <Box sx={{ mb: 4 }}>
                      {generatedQuiz.questions.map((question, qIndex) => (
                        <Accordion 
                          key={qIndex} 
                          sx={{ 
                            mb: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            '&:before': { display: 'none' },
                            borderRadius: '8px !important',
                            overflow: 'hidden'
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ 
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08)
                              }
                            }}
                          >
                            <Typography sx={{ fontWeight: 500 }}>
                              Question {qIndex + 1}: {question.question_text.substring(0, 60)}
                              {question.question_text.length > 60 ? '...' : ''}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 3 }}>
                            <Typography variant="body1" paragraph>
                              {question.question_text}
                            </Typography>
                            
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                              Options:
                            </Typography>
                            
                            <RadioGroup>
                              {question.options.map((option, oIndex) => (
                                <FormControlLabel
                                  key={oIndex}
                                  value={String(oIndex)}
                                  control={<Radio color="primary" checked={option.is_correct} />}
                                  label={
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center',
                                    }}>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          fontWeight: option.is_correct ? 600 : 400,
                                          color: option.is_correct ? 'success.main' : 'text.primary'
                                        }}
                                      >
                                        {option.text}
                                      </Typography>
                                      {option.is_correct && (
                                        <Chip 
                                          label="Correct" 
                                          size="small" 
                                          color="success" 
                                          sx={{ ml: 1 }}
                                        />
                                      )}
                                    </Box>
                                  }
                                  sx={{ 
                                    py: 0.5, 
                                    px: 1, 
                                    my: 0.5,
                                    borderRadius: 1,
                                    width: '100%',
                                    bgcolor: option.is_correct ? alpha(theme.palette.success.main, 0.1) : 'transparent',
                                  }}
                                />
                              ))}
                            </RadioGroup>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  </CardContent>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'background.default',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Options & Actions
                    </Typography>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Alert 
                      severity="info" 
                      variant="outlined"
                      sx={{ mb: 3 }}
                    >
                      <Typography variant="body2">
                        Review the generated quiz. If satisfied, save it to your course. You can also regenerate with different parameters.
                      </Typography>
                    </Alert>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleSaveQuiz}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                        sx={{ 
                          py: 1.5,
                          borderRadius: 2,
                          boxShadow: 3,
                          background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                        }}
                      >
                        {loading ? 'Saving...' : 'Save Quiz'}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        onClick={() => setActiveStep(0)}
                        disabled={loading}
                        startIcon={<EditIcon />}
                        sx={{ py: 1.5, borderRadius: 2 }}
                      >
                        Modify Parameters
                      </Button>
                      
                      <Button
                        variant="text"
                        color="error"
                        onClick={() => router.push('/admin/content/courses')}
                        disabled={loading}
                        sx={{ mt: 1 }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </CardContent>
                </Paper>
                
                {/* YouTube Video Preview */}
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    mt: 3
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'background.default',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <YouTubeIcon sx={{ color: 'error.main', mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Video Preview
                    </Typography>
                  </Box>
                  
                  <CardContent sx={{ p: 0 }}>
                    <Box 
                      component="iframe"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      sx={{
                        width: '100%',
                        height: '250px',
                        border: 'none'
                      }}
                      allowFullScreen
                    />
                  </CardContent>
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        )}

        {/* Step 3: Success */}
        {activeStep === 2 && (
          <Zoom in={true}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                textAlign: 'center',
                p: 4,
                bgcolor: alpha(theme.palette.success.light, 0.05),
                border: '1px solid',
                borderColor: alpha(theme.palette.success.main, 0.2),
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}
            >
              <Box sx={{ mb: 3 }}>
                <CheckIcon 
                  sx={{ 
                    fontSize: 64, 
                    color: 'success.main',
                    p: 1,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.success.main, 0.1)
                  }} 
                />
              </Box>
              
              <Typography variant="h4" gutterBottom fontWeight="bold" color="success.main">
                Quiz Successfully Created!
              </Typography>
              
              <Typography variant="body1" paragraph color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                The quiz has been saved and is now associated with your video. 
                Students can now take this quiz after watching the educational content.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => router.push('/admin/content/courses')}
                  sx={{ 
                    px: 3, 
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: 3,
                    background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                  }}
                >
                  Go to Courses
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => {
                    setActiveStep(0);
                    setGeneratedQuiz(null);
                    setVideoId('');
                    setVideoTitle('');
                    setVideoContent('');
                  }}
                  sx={{ px: 3, py: 1.5, borderRadius: 2 }}
                >
                  Create Another Quiz
                </Button>
              </Box>
            </Paper>
          </Zoom>
        )}
        
        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </MainLayout>
  );
}