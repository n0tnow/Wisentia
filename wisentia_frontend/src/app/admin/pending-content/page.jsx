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
  LibraryAddCheck as TaskIcon
} from '@mui/icons-material';

// Date formatter utility
import { formatDistanceToNow } from 'date-fns';

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
  
  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const difficultyMap = {
      'beginner': 'success',
      'intermediate': 'warning',
      'advanced': 'error'
    };
    
    return difficultyMap[difficulty] || 'default';
  };
  
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
          <Grid container spacing={3}>
            {filteredContent.map((content) => {
              const contentTypeProps = getContentTypeProps(content.ContentType);
              const isExpanded = contentExpanded[content.ContentID] || false;
              const creationDate = formatCreationDate(content.CreationDate);
              const contentData = content.Content || {};
              
              return (
                <Grid item xs={12} key={content.ContentID}>
                  <Card 
                    sx={{ 
                      borderRadius: 2,
                      overflow: 'visible',
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
                        borderTopLeftRadius: 2,
                        borderBottomLeftRadius: 2,
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
                          <Typography variant="h6" component="span">
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
                      action={
                        <Box>
                          <Tooltip title="View Details">
                            <IconButton onClick={() => toggleContentExpanded(content.ContentID)}>
                              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                      sx={{ pl: 3 }}
                    />
                    
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <CardContent sx={{ px: 3, pt: 0 }}>
                        <Divider sx={{ mb: 2 }} />
                        
                        {/* Common content preview */}
                        <Typography variant="body1" paragraph>
                          {contentData.description || 'No description available.'}
                        </Typography>
                        
                        {/* Display different content based on type */}
                        {content.ContentType === 'quest' && (
                          <Box>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
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
                                    label={content.GenerationParams?.difficulty || 'Not specified'} 
                                    color={getDifficultyColor(content.GenerationParams?.difficulty)}
                                    sx={{ mt: 1 }}
                                  />
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
                                    Required Points
                                  </Typography>
                                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                                    {content.GenerationParams?.points_required || '0'}
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Paper 
                                  sx={{ 
                                    p: 2, 
                                    textAlign: 'center', 
                                    bgcolor: alpha(theme.palette.success.light, 0.1),
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.success.main, 0.2),
                                    borderRadius: 2
                                  }}
                                >
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Reward Points
                                  </Typography>
                                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold', color: 'success.main' }}>
                                    {content.GenerationParams?.points_reward || '50'}
                                  </Typography>
                                </Paper>
                              </Grid>
                            </Grid>
                            
                            {/* Quest conditions */}
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                              Conditions:
                            </Typography>
                            <List sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 2 }}>
                              {contentData.conditions?.map((condition, index) => (
                                <ListItem 
                                  key={index}
                                  sx={{ 
                                    py: 1, 
                                    px: 2,
                                    borderBottom: index !== contentData.conditions.length - 1 ? '1px solid' : 'none',
                                    borderColor: 'divider'
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <CheckCircleOutlineIcon color="success" />
                                  </ListItemIcon>
                                  <ListItemText primary={condition.description} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                        
                        {content.ContentType === 'quiz' && (
                          <Box>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
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
                                    label={content.GenerationParams?.difficulty || 'Not specified'} 
                                    color={getDifficultyColor(content.GenerationParams?.difficulty)}
                                    sx={{ mt: 1 }}
                                  />
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
                                    Questions
                                  </Typography>
                                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                                    {contentData.questions?.length || content.GenerationParams?.num_questions || '0'}
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Paper 
                                  sx={{ 
                                    p: 2, 
                                    textAlign: 'center', 
                                    bgcolor: alpha(theme.palette.success.light, 0.1),
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.success.main, 0.2),
                                    borderRadius: 2
                                  }}
                                >
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Passing Score
                                  </Typography>
                                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold', color: 'success.main' }}>
                                    {contentData.passing_score || '70'}%
                                  </Typography>
                                </Paper>
                              </Grid>
                            </Grid>
                            
                            {/* Quiz questions preview */}
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                              Questions Preview:
                            </Typography>
                            <List sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 2 }}>
                              {contentData.questions?.slice(0, 3).map((question, index) => (
                                <ListItem 
                                  key={index}
                                  sx={{ 
                                    py: 1, 
                                    px: 2,
                                    borderBottom: index !== Math.min(2, contentData.questions.length - 1) ? '1px solid' : 'none',
                                    borderColor: 'divider'
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <QuizIcon color="primary" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={question.question_text}
                                    secondary={
                                      <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                          {question.options?.length || 0} options - {
                                            question.options?.filter(o => o.is_correct).length || 0
                                          } correct
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              ))}
                              
                              {contentData.questions?.length > 3 && (
                                <ListItem sx={{ py: 1, px: 2 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    {contentData.questions.length - 3} more questions...
                                  </Typography>
                                </ListItem>
                              )}
                            </List>
                          </Box>
                        )}
                      </CardContent>
                    </Collapse>
                    
                    <Divider />
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<VisibilityIcon />}
                        onClick={() => toggleContentExpanded(content.ContentID)}
                        sx={{ mr: 1 }}
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </Button>
                      
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={() => handleOpenApprovalDialog(content)}
                        sx={{ 
                          borderRadius: 8,
                          px: 2,
                          bgcolor: theme.palette.success.main,
                          '&:hover': {
                            bgcolor: theme.palette.success.dark,
                          },
                        }}
                      >
                        Approve
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
        
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