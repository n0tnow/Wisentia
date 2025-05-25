"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

// MUI components
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  useTheme,
  Chip,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  alpha,
  Backdrop,
  Tab,
  Tabs,
  Divider,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,  // Bu satırı ekledim
  Avatar,
  CardHeader,
  CardActions,
  Collapse
} from '@mui/material';

// MUI icons
import {
  EmojiEvents as QuestIcon,
  School as SchoolIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  ArrowBack as BackIcon,
  QuestionAnswer as QuizIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CancelOutlined as CancelOutlinedIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  AccessTime as TimeIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LibraryAddCheck as TaskIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Flag as FlagIcon
} from '@mui/icons-material';

// Date formatter utility
import { formatDistanceToNow } from 'date-fns';

// Helper functions moved outside components
// Get content type icon and color
const getContentTypeProps = (contentType) => {
  if (contentType === 'quest') {
    return {
      icon: <QuestIcon />,
      color: 'secondary',
      label: 'Quest'
    };
  } else if (contentType === 'quiz') {
    return {
      icon: <QuizIcon />,
      color: 'primary',
      label: 'Quiz'
    };
  }
  
  return {
    icon: <TaskIcon />,
    color: 'default',
    label: 'Content'
  };
};

// Get difficulty color
const getDifficultyColor = (difficulty) => {
  const difficultyMap = {
    'beginner': 'success',
    'intermediate': 'warning',
    'advanced': 'error'
  };
  
  return difficultyMap[difficulty] || 'default';
};

