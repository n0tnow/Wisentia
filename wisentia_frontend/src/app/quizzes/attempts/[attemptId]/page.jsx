"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Material UI imports
import { 
  Box, Container, Typography, Paper, Button, Card, CardContent, 
  Radio, RadioGroup, FormControlLabel, FormControl, 
  Divider, LinearProgress, CircularProgress, Grid, Stack, styled, Chip, 
  useTheme, alpha, Avatar, Tooltip, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';

// MUI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import TimerIcon from '@mui/icons-material/Timer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DescriptionIcon from '@mui/icons-material/Description';

// Custom styled components for dark theme
const DarkPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#121212',
  borderRadius: 16,
  border: '1px solid #333',
  color: '#fff',
  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
}));

const DarkCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#121212',
  borderRadius: 16,
  border: '1px solid #333',
  color: '#fff',
  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: '0 6px 25px rgba(0,0,0,0.5)',
  },
}));

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
  borderRadius: 16,
  border: '1px solid #333',
  color: '#fff',
  padding: 24,
  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
}));

const StyledChip = styled(Chip)(({ theme, color = 'primary' }) => ({
  borderRadius: 12,
  fontWeight: 500,
  background: alpha(theme.palette[color].main, 0.12),
  color: theme.palette[color].main,
  border: `1px solid ${alpha(theme.palette[color].main, 0.3)}`,
  '& .MuiChip-icon': {
    color: theme.palette[color].main,
  },
}));

const ActionButton = styled(Button)(({ theme, color = 'primary' }) => ({
  borderRadius: 12,
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: `0 4px 14px ${alpha(theme.palette[color].main, 0.4)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 6px 20px ${alpha(theme.palette[color].main, 0.6)}`,
  },
}));

const AnswerCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isCorrect' && prop !== 'isSelected'
})(({ isCorrect, isSelected, theme }) => ({
  backgroundColor: isSelected
    ? (isCorrect ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1))
    : alpha('#333', 0.4),
  borderRadius: 12,
  border: `1px solid ${
    isSelected
      ? (isCorrect ? alpha('#4caf50', 0.5) : alpha('#f44336', 0.5))
      : '#444'
  }`,
  margin: '8px 0',
  position: 'relative',
  transition: 'all 0.2s ease',
}));

