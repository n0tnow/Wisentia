// src/app/quizzes/[quizId]/page.jsx
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
  TextField, IconButton, Divider, LinearProgress, 
  CircularProgress, Grid, Stack, styled, Chip, Breadcrumbs,
  useTheme, alpha, Avatar, Tooltip, Badge
} from '@mui/material';

// MUI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CheckIcon from '@mui/icons-material/Check';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';

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

const QuestionButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'answered'
})(({ selected, answered, theme }) => ({
  minWidth: 40,
  width: 40, 
  height: 40,
  padding: 0,
  borderRadius: 8,
  margin: '0 4px',
  backgroundColor: selected ? '#1976d2' : answered ? '#2e7d32' : '#333',
  color: '#fff',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: selected ? '#1565c0' : answered ? '#1b5e20' : '#444',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
}));

const OptionLabel = styled(FormControlLabel, {
  shouldForwardProp: (prop) => prop !== 'checked'
})(({ checked, theme }) => ({
  width: '100%',
  margin: '8px 0',
  padding: '14px 16px',
  borderRadius: 12,
  border: `1px solid ${checked ? '#1976d2' : '#444'}`,
  backgroundColor: checked ? alpha('#1976d2', 0.1) : 'transparent',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: checked ? alpha('#1976d2', 0.15) : alpha('#fff', 0.05),
    transform: 'translateX(4px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
}));

const AnimatedProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: 'linear-gradient(90deg, #1976d2, #64b5f6)',
    transition: 'transform 0.5s ease',
  },
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