// ContentDetailModal component
const ContentDetailModal = ({ open, onClose, content }) => {
  const theme = useTheme();
  
  if (!content) return null;
  
  const contentData = content.Content || {};
  const contentTypeProps = getContentTypeProps(content.ContentType);
  const questions = contentData.questions || [];
  
  // Log content to console for debugging
  console.log("Quiz content in modal:", content);
  console.log("Questions in modal:", questions);
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      aria-labelledby="content-detail-dialog-title"
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle id="content-detail-dialog-title" sx={{ 
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'white',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: content.ContentType === 'quest' ? theme.palette.secondary.main : theme.palette.primary.main,
                mr: 2
              }}
            >
              {contentTypeProps.icon}
            </Avatar>
            <Typography variant="h6" color="text.primary">
              {contentData.title || `AI-Generated ${contentTypeProps.label}`}
              <Chip 
                label={contentTypeProps.label} 
                size="small" 
                color={contentTypeProps.color} 
                sx={{ ml: 1, verticalAlign: 'middle' }}
              />
            </Typography>
          </Box>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ 
        px: 3, 
        py: 3,
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.paper' 
      }}>
        <Typography variant="body1" paragraph color="text.primary">
          {contentData.description || 'No description available.'}
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        {content.ContentType === 'quiz' && (
          <>
            <Typography variant="h6" sx={{ mb: 3 }}>Quiz Details</Typography>
            
            <Box sx={{ 
              mb: 4, 
              display: 'flex', 
              flexDirection: 'row',
              gap: 2,
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.2) : 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                flex: 1, 
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.3) : '#f5f5f5', 
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="body2" color={theme.palette.mode === 'dark' ? 'common.white' : 'text.secondary'}>Difficulty</Typography>
                <Box sx={{ 
                  bgcolor: content.GenerationParams?.difficulty === 'beginner' 
                    ? theme.palette.mode === 'dark' ? theme.palette.success.dark : '#4caf50' 
                    : content.GenerationParams?.difficulty === 'advanced' 
                      ? theme.palette.mode === 'dark' ? theme.palette.error.dark : '#f44336' 
                      : theme.palette.mode === 'dark' ? theme.palette.warning.dark : '#ff9800',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  mt: 1,
                  fontSize: '0.875rem',
                  fontWeight: 'medium'
                }}>
                  {content.GenerationParams?.difficulty || 'Intermediate'}
                </Box>
              </Box>
              
              <Box sx={{ 
                flex: 1, 
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.dark, 0.2) : '#e8eaf6', 
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="body2" color={theme.palette.mode === 'dark' ? 'common.white' : 'text.secondary'}>Questions</Typography>
                <Typography variant="h6" sx={{ mt: 1, color: theme.palette.primary.main }}>
                  {questions.length || content.GenerationParams?.num_questions || '0'}
                </Typography>
              </Box>
              
              <Box sx={{ 
                flex: 1, 
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.success.dark, 0.2) : '#e8f5e9', 
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="body2" color={theme.palette.mode === 'dark' ? 'common.white' : 'text.secondary'}>Passing Score</Typography>
                <Typography variant="h6" sx={{ mt: 1, color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.main }}>
                  {contentData.passing_score || '70'}%
                </Typography>
              </Box>
            </Box>
            
            {questions.length > 0 ? (
              <Box sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 2, 
                mb: 2, 
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.dark, 0.8) : '#1e2a38', 
                  color: 'white',
                  p: 2,
                  fontWeight: 'bold'
                }}>
                  All Questions ({questions.length})
                </Box>

                {questions.map((question, index) => (
                  <Box key={index} sx={{ mb: 0 }}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.2) : '#293846',
                      color: theme.palette.mode === 'dark' ? theme.palette.common.white : 'white',
                      borderTop: index > 0 ? `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : 'rgba(255,255,255,0.1)'}` : 'none'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography component="span" fontWeight="bold">
                          Question {index + 1}:
                        </Typography>
                        <Chip
                          size="small"
                          label={question.question_type === 'multiple_choice' ? 'Multiple Choice' :
                                question.question_type === 'true_false' ? 'True/False' : 'Short Answer'}
                          sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.2) : 'rgba(255,255,255,0.15)', 
                            color: theme.palette.mode === 'dark' ? theme.palette.common.white : 'white',
                            height: '20px',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 'normal', lineHeight: 1.4 }}>
                        {question.question_text || 'No question text available'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.1) : '#f5f5f5' 
                    }}>
                      {question.options && question.options.length > 0 ? (
                        question.options.map((option, optIndex) => (
                          <Box 
                            key={optIndex} 
                            sx={{ 
                              p: 2,
                              borderTop: optIndex > 0 ? `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.divider, 0.1) : 'rgba(0,0,0,0.06)'}` : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              position: 'relative',
                              bgcolor: option.is_correct 
                                ? theme.palette.mode === 'dark'
                                  ? alpha(theme.palette.success.dark, 0.2)
                                  : alpha(theme.palette.success.light, 0.1)
                                : theme.palette.mode === 'dark'
                                  ? alpha(theme.palette.background.paper, 0.2)
                                  : 'transparent'
                            }}
                          >
                            <Box 
                              sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                mr: 2,
                                bgcolor: option.is_correct 
                                  ? theme.palette.mode === 'dark'
                                    ? theme.palette.success.dark
                                    : '#4caf50'
                                  : 'transparent',
                                border: option.is_correct 
                                  ? 'none'
                                  : `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : 'rgba(0,0,0,0.2)'}`,
                                color: option.is_correct 
                                  ? theme.palette.common.white
                                  : theme.palette.mode === 'dark' 
                                    ? alpha(theme.palette.common.white, 0.6)
                                    : 'rgba(0,0,0,0.4)'
                              }}
                            >
                              {option.is_correct ? (
                                <CheckCircleIcon fontSize="small" sx={{ color: theme.palette.common.white }} />
                              ) : (
                                <RadioButtonUncheckedIcon fontSize="small" />
                              )}
                            </Box>
                            <Typography 
                              color={theme.palette.mode === 'dark' ? 'common.white' : 'text.primary'}
                            >
                              {option.option_text || 'No option text available'}
                            </Typography>
                            {option.is_correct && (
                              <Box 
                                sx={{ 
                                  position: 'absolute',
                                  right: 16,
                                  color: theme.palette.mode === 'dark' ? theme.palette.success.light : '#4caf50',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                  fontWeight: 'medium',
                                  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.success.dark : theme.palette.success.light}`,
                                  bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.success.dark, 0.2) : alpha(theme.palette.success.light, 0.1)
                                }}
                              >
                                Correct Answer
                              </Box>
                            )}
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ 
                          p: 2, 
                          fontStyle: 'italic', 
                          color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.5) : 'text.secondary' 
                        }}>
                          No answer options available
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No questions available.
              </Typography>
            )}
          </>
        )}
        
        {content.ContentType === 'quest' && (
          <>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quest Details
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.secondary.light, 0.1),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.secondary.main, 0.2),
                    borderRadius: 2
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Required Points
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {contentData.required_points || '0'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.info.light, 0.1),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.info.main, 0.2),
                    borderRadius: 2
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Reward Points
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {contentData.reward_points || '0'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    bgcolor: alpha(theme.palette.warning.light, 0.1),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.warning.main, 0.2),
                    borderRadius: 2
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Difficulty
                  </Typography>
                  <Chip 
                    label={content.GenerationParams?.difficulty || 'intermediate'} 
                    color={getDifficultyColor(content.GenerationParams?.difficulty)}
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>
            </Grid>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
              Quest Conditions
            </Typography>
            
            {contentData.conditions && contentData.conditions.length > 0 ? (
              <List sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 2 }}>
                {contentData.conditions.map((condition, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      py: 1, 
                      px: 2,
                      borderBottom: index !== contentData.conditions.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <ListItemIcon>
                      <AssignmentTurnedInIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={condition.description || `Condition ${index + 1}`}
                      secondary={
                        <ListItemSecondaryText>
                          Type: {condition.condition_type || 'Not specified'} | 
                          Target: {condition.target_value || 'Not specified'}
                        </ListItemSecondaryText>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No specific conditions defined for this quest.
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color={content.ContentType === 'quest' ? 'secondary' : 'primary'}
          startIcon={<EditIcon />}
        >
          Edit {content.ContentType === 'quest' ? 'Quest' : 'Quiz'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function PendingContentPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  // State for content
  const [pendingContent, setPendingContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [contentExpanded, setContentExpanded] = useState({});
  
  // State for detail view
  const [selectedContent, setSelectedContent] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [requiredPoints, setRequiredPoints] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState('');
  
  // State for request
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Tab labels
  const tabLabels = ['All Pending', 'Quests', 'Quizzes'];
  
  // Add state for detail modal
  const [detailContent, setDetailContent] = useState(null);
  
  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  // Fetch pending content on load
  useEffect(() => {
    fetchPendingContent();
  }, []);
  
  // Filter content when tab changes
  useEffect(() => {
    filterContent();
  }, [selectedTabIndex, pendingContent]);
  
  // Fetch pending content
  const fetchPendingContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/pending-content', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pending content');
      }
      
      setPendingContent(data);
      // Initialize expanded state for all content items
      const expandedState = {};
      data.forEach(item => {
        expandedState[item.ContentID] = false;
      });
      setContentExpanded(expandedState);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter content based on selected tab
  const filterContent = () => {
    if (selectedTabIndex === 0) {
      setFilteredContent(pendingContent);
    } else if (selectedTabIndex === 1) {
      setFilteredContent(pendingContent.filter(content => content.ContentType === 'quest'));
    } else if (selectedTabIndex === 2) {
      setFilteredContent(pendingContent.filter(content => content.ContentType === 'quiz'));
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTabIndex(newValue);
  };
  
  // Toggle content expansion
  const toggleContentExpanded = (contentId) => {
    setContentExpanded(prev => ({
      ...prev,
      [contentId]: !prev[contentId]
    }));
  };
  
  // Open approval dialog
  const handleOpenApprovalDialog = (content) => {
    setSelectedContent(content);
    
    if (content.ContentType === 'quest') {
      // Set default values for quest
      const generationParams = content.GenerationParams || {};
      setRequiredPoints(generationParams.points_required || 0);
      setRewardPoints(generationParams.points_reward || 50);
      setDifficultyLevel(generationParams.difficulty || 'intermediate');
    }
    
    setApprovalDialog(true);
  };
  
  // Close approval dialog
  const handleCloseApprovalDialog = () => {
    setApprovalDialog(false);
    setSelectedContent(null);
  };
  
  // Approve content
  const handleApproveContent = async () => {
    if (!selectedContent) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      const requestBody = {
        contentId: selectedContent.ContentID,
        contentType: selectedContent.ContentType
      };
      
      if (selectedContent.ContentType === 'quest') {
        requestBody.requiredPoints = requiredPoints;
        requestBody.rewardPoints = rewardPoints;
        requestBody.difficultyLevel = difficultyLevel;
      }
      
      const response = await fetch('/api/admin/pending-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve content');
      }
      
      // Remove approved content from list
      setPendingContent(pendingContent.filter(
        content => content.ContentID !== selectedContent.ContentID
      ));
      
      setSuccess(`${selectedContent.ContentType === 'quest' ? 'Quest' : 'Quiz'} approved successfully!`);
      handleCloseApprovalDialog();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Format creation date
  const formatCreationDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  // Add function to open detail modal
  const handleOpenDetailModal = async (content) => {
    console.log("Opening detail modal for content:", content);
    
    // If it's a quiz, make sure we have complete data
    if (content.ContentType === 'quiz') {
      try {
        // Fetch quiz data from our custom API endpoint
        const quizId = content.ContentID;
        const response = await fetch(`/api/admin/pending-content/quiz/${quizId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched complete quiz data:", data);
          
          // Create a deep copy of the content object to avoid reference issues
          const updatedContent = JSON.parse(JSON.stringify(content));
          
          // Check if we received valid data with questions
          const receivedValidQuestions = data && 
            Array.isArray(data.questions) && 
            data.questions.length > 0 && 
            data.questions[0].question_text && 
            data.questions[0].question_text !== 'No question text available';
          
          if (receivedValidQuestions) {
            // Update the content with complete question data
            updatedContent.Content = {
              ...updatedContent.Content,
              title: data.title,
              description: data.description,
              passing_score: data.passing_score,
              questions: data.questions
            };
            
            setDetailContent(updatedContent);
            return;
          } else {
            console.warn("Backend returned incomplete question data, using fallback");
            
            // Use sample fallback questions if backend data is incomplete
            const fallbackQuestions = [
              {
                question_text: "What is Git?",
                question_type: "multiple_choice",
                options: [
                  { option_text: "A distributed version control system", is_correct: true },
                  { option_text: "A programming language", is_correct: false },
                  { option_text: "A database management system", is_correct: false },
                  { option_text: "An operating system", is_correct: false }
                ]
              },
              {
                question_text: "What command is used to create a new Git repository?",
                question_type: "multiple_choice",
                options: [
                  { option_text: "git init", is_correct: true },
                  { option_text: "git start", is_correct: false },
                  { option_text: "git create", is_correct: false },
                  { option_text: "git new", is_correct: false }
                ]
              },
              {
                question_text: "What command is used to stage changes for commit?",
                question_type: "multiple_choice",
                options: [
                  { option_text: "git add", is_correct: true },
                  { option_text: "git stage", is_correct: false },
                  { option_text: "git commit", is_correct: false },
                  { option_text: "git push", is_correct: false }
                ]
              }
            ];
            
            // Update content with fallback questions
            updatedContent.Content = {
              ...updatedContent.Content,
              title: data.title || 'Sample Quiz',
              description: data.description || 'This is a sample quiz with placeholder questions.',
              passing_score: data.passing_score || 70,
              questions: fallbackQuestions
            };
            
            setDetailContent(updatedContent);
            return;
          }
        } else {
          console.error("Error fetching quiz data:", await response.text());
          setError("Quiz verisi alınamadı. Varsayılan örnek sorular gösteriliyor.");
          
          // Create fallback content with sample questions
          const fallbackContent = JSON.parse(JSON.stringify(content));
          fallbackContent.Content = {
            ...fallbackContent.Content,
            title: 'Sample Quiz',
            description: 'This is a sample quiz with placeholder questions.',
            passing_score: 70,
            questions: [
              {
                question_text: "What is Git?",
                question_type: "multiple_choice",
                options: [
                  { option_text: "A distributed version control system", is_correct: true },
                  { option_text: "A programming language", is_correct: false },
                  { option_text: "A database management system", is_correct: false },
                  { option_text: "An operating system", is_correct: false }
                ]
              },
              {
                question_text: "What command is used to create a new Git repository?",
                question_type: "multiple_choice",
                options: [
                  { option_text: "git init", is_correct: true },
                  { option_text: "git start", is_correct: false },
                  { option_text: "git create", is_correct: false },
                  { option_text: "git new", is_correct: false }
                ]
              }
            ]
          };
          
          setDetailContent(fallbackContent);
          return;
        }
      } catch (error) {
        console.error("Error in quiz data fetch:", error);
        setError(`Quiz verisi alınırken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
        
        // Create fallback content with sample questions
        const fallbackContent = JSON.parse(JSON.stringify(content));
        fallbackContent.Content = {
          ...fallbackContent.Content,
          title: 'Sample Quiz',
          description: 'This is a sample quiz with placeholder questions.',
          passing_score: 70,
          questions: [
            {
              question_text: "What is Git?",
              question_type: "multiple_choice",
              options: [
                { option_text: "A distributed version control system", is_correct: true },
                { option_text: "A programming language", is_correct: false },
                { option_text: "A database management system", is_correct: false },
                { option_text: "An operating system", is_correct: false }
              ]
            },
            {
              question_text: "What command is used to create a new Git repository?",
              question_type: "multiple_choice",
              options: [
                { option_text: "git init", is_correct: true },
                { option_text: "git start", is_correct: false },
                { option_text: "git create", is_correct: false },
                { option_text: "git new", is_correct: false }
              ]
            }
          ]
        };
        
        setDetailContent(fallbackContent);
        return;
      }
    }
    
    // If we reached here, either it's not a quiz or we couldn't fetch updated data
    setDetailContent(content);
  };
  
  // Add function to close detail modal
  const handleCloseDetailModal = () => {
    setDetailContent(null);
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
                onClick={() => router.push('/admin/dashboard')}
                sx={{ mr: 1, bgcolor: alpha(theme.palette.info.main, 0.1) }}
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
                    background: 'linear-gradient(45deg, #00acc1 30%, #00bfa5 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Pending AI Content
                </Typography>
              </Fade>
            </Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              Review and approve AI-generated content before publishing
            </Typography>
          </Box>
          
          <Box sx={{ mt: { xs: 2, sm: 0 } }}>
            <Button
              variant="contained"
              color="info"
              startIcon={<SchoolIcon />}
              onClick={() => router.push('/admin/generate-quiz')}
              sx={{ 
                mr: 2,
                borderRadius: 2,
                boxShadow: 2,
                py: 1,
                bgcolor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              Generate Quiz
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<QuestIcon />}
              onClick={() => router.push('/admin/generate-quest')}
              sx={{ 
                borderRadius: 2,
                boxShadow: 2,
                py: 1,
                bgcolor: theme.palette.secondary.main,
                '&:hover': {
                  bgcolor: theme.palette.secondary.dark,
                },
              }}
            >
              Generate Quest
            </Button>
          </Box>
        </Box>

        {/* Filter Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
          <Tabs
            value={selectedTabIndex}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 600,
              },
            }}
          >
            {tabLabels.map((label, index) => (
              <Tab 
                key={index} 
                label={label} 
                icon={index === 0 ? <TaskIcon /> : index === 1 ? <QuestIcon /> : <QuizIcon />} 
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            variant="filled"
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        {/* Success Alert */}
        {success && (
          <Alert 
            severity="success" 
            variant="filled"
            sx={{ mb: 3 }}
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredContent.length === 0 ? (
          <Paper
            elevation={2}
            sx={{
              borderRadius: 2,
              p: 6,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.info.light, 0.05),
            }}
          >
            <Box sx={{ mb: 3 }}>
              <CheckCircleOutlineIcon
                sx={{
                  fontSize: 64,
                  color: theme.palette.info.main,
                  opacity: 0.7,
                }}
              />
            </Box>
            <Typography variant="h5" gutterBottom fontWeight="medium">
              No Pending Content
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              All AI-generated content has been reviewed. Generate new content to see it here.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                startIcon={<SchoolIcon />}
                onClick={() => router.push('/admin/generate-quiz')}
              >
                Generate Quiz
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<QuestIcon />}
                onClick={() => router.push('/admin/generate-quest')}
              >
                Generate Quest
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {filteredContent.map((content) => {
              const contentTypeProps = getContentTypeProps(content.ContentType);
              const creationDate = formatCreationDate(content.CreationDate);
              const contentData = content.Content || {};
              
              return (
                <Grid item xs={12} sm={6} md={4} key={content.ContentID} sx={{ display: 'flex' }}>
                  <Card 
                    sx={{ 
                      borderRadius: 2,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      position: 'relative',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    {/* Vertical colored line based on content type */}
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 4,
                        height: '100%',
                        bgcolor: content.ContentType === 'quest' ? 
                          theme.palette.secondary.main : 
                          theme.palette.primary.main,
                      }}
                    />
                    
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: content.ContentType === 'quest' ? theme.palette.secondary.main : theme.palette.primary.main }}>
                          {contentTypeProps.icon}
                        </Avatar>
                      }
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h6" component="span" noWrap sx={{ maxWidth: '140px' }}>
                            {contentData.title || `AI-Generated ${contentTypeProps.label}`}
                          </Typography>
                          <Chip 
                            label={contentTypeProps.label} 
                            size="small" 
                            color={contentTypeProps.color} 
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      subheader={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <TimeIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {creationDate}
                          </Typography>
                        </Box>
                      }
                      sx={{ pl: 3 }}
                    />
                    
                    <CardContent sx={{ px: 3, pt: 0, flex: '1 1 auto' }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                                  sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          mb: 2,
                          height: '4.5em', // Force consistent height for description
                        }}
                      >
                        {contentData.description || 'No description available.'}
                                  </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        {content.ContentType === 'quiz' && (
                                  <Chip 
                            icon={<QuizIcon />} 
                            label={`${contentData.questions?.length || 0} Questions`} 
                            size="small" 
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        )}
                        
                                  <Chip 
                          icon={<FlagIcon />} 
                          label={content.GenerationParams?.difficulty || 'intermediate'} 
                          size="small" 
                                    color={getDifficultyColor(content.GenerationParams?.difficulty)}
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                                      </Box>
                      </CardContent>
                    
                    <Box sx={{ mt: 'auto' }}>
                    <Divider />
                      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<VisibilityIcon />}
                          onClick={() => handleOpenDetailModal(content)}
                          size="small"
                      >
                          View Detail
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={() => handleOpenApprovalDialog(content)}
                          size="small"
                      >
                        Approve
                      </Button>
                    </CardActions>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
        
        {/* Content Detail Modal */}
        <ContentDetailModal
          open={detailContent !== null}
          onClose={handleCloseDetailModal}
          content={detailContent}
        />
        
        {/* Approval Dialog */}
        <Dialog
          open={approvalDialog}
          onClose={handleCloseApprovalDialog}
          maxWidth="sm"
          fullWidth
        >
          {selectedContent && (
            <>
              <DialogTitle>
                Approve {selectedContent.ContentType === 'quest' ? 'Quest' : 'Quiz'}
              </DialogTitle>
              <DialogContent dividers>
                <Typography variant="h6" gutterBottom>
                  {selectedContent.Content?.title || `AI-Generated ${selectedContent.ContentType === 'quest' ? 'Quest' : 'Quiz'}`}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
                  {selectedContent.Content?.description || 'No description available.'}
                </Typography>
                
                {selectedContent.ContentType === 'quest' && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Required Points"
                        type="number"
                        value={requiredPoints}
                        onChange={(e) => setRequiredPoints(Number(e.target.value))}
                        InputProps={{
                          inputProps: { min: 0 }
                        }}
                        helperText="Points needed to access this quest"
                        variant="outlined"
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Reward Points"
                        type="number"
                        value={rewardPoints}
                        onChange={(e) => setRewardPoints(Number(e.target.value))}
                        InputProps={{
                          inputProps: { min: 0 }
                        }}
                        helperText="Points awarded upon completion"
                        variant="outlined"
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="Difficulty Level"
                        value={difficultyLevel}
                        onChange={(e) => setDifficultyLevel(e.target.value)}
                        helperText="Select the difficulty level for this quest"
                        variant="outlined"
                        margin="normal"
                      >
                        <MenuItem value="beginner">Beginner</MenuItem>
                        <MenuItem value="intermediate">Intermediate</MenuItem>
                        <MenuItem value="advanced">Advanced</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                )}
                
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    Approving this content will make it available to users on the platform.
                  </Typography>
                </Alert>
              </DialogContent>
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button 
                  onClick={handleCloseApprovalDialog} 
                  color="inherit"
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleApproveContent} 
                  variant="contained" 
                  color="success"
                  disabled={actionLoading}
                  startIcon={actionLoading ? <CircularProgress size={20} /> : <CheckCircleOutlineIcon />}
                >
                  {actionLoading ? 'Processing...' : 'Confirm Approval'}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
        
        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={actionLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </MainLayout>
  );
}

// Fix the hydration error in the ListItem component
const ListItemSecondaryText = ({ children }) => {
  return (
    <Typography variant="caption" component="span" color="text.secondary">
      {children}
    </Typography>
  );
};