export default function QuizAttemptPage() {
  const [attemptData, setAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { attemptId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    const fetchAttemptDetails = async () => {
      try {
        setLoading(true);
        let token = null;
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('access_token');
        }
        
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }
        
        console.log('Fetching attempt details for attempt ID:', attemptId);
        const response = await fetch(`/api/quizzes/attempts/${attemptId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch attempt details');
        }
        
        const data = await response.json();
        console.log('Attempt data received:', data);
        
        // INVERT THE LOGIC: Process the data to fix the IsCorrect values
        if (data.questions && data.questions.length > 0) {
          console.log('Fixing IsCorrect values by inverting the logic');
          
          // Just invert the IsCorrect values for each question to fix the display
          const processedData = {
            ...data,
            questions: data.questions.map(question => {
              // Get original IsCorrect value
              const originalIsCorrect = question.IsCorrect === 1 || 
                                       question.IsCorrect === true || 
                                       question.IsCorrect === "1" || 
                                       question.IsCorrect === "true";
              
              // Return question with inverted IsCorrect value
              return {
                ...question,
                // Invert the IsCorrect value
                IsCorrect: originalIsCorrect ? 0 : 1
              };
            })
          };
          
          setAttemptData(processedData);
        } else {
          setAttemptData(data);
        }
      } catch (err) {
        console.error('Error fetching attempt details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (attemptId) fetchAttemptDetails();
  }, [attemptId]);

  const handleGoBack = () => {
    if (attemptData?.QuizID) {
      router.push(`/quizzes/${attemptData.QuizID}`);
    } else {
      router.back();
    }
  };

  // Format date string from SQL Server
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <Box 
          sx={{ 
            minHeight: '100vh', 
            bgcolor: '#000', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white'
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3, color: '#1976d2' }} />
            <Typography variant="h6">Loading quiz results...</Typography>
          </Box>
        </Box>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <Box 
          sx={{ 
            minHeight: '100vh', 
            bgcolor: '#000', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            p: 2,
            color: 'white'
          }}
        >
          <DarkPaper sx={{ maxWidth: 500, width: '100%', p: 4, textAlign: 'center' }}>
            <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom>Error Loading Results</Typography>
            <Typography color="error" sx={{ mb: 3 }}>{error}</Typography>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => router.back()}
              sx={{ mt: 2 }}
            >
              Go Back
            </Button>
          </DarkPaper>
        </Box>
      </MainLayout>
    );
  }

  // Results not found state
  if (!attemptData) {
    return (
      <MainLayout>
        <Box 
          sx={{ 
            minHeight: '100vh', 
            bgcolor: '#000', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            p: 2,
            color: 'white'
          }}
        >
          <DarkPaper sx={{ maxWidth: 500, width: '100%', p: 4, textAlign: 'center' }}>
            <HelpOutlineIcon sx={{ fontSize: 64, mb: 2, color: '#aaa' }} />
            <Typography variant="h5" gutterBottom>Results Not Found</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              The requested quiz attempt results could not be found.
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => router.back()}
              sx={{ mt: 2 }}
            >
              Go Back
            </Button>
          </DarkPaper>
        </Box>
      </MainLayout>
    );
  }

  // Calculate percentage
  const scorePercentage = (attemptData.Score / attemptData.MaxScore) * 100;
  const passed = attemptData.Passed === 1 || attemptData.Passed === true;

  return (
    <MainLayout>
      <Box sx={{ 
        background: 'linear-gradient(135deg, #000000, #121212)',
        minHeight: '100vh', 
        pt: 4, 
        pb: 8, 
        color: 'white' 
      }}>
        <Container maxWidth="md">
          {/* Back button and title section */}
          <Box sx={{ mb: 5 }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleGoBack}
              sx={{ 
                color: '#fff', 
                mb: 3,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.05),
                }
              }}
            >
              Back to Quiz
            </Button>
            
            <GradientPaper sx={{ p: 3, mb: 4 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                <Avatar sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: alpha(passed ? '#4caf50' : '#f44336', 0.2),
                  color: passed ? '#4caf50' : '#f44336',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  {passed ? <AssignmentTurnedInIcon fontSize="large" /> : <AssignmentIcon fontSize="large" />}
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {attemptData.QuizTitle || 'Quiz Results'}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ color: alpha('#fff', 0.7), mb: 2 }}>
                    Attempt completed on {formatDate(attemptData.AttemptDate)}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <StyledChip 
                      icon={passed ? <CheckCircleIcon /> : <ErrorIcon />} 
                      label={passed ? "Passed" : "Failed"}
                      color={passed ? "success" : "error"}
                    />
                    <StyledChip 
                      icon={<StarIcon />} 
                      label={`${Math.round(scorePercentage)}% Score`}
                      color="primary"
                    />
                    {attemptData.EarnedPoints > 0 && (
                      <StyledChip 
                        icon={<StarIcon />} 
                        label={`+${attemptData.EarnedPoints} Points`}
                        color="warning"
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </GradientPaper>
          </Box>

          {/* Score Summary Card */}
          <DarkCard sx={{ mb: 4, overflow: 'hidden' }}>
            <Box sx={{ 
              background: passed 
                ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.1), rgba(46, 125, 50, 0.2))' 
                : 'linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(211, 47, 47, 0.2))',
              pt: 3,
              pb: 3,
              px: 3
            }}>
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 6,
                  background: passed ? 'linear-gradient(90deg, #4caf50, #81c784)' : 'linear-gradient(90deg, #f44336, #e57373)'
                }} 
              />
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'center', md: 'center' } }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: { xs: 2, md: 0 } }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={Math.round(scorePercentage)} 
                      size={140} 
                      thickness={5}
                      sx={{ 
                        color: passed ? 'success.main' : 'error.main',
                        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
                      }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                        {Math.round(scorePercentage)}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
                        Your Score
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={7}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <TimerIcon sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Required Passing Score" 
                        secondary={`${attemptData.PassingScore}% minimum to pass`}
                        primaryTypographyProps={{ sx: { color: '#fff' } }}
                        secondaryTypographyProps={{ sx: { color: alpha('#fff', 0.7) } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <QuizIcon sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Questions" 
                        secondary={`${attemptData.questions?.length || 0} questions in this quiz`}
                        primaryTypographyProps={{ sx: { color: '#fff' } }}
                        secondaryTypographyProps={{ sx: { color: alpha('#fff', 0.7) } }}
                      />
                    </ListItem>
                    {attemptData.EarnedPoints > 0 && (
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <StarIcon sx={{ color: 'warning.main' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Reward Points" 
                          secondary={`${attemptData.EarnedPoints} points earned`}
                          primaryTypographyProps={{ sx: { color: '#fff' } }}
                          secondaryTypographyProps={{ sx: { color: alpha('#fff', 0.7) } }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>
              </Grid>
            </Box>
          </DarkCard>

          {/* Questions and Answers */}
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, mt: 5 }}>
            Question Details
          </Typography>
          
          {attemptData.questions && attemptData.questions.length > 0 ? (
            <Stack spacing={4}>
              {attemptData.questions.map((question, index) => {
                // More reliable check for correct values
                const isCorrect = question.IsCorrect === 1 || question.IsCorrect === true || 
                                  question.IsCorrect === "1" || question.IsCorrect === "true";
                const selectedOptionId = question.SelectedOptionID;
                
                console.log(`Rendering question ${index + 1}:`, { 
                  QuestionID: question.QuestionID,
                  IsCorrect: question.IsCorrect, 
                  isCorrectProcessed: isCorrect,
                  selectedOptionId 
                });
                
                return (
                  <DarkCard key={question.QuestionID} sx={{ 
                    overflow: 'hidden',
                    borderLeft: `4px solid ${isCorrect ? '#4caf50' : '#f44336'}`
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      {/* Question header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Stack direction="row" spacing={1}>
                          <StyledChip 
                            label={`Question ${index + 1}`}
                            size="small"
                            color="primary"
                          />
                          <StyledChip 
                            label={
                              question.QuestionType === 'multiple_choice' ? 'Multiple Choice' :
                              question.QuestionType === 'true_false' ? 'True/False' : 'Short Answer'
                            }
                            size="small"
                            color={
                              question.QuestionType === 'multiple_choice' ? 'primary' :
                              question.QuestionType === 'true_false' ? 'success' : 'warning'
                            }
                          />
                        </Stack>
                        <StyledChip 
                          icon={isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
                          label={isCorrect ? "Correct" : "Incorrect"}
                          color={isCorrect ? "success" : "error"}
                        />
                      </Box>
                      
                      {/* Question text */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                          {question.QuestionText}
                        </Typography>
                      </Box>
                      
                      {/* Multiple Choice or True/False */}
                      {(question.QuestionType === 'multiple_choice' || question.QuestionType === 'true_false') && (
                        <Box sx={{ mt: 2 }}>
                          {question.options && question.options.map((option) => {
                            const isSelected = selectedOptionId === option.OptionID;
                            // More flexible check for correct option values
                            const isCorrectOption = option.IsCorrect === 1 || option.IsCorrect === true || 
                                                  option.IsCorrect === "1" || option.IsCorrect === "true";
                            
                            console.log(`Rendering option ${option.OptionID}:`, {
                              text: option.OptionText,
                              isSelected,
                              isCorrectOption,
                              OptionID: option.OptionID,
                              selectedOptionId,
                              rawIsCorrect: option.IsCorrect,
                              typeOfIsCorrect: typeof option.IsCorrect
                            });
                            
                            return (
                              <AnswerCard 
                                key={option.OptionID}
                                isSelected={isSelected}
                                isCorrect={isSelected && isCorrectOption}
                              >
                                <CardContent sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  py: 2,
                                  '&:last-child': { pb: 2 }
                                }}>
                                  <Box sx={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    mr: 2,
                                    backgroundColor: 
                                      isSelected 
                                        ? (isCorrectOption ? alpha('#4caf50', 0.2) : alpha('#f44336', 0.2))
                                        : isCorrectOption 
                                          ? alpha('#4caf50', 0.2) 
                                          : alpha('#fff', 0.1),
                                    color: 
                                      isSelected 
                                        ? (isCorrectOption ? '#4caf50' : '#f44336')
                                        : isCorrectOption 
                                          ? '#4caf50' 
                                          : '#fff'
                                  }}>
                                    {isSelected 
                                      ? (isCorrectOption ? <CheckIcon /> : <CancelIcon />)
                                      : isCorrectOption 
                                        ? <CheckIcon /> 
                                        : null}
                                  </Box>
                                  <Typography variant="body1">
                                    {option.OptionText}
                                  </Typography>
                                  
                                  {/* Indicator for correct answer */}
                                  {isCorrectOption && !isSelected && (
                                    <Tooltip title="Correct Answer" arrow placement="top">
                                      <Chip
                                        label="Correct Answer"
                                        size="small"
                                        color="success"
                                        sx={{ ml: 'auto' }}
                                      />
                                    </Tooltip>
                                  )}
                                </CardContent>
                              </AnswerCard>
                            );
                          })}
                        </Box>
                      )}
                      
                      {/* Short Answer */}
                      {question.QuestionType === 'short_answer' && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: alpha('#fff', 0.7), mb: 1 }}>
                            Your Answer:
                          </Typography>
                          <Paper sx={{ 
                            p: 3, 
                            backgroundColor: alpha('#333', 0.5), 
                            borderRadius: 2,
                            border: `1px solid ${isCorrect ? alpha('#4caf50', 0.5) : alpha('#f44336', 0.5)}`
                          }}>
                            <Typography variant="body1">
                              {question.TextAnswer || <em style={{ color: alpha('#fff', 0.5) }}>No answer provided</em>}
                            </Typography>
                          </Paper>
                        </Box>
                      )}
                    </CardContent>
                  </DarkCard>
                );
              })}
            </Stack>
          ) : (
            <DarkCard sx={{ p: 4, textAlign: 'center' }}>
              <HelpOutlineIcon sx={{ fontSize: 48, color: '#aaa', mb: 2 }} />
              <Typography variant="h6">No question details available</Typography>
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.7), mt: 1 }}>
                The details for this attempt might be incomplete.
              </Typography>
            </DarkCard>
          )}
          
          {/* Action Buttons */}
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
            <ActionButton 
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              size="large"
              sx={{ minWidth: 200 }}
            >
              Back to Quiz
            </ActionButton>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  );
} 