export default function QuizPage() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const { quizId } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        setLoading(true);
        let token = null;
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('access_token');
        }
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`/api/quizzes/${quizId}`, { headers });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch quiz details');
        }
        
        const data = await response.json();
        
        // Debug logs
        console.log('Quiz data received:', data);
        console.log('Questions available:', data.questions ? data.questions.length : 'No questions array');
        
        // Ensure questions array exists
        if (!data.questions) {
          data.questions = [];
          console.warn('Quiz has no questions array, initialized empty array');
        }
        
        // If the quiz has user answers from a previous attempt, initialize userAnswers state
        if (data.userAnswers && Object.keys(data.userAnswers).length > 0) {
          setUserAnswers(data.userAnswers);
        }
        
        setQuiz(data);
        
        // Check if user already completed this quiz
        if (data.userAttempts && data.userAttempts.length > 0) {
          const latestAttempt = data.userAttempts[0];
          if (latestAttempt.Passed) {
            setSubmitted(true);
            setQuizResult({
              attemptId: latestAttempt.AttemptID,
              score: latestAttempt.Score,
              maxScore: latestAttempt.MaxScore,
              scorePercentage: (latestAttempt.Score / latestAttempt.MaxScore) * 100,
              passed: latestAttempt.Passed,
              earnedPoints: latestAttempt.EarnedPoints,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (quizId) fetchQuizDetails();
  }, [quizId]);

  const handleSelectOption = (questionId, optionId) => {
    console.log(`Selected option ${optionId} for question ${questionId}`);
    setUserAnswers(prevAnswers => ({ ...prevAnswers, [questionId]: optionId }));
  };
  
  const handleTextAnswer = (questionId, text) => {
    setUserAnswers({ ...userAnswers, [questionId]: text });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) setCurrentQuestion(currentQuestion + 1);
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };
  
  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    const answeredQuestions = Object.keys(userAnswers).length;
    if (answeredQuestions < quiz.questions.length) {
      if (!confirm(`You've only answered ${answeredQuestions} out of ${quiz.questions.length} questions. Are you sure you want to submit?`)) return;
    }
    try {
      setIsSubmitting(true);
      
      // Ensure all answers are properly formatted
      const formattedAnswers = Object.entries(userAnswers).map(([questionId, answer]) => {
        const question = quiz.questions.find(q => q.QuestionID === parseInt(questionId));
        if (!question) {
          console.warn(`Question ID ${questionId} not found in quiz questions`);
          return null;
        }
        
        let selectedOptionId = null;
        let textAnswer = null;
        
        if (question.QuestionType === 'short_answer') {
          textAnswer = answer;
        } else {
          // For multiple_choice and true_false, ensure the answer is a number
          selectedOptionId = answer ? parseInt(answer.toString()) : null;
        }
        
        console.log(`Formatting answer for question ${questionId}: `, { 
          questionId: parseInt(questionId), 
          selectedOptionId, 
          textAnswer 
        });
        
        return {
          questionId: parseInt(questionId),
          selectedOptionId,
          textAnswer,
        };
      }).filter(answer => answer !== null); // Remove any null entries
      
      console.log('Submitting answers:', formattedAnswers);
      
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ answers: formattedAnswers }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Failed to submit quiz');
      }
      
      console.log('Quiz submit response:', responseData);
      setQuizResult(responseData);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert(`Error submitting quiz: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleViewResults = () => {
    if (quizResult) router.push(`/quizzes/attempts/${quizResult.attemptId}`);
  };
  
  const handleBackToVideo = () => {
    if (quiz && quiz.video) router.push(`/courses/${quiz.course?.CourseID}/videos/${quiz.video?.VideoID}`);
    else if (quiz && quiz.course) router.push(`/courses/${quiz.course?.CourseID}`);
    else router.back();
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
            <Typography variant="h6">Loading quiz...</Typography>
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
            <Typography variant="h5" gutterBottom>Error Loading Quiz</Typography>
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

  // Quiz not found state
  if (!quiz) {
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
            <Typography variant="h5" gutterBottom>Quiz Not Found</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              The requested quiz could not be found.
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

  // Main quiz content
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
              onClick={handleBackToVideo}
              sx={{ 
                color: '#fff', 
                mb: 3,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.05),
                }
              }}
            >
              Back to Course
            </Button>
            
            <GradientPaper sx={{ p: 3, mb: 4 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                <Avatar sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: alpha('#1976d2', 0.2),
                  color: '#64b5f6',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  <QuizIcon fontSize="large" />
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {quiz.Title}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ color: alpha('#fff', 0.7), mb: 2 }}>
                    {quiz.Description}
                  </Typography>
                </Box>
              </Stack>
            </GradientPaper>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <DarkCard sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha('#f44336', 0.2), color: '#f44336' }}>
                        <TimerIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Passing Score</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{quiz.PassingScore}%</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </DarkCard>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <DarkCard sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha('#4caf50', 0.2), color: '#4caf50' }}>
                        <HelpOutlineIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Questions</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{quiz.questions?.length || 0}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </DarkCard>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <DarkCard sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha('#ff9800', 0.2), color: '#ff9800' }}>
                        <StarIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Points Available</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{quiz.PointsValue || 0}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </DarkCard>
              </Grid>
            </Grid>
          </Box>

          {/* Quiz Content */}
          {submitted ? (
            <DarkCard sx={{ mb: 4, overflow: 'hidden' }}>
              <Box sx={{ 
                background: quizResult.passed 
                  ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.1), rgba(46, 125, 50, 0.2))' 
                  : 'linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(211, 47, 47, 0.2))',
                pt: 5,
                pb: 4,
                px: 3, 
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: quizResult.passed ? 'linear-gradient(90deg, #4caf50, #81c784)' : 'linear-gradient(90deg, #f44336, #e57373)'
                  }} 
                />
                
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: quizResult.passed ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1),
                    color: quizResult.passed ? '#4caf50' : '#f44336',
                    margin: '0 auto',
                    mb: 3,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                  }}
                >
                  {quizResult.passed ? <CheckCircleIcon sx={{ fontSize: 40 }} /> : <ErrorIcon sx={{ fontSize: 40 }} />}
                </Avatar>
                
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  {quizResult.passed ? 'Quiz Passed!' : 'Quiz Completed'}
                </Typography>
                
                <Typography variant="body1" sx={{ color: alpha('#fff', 0.7), mb: 4, maxWidth: 500, mx: 'auto' }}>
                  {quizResult.passed 
                    ? 'Congratulations! You have successfully completed this quiz.' 
                    : 'You completed the quiz, but did not reach the passing score. You can try again.'}
                </Typography>
              </Box>
              
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Grid container spacing={4} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                      <CircularProgress 
                        variant="determinate" 
                        value={Math.round(quizResult.scorePercentage)} 
                        size={160} 
                        thickness={5}
                        sx={{ 
                          color: quizResult.passed ? 'success.main' : 'error.main',
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
                          {Math.round(quizResult.scorePercentage)}%
                        </Typography>
                        <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
                          Your Score
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Stack spacing={3} sx={{ height: '100%', justifyContent: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Score Details</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {quizResult.score} out of {quizResult.maxScore} points
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Passing Requirement</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {quiz.PassingScore}% minimum score
                        </Typography>
                      </Box>
                      
                      {quizResult.earnedPoints > 0 && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>Rewards</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StyledChip 
                              icon={<StarIcon />} 
                              label={`+${quizResult.earnedPoints} points earned`} 
                              color="warning"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 4 }}>
                  <ActionButton 
                    variant="contained"
                    fullWidth
                    color={quizResult.passed ? "success" : "primary"}
                    startIcon={quizResult.passed ? <DoneAllIcon /> : <CheckIcon />}
                    onClick={handleViewResults}
                    size="large"
                  >
                    View Detailed Results
                  </ActionButton>
                  <ActionButton 
                    variant="outlined"
                    fullWidth
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBackToVideo}
                    size="large"
                  >
                    Return to Course
                  </ActionButton>
                </Stack>
              </CardContent>
            </DarkCard>
          ) : quiz.questions && quiz.questions.length > 0 ? (
            <Stack spacing={3}>
              {/* Question Card */}
              <DarkCard sx={{ overflow: 'hidden' }}>
                {/* Top progress indicator */}
                <Box sx={{ 
                  height: 6, 
                  background: 'linear-gradient(90deg, #1976d2, #64b5f6)',
                  width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
                  transition: 'width 0.5s ease-in-out'
                }} />
                
                <CardContent sx={{ p: 4 }}>
                  {/* Progress indicators */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StyledChip 
                        label={`Question ${currentQuestion + 1}/${quiz.questions.length}`}
                        color="primary"
                        size="small"
                        icon={<QuizIcon fontSize="small" />}
                      />
                      
                      <StyledChip 
                        label={`${Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}% Complete`}
                        color="secondary"
                        size="small"
                        icon={<CheckIcon fontSize="small" />}
                      />
                    </Stack>
                    
                    <StyledChip 
                      label={
                        quiz.questions[currentQuestion].QuestionType === 'multiple_choice' ? 'Multiple Choice' :
                        quiz.questions[currentQuestion].QuestionType === 'true_false' ? 'True/False' : 'Short Answer'
                      }
                      size="small"
                      color={
                        quiz.questions[currentQuestion].QuestionType === 'multiple_choice' ? 'primary' :
                        quiz.questions[currentQuestion].QuestionType === 'true_false' ? 'success' : 'warning'
                      }
                    />
                  </Box>
                  
                  {/* Question number and text */}
                  <Box sx={{ mb: 4, borderLeft: '4px solid #1976d2', pl: 3, py: 1 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom sx={{ display: 'block', mb: 1 }}>
                      QUESTION {currentQuestion + 1}
                    </Typography>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 700, lineHeight: 1.4 }}>
                      {quiz.questions[currentQuestion].QuestionText}
                    </Typography>
                  </Box>
                
                {/* Multiple Choice Questions */}
                {quiz.questions[currentQuestion].QuestionType === 'multiple_choice' && (
                  <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
                    <RadioGroup 
                      value={userAnswers[quiz.questions[currentQuestion].QuestionID] ? userAnswers[quiz.questions[currentQuestion].QuestionID].toString() : ''}
                      onChange={(e) => handleSelectOption(quiz.questions[currentQuestion].QuestionID, e.target.value)}
                    >
                      {quiz.questions[currentQuestion].options && quiz.questions[currentQuestion].options.map((option) => {
                        const isChecked = userAnswers[quiz.questions[currentQuestion].QuestionID] && 
                                          userAnswers[quiz.questions[currentQuestion].QuestionID].toString() === option.OptionID.toString();
                        return (
                          <OptionLabel
                            key={option.OptionID}
                            value={option.OptionID.toString()}
                            control={
                              <Radio 
                                sx={{ 
                                  color: '#666', 
                                  '&.Mui-checked': { color: 'primary.main' } 
                                }} 
                              />
                            }
                            label={option.OptionText}
                            checked={isChecked}
                          />
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                )}
                
                {/* True/False Questions */}
                {quiz.questions[currentQuestion].QuestionType === 'true_false' && (
                  <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
                    <RadioGroup 
                      value={userAnswers[quiz.questions[currentQuestion].QuestionID] ? userAnswers[quiz.questions[currentQuestion].QuestionID].toString() : ''}
                      onChange={(e) => handleSelectOption(quiz.questions[currentQuestion].QuestionID, e.target.value)}
                    >
                      {quiz.questions[currentQuestion].options && quiz.questions[currentQuestion].options.map((option) => {
                        const isChecked = userAnswers[quiz.questions[currentQuestion].QuestionID] && 
                                          userAnswers[quiz.questions[currentQuestion].QuestionID].toString() === option.OptionID.toString();
                        return (
                          <OptionLabel
                            key={option.OptionID}
                            value={option.OptionID.toString()}
                            control={
                              <Radio 
                                sx={{ 
                                  color: '#666', 
                                  '&.Mui-checked': { color: 'primary.main' } 
                                }} 
                              />
                            }
                            label={option.OptionText}
                            checked={isChecked}
                          />
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                )}
                
                {/* Short Answer Questions */}
                {quiz.questions[currentQuestion].QuestionType === 'short_answer' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    placeholder="Type your answer here..."
                    value={userAnswers[quiz.questions[currentQuestion].QuestionID] || ''}
                    onChange={(e) => handleTextAnswer(quiz.questions[currentQuestion].QuestionID, e.target.value)}
                    sx={{ 
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': { borderColor: '#444' },
                        '&:hover fieldset': { borderColor: '#666' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                      }
                    }}
                  />
                )}
                
                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <ActionButton
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                    sx={{ 
                      opacity: currentQuestion === 0 ? 0.5 : 1,
                      minWidth: 130
                    }}
                  >
                    Previous
                  </ActionButton>
                  
                  {currentQuestion < quiz.questions.length - 1 ? (
                    <ActionButton
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={handleNextQuestion}
                      color="primary"
                      sx={{ minWidth: 130 }}
                    >
                      Next
                    </ActionButton>
                  ) : (
                    <ActionButton
                      variant="contained"
                      color="success"
                      endIcon={<CheckIcon />}
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting}
                      sx={{ minWidth: 150 }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </ActionButton>
                  )}
                </Box>
              </CardContent>
            </DarkCard>
              
              {/* Question Navigator */}
              <DarkCard sx={{ 
                borderTop: '4px solid #1976d2', 
                background: 'linear-gradient(180deg, rgba(25, 118, 210, 0.05), transparent 50%)' 
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        bgcolor: alpha('#1976d2', 0.2), 
                        color: '#64b5f6' 
                      }}
                    >
                      <QuizIcon />
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Question Navigator
                    </Typography>
                  </Stack>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {Object.keys(userAnswers).length} of {quiz.questions.length} questions answered
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    {quiz.questions.map((question, index) => {
                      const isAnswered = !!userAnswers[question.QuestionID];
                      const isSelected = currentQuestion === index;
                      
                      return (
                        <Tooltip 
                          key={question.QuestionID || index} 
                          title={
                            isSelected
                              ? "Current question" 
                              : isAnswered
                                ? "Answered" 
                                : "Not answered yet"
                          }
                        >
                          <Badge 
                            variant="dot" 
                            color={isAnswered ? "success" : "default"}
                            sx={{ '& .MuiBadge-badge': { right: 4, top: 4 } }}
                            invisible={!isAnswered}
                          >
                            <QuestionButton
                              onClick={() => setCurrentQuestion(index)}
                              selected={isSelected}
                              answered={isAnswered ? 1 : 0}
                            >
                              {index + 1}
                            </QuestionButton>
                          </Badge>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </CardContent>
              </DarkCard>
            </Stack>
          ) : (
            <DarkCard sx={{ 
              textAlign: 'center', 
              py: 5,
              background: 'linear-gradient(135deg, #121212, #1a1a2e)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 6,
                  background: 'linear-gradient(90deg, #ff9800, #ffb74d)'
                }}
              />
              
              <CardContent sx={{ maxWidth: 500, mx: 'auto' }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: alpha('#ff9800', 0.1),
                    color: '#ff9800',
                    margin: '0 auto',
                    mb: 3,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                  }}
                >
                  <WarningIcon sx={{ fontSize: 40 }} />
                </Avatar>
                
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#ff9800' }}>
                  No Questions Available
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 4, color: alpha('#fff', 0.7) }}>
                  This quiz doesn't have any questions yet. Please check back later or contact your instructor for more information.
                </Typography>
                
                <ActionButton 
                  variant="contained"
                  onClick={handleBackToVideo}
                  color="warning"
                  startIcon={<ArrowBackIcon />}
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  Return to Course
                </ActionButton>
              </CardContent>
            </DarkCard>
          )}
        </Container>
      </Box>
    </MainLayout>
  );
}