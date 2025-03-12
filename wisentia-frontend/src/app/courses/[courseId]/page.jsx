'use client';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Button,
  Divider,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Chip,
  Avatar,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  Rating,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import { 
  PlayArrow as PlayIcon,
  PauseCircle as PauseIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Info as InfoIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  LiveTv as LiveTvIcon,
  ArticleOutlined as ArticleIcon,
  Quiz as QuizIcon,
  VideoLibrary as VideoIcon,
  CheckCircleOutline as CheckedIcon,
  RadioButtonUnchecked as UncheckedIcon,
  ArrowBack as ArrowBackIcon,
  ShareOutlined as ShareIcon
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/app/auth/ProtectedRoute';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Content item component
const ContentItem = ({ content, isLocked, isActive, progress, onClick }) => {
  const theme = useTheme();
  
  // Different icons for content types
  const getContentTypeIcon = (type) => {
    switch (type) {
      case 1: return <VideoIcon />;
      case 2: return <ArticleIcon />;
      case 3: return <QuizIcon />;
      default: return <InfoIcon />;
    }
  };
  
  const getContentTypeName = (type) => {
    switch (type) {
      case 1: return 'Video';
      case 2: return 'Article';
      case 3: return 'Interactive';
      default: return 'Content';
    }
  };

  return (
    <ListItemButton 
      onClick={isLocked ? null : onClick}
      selected={isActive}
      disabled={isLocked}
      sx={{ 
        borderRadius: 2,
        mb: 1,
        p: 2,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
        '&:hover': {
          backgroundColor: isLocked ? alpha(theme.palette.action.disabledBackground, 0.7) : alpha(theme.palette.primary.main, 0.08)
        }
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        {isLocked ? <LockIcon color="disabled" /> : getContentTypeIcon(content.ContentType)}
      </ListItemIcon>
      
      <ListItemText 
        primary={
          <Typography variant="subtitle1" fontWeight={isActive ? 'bold' : 'normal'} noWrap>
            {content.Title}
          </Typography>
        }
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Chip 
              label={getContentTypeName(content.ContentType)} 
              size="small"
              sx={{ 
                fontSize: '0.7rem', 
                height: 20,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                mr: 1
              }}
            />
            <TimeIcon fontSize="small" sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              {content.DurationMinutes} min
            </Typography>
            {progress > 0 && !isLocked && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ 
                    width: 40, 
                    height: 4, 
                    borderRadius: 2,
                    mr: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  {Math.round(progress)}%
                </Typography>
              </Box>
            )}
          </Box>
        }
      />
      
      {isLocked ? (
        <Chip 
          label="Locked" 
          size="small"
          sx={{ 
            bgcolor: alpha(theme.palette.grey[500], 0.1),
            color: theme.palette.text.secondary,
          }}
        />
      ) : progress === 100 ? (
        <CheckIcon color="success" />
      ) : isActive ? (
        <PlayIcon color="primary" />
      ) : null}
    </ListItemButton>
  );
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeContent, setActiveContent] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [progress, setProgress] = useState({});
  const [enrollStatus, setEnrollStatus] = useState({
    isEnrolled: false,
    progress: 0,
    lastContentId: null
  });
  
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseData = await api.get(`/courses/${courseId}/`, false);
        setCourse(courseData);
        
        // Fetch course contents
        const contentsData = await api.get(`/courses/${courseId}/contents/`, false);
        setContents(contentsData);
        
        // Set first content as active by default
        if (contentsData && contentsData.length > 0) {
          setActiveContent(contentsData[0]);
        }
        
        // If user is authenticated, fetch enrollment status and progress
        if (isAuthenticated) {
          try {
            // This endpoint would return user's progress for this course
            // const userProgress = await api.get(`/courses/${courseId}/progress/`);
            // setEnrollStatus({
            //   isEnrolled: true,
            //   progress: userProgress.ProgressPercentage || 0,
            //   lastContentId: userProgress.LastContentID
            // });
            
            // For now, let's simulate some progress data
            setEnrollStatus({
              isEnrolled: Math.random() > 0.5, // randomly determine if enrolled
              progress: Math.floor(Math.random() * 100),
              lastContentId: contentsData && contentsData.length > 0 ? 
                contentsData[Math.floor(Math.random() * contentsData.length)].ContentID : null
            });
            
            // Simulate progress for each content
            const progressData = {};
            contentsData.forEach(content => {
              progressData[content.ContentID] = Math.floor(Math.random() * 101); // 0-100
            });
            setProgress(progressData);
          } catch (err) {
            console.error('Error fetching user progress:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Failed to load course. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [courseId, isAuthenticated]);
  
  const handleContentClick = (content) => {
    setActiveContent(content);
    
    // In a real app, you'd update the user's progress here
    // and possibly navigate to a different view for the content
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      router.push('/auth/login');
      return;
    }
    
    try {
      // In a real app, you'd call an API to enroll the user
      // await api.post(`/courses/${courseId}/enroll/`);
      
      // For now, let's simulate enrollment
      setEnrollStatus({
        isEnrolled: true,
        progress: 0,
        lastContentId: contents[0]?.ContentID
      });
      
      // Navigate to the first content
      if (contents.length > 0) {
        setActiveContent(contents[0]);
      }
    } catch (err) {
      console.error('Error enrolling in course:', err);
    }
  };
  
  const handleContinue = () => {
    // Find the last accessed content or the first incomplete content
    if (enrollStatus.lastContentId) {
      const lastContent = contents.find(c => c.ContentID === enrollStatus.lastContentId);
      if (lastContent) {
        setActiveContent(lastContent);
        return;
      }
    }
    
    // Find the first content with incomplete progress
    for (const content of contents) {
      if (progress[content.ContentID] < 100) {
        setActiveContent(content);
        return;
      }
    }
    
    // If all are complete, just go to the first one
    if (contents.length > 0) {
      setActiveContent(contents[0]);
    }
  };
  
  const getEducationLevel = (level) => {
    const labels = {
      1: 'Primary',
      2: 'Secondary',
      3: 'High School',
      4: 'University',
      5: 'Professional'
    };
    
    return labels[level] || 'All Levels';
  };
  
  const getDifficultyLevel = (level) => {
    const labels = {
      1: 'Easy',
      2: 'Beginner',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    
    return labels[level] || 'Intermediate';
  };
  
  if (loading) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ ml: 2 }}>
              <Skeleton variant="text" width={180} />
              <Skeleton variant="text" width={120} />
            </Box>
          </Box>
          
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4, mb: 4 }} />
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Skeleton variant="text" height={70} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={24} width="80%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={24} width="90%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={24} width="70%" sx={{ mb: 3 }} />
              
              <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2, mb: 4 }} />
              
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }
  
  if (error || !course) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" color="error" gutterBottom>
            {error || 'Course not found'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            We couldn't load this course. Please try again later.
          </Typography>
          <Button 
            variant="outlined" 
            component={Link} 
            href="/courses"
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 2 }}
          >
            Back to Courses
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <ProtectedRoute>
      <Box sx={{ py: 4, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="lg">
          {/* Breadcrumbs and Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Button 
              component={Link} 
              href="/courses"
              startIcon={<ArrowBackIcon />}
              color="inherit"
              sx={{ 
                color: 'text.secondary',
                px: 1,
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: theme.palette.primary.main
                }
              }}
            >
              Back to Courses
            </Button>
            
            <Button
              startIcon={<ShareIcon />}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Share
            </Button>
          </Box>
          
          {/* Course Header */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              mb: 4,
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <Box sx={{ 
              p: 4, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative backgrounds */}
              <Box sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                zIndex: 0
              }} />
              
              <Box sx={{
                position: 'absolute',
                bottom: -100,
                left: -100,
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
                zIndex: 0
              }} />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Typography variant="overline" sx={{ opacity: 0.9 }}>
                      {course.CategoryName}
                    </Typography>
                    <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                      {course.Title}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
                      {course.Description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Chip 
                        icon={<SchoolIcon />} 
                        label={getEducationLevel(course.EducationLevel)}
                        sx={{ bgcolor: alpha('#fff', 0.15), color: 'white' }}
                      />
                      <Chip 
                        icon={<AssignmentIcon />} 
                        label={getDifficultyLevel(course.DifficultyLevel)}
                        sx={{ bgcolor: alpha('#fff', 0.15), color: 'white' }}
                      />
                      <Chip 
                        icon={<TimeIcon />} 
                        label={`${course.DurationMinutes} minutes`}
                        sx={{ bgcolor: alpha('#fff', 0.15), color: 'white' }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating 
                          value={4.7} 
                          precision={0.1} 
                          readOnly 
                          sx={{ color: theme.palette.warning.light, mr: 1 }}
                        />
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                          4.7
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, ml: 1 }}>
                          (123 ratings)
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PeopleIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          1,234 students enrolled
                        </Typography>
                      </Box>
                      
                      <Box>
                        {course.IsPremium ? (
                          <Chip 
                            label={`Premium - $${course.Price || 49.99}`}
                            sx={{ 
                              bgcolor: theme.palette.warning.main,
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              height: 32
                            }}
                          />
                        ) : (
                          <Chip 
                            label="Free Course"
                            sx={{ 
                              bgcolor: theme.palette.success.main,
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              height: 32
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>
          
          {/* Course Content */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              {/* Enrollment Status Bar */}
              {isAuthenticated && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    mb: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    background: enrollStatus.isEnrolled 
                      ? `linear-gradient(to right, ${alpha(theme.palette.success.light, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`
                      : 'white'
                  }}
                >
                  {enrollStatus.isEnrolled ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                          <CheckIcon />
                        </Avatar>
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            You are enrolled in this course
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={enrollStatus.progress} 
                              sx={{ 
                                width: 100, 
                                height: 8, 
                                borderRadius: 4,
                                mr: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.1)
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(enrollStatus.progress)}% Complete
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Button
                        variant="contained"
                        startIcon={<PlayIcon />}
                        onClick={handleContinue}
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                      >
                        Continue Learning
                      </Button>
                    </>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                          <InfoIcon />
                        </Avatar>
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Enroll to start learning
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {course.IsPremium ? `Premium access for $${course.Price || 49.99}` : 'This course is free to access'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Button
                        variant="contained"
                        onClick={handleEnroll}
                        sx={{ 
                          borderRadius: 2,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                      >
                        {course.IsPremium ? 'Buy Course' : 'Enroll Now'}
                      </Button>
                    </>
                  )}
                </Paper>
              )}
              
              {/* Content Preview */}
              {activeContent && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    mb: 4,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }}
                >
                  <Box sx={{ 
                    bgcolor: 'black', 
                    height: 400, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {activeContent.ContentType === 1 ? (
                      <>
                        {/* Video Content Preview */}
                        <IconButton
                          sx={{
                            bgcolor: 'white',
                            color: theme.palette.primary.main,
                            '&:hover': {
                              bgcolor: 'white',
                              transform: 'scale(1.1)'
                            },
                            width: 60,
                            height: 60
                          }}
                        >
                          <PlayIcon fontSize="large" />
                        </IconButton>
                        
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            left: 0, 
                            right: 0, 
                            p: 2, 
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white'
                          }}
                        >
                          {activeContent.Title}
                        </Typography>
                      </>
                    ) : activeContent.ContentType === 2 ? (
                      <Box sx={{ p: 4, bgcolor: 'white', width: '100%', height: '100%', overflow: 'auto' }}>
                        <Typography variant="h5" gutterBottom>
                          {activeContent.Title}
                        </Typography>
                        <Typography variant="body1">
                          {activeContent.ContentText || 'Article content would be displayed here.'}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', color: 'white' }}>
                        <QuizIcon fontSize="large" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                          Interactive Content
                        </Typography>
                        <Typography variant="body1">
                          {activeContent.Title}
                        </Typography>
                        <Button 
                          variant="contained" 
                          sx={{ mt: 2, borderRadius: 2 }}
                        >
                          Start Activity
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}
              
              {/* Tabs for Course Information */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}
              >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ px: 2 }}
                  >
                    <Tab label="Overview" id="course-tab-0" />
                    <Tab label="Content" id="course-tab-1" />
                    <Tab label="Reviews" id="course-tab-2" />
                    <Tab label="FAQ" id="course-tab-3" />
                  </Tabs>
                </Box>
                
                <TabPanel value={tabValue} index={0}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      About This Course
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {course.Description || 'Detailed course description would appear here.'}
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              What You'll Learn
                            </Typography>
                            <List sx={{ pl: 2 }}>
                              {[1, 2, 3, 4].map((item) => (
                                <ListItem key={item} sx={{ px: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <CheckIcon color="primary" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={`Learning objective ${item}`} 
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Requirements
                            </Typography>
                            <List sx={{ pl: 2 }}>
                              {[1, 2, 3].map((item) => (
                                <ListItem key={item} sx={{ px: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    <InfoIcon color="primary" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={`Requirement ${item}`} 
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        Instructor
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 60, height: 60, mr: 2 }}>
                          P
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Professor Smith
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Expert in {course.CategoryName}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      Course Contents
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {contents.length} lessons • {course.DurationMinutes} minutes total length
                    </Typography>
                    
                    <List>
                      {contents.map((content, index) => (
                        <ContentItem 
                          key={content.ContentID}
                          content={content}
                          isLocked={!enrollStatus.isEnrolled && index > 1} // First two are free previews
                          isActive={activeContent && activeContent.ContentID === content.ContentID}
                          progress={progress[content.ContentID] || 0}
                          onClick={() => handleContentClick(content)}
                        />
                      ))}
                    </List>
                  </Box>
                </TabPanel>
                
                <TabPanel value={tabValue} index={2}>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h5" fontWeight="bold">
                        Student Reviews
                      </Typography>
                      <Box>
                        <Button variant="outlined" sx={{ borderRadius: 2 }}>
                          Write a Review
                        </Button>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                      <Box sx={{ textAlign: 'center', mr: 3 }}>
                        <Typography variant="h2" fontWeight="bold" color="primary">
                          4.7
                        </Typography>
                        <Rating value={4.7} precision={0.1} readOnly sx={{ color: theme.palette.warning.main }} />
                        <Typography variant="body2" color="text.secondary">
                          123 Reviews
                        </Typography>
                      </Box>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        {[5, 4, 3, 2, 1].map(rating => {
                          const percentage = rating === 5 ? 70 : 
                                        rating === 4 ? 20 : 
                                        rating === 3 ? 7 : 
                                        rating === 2 ? 2 : 1;
                          return (
                            <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="body2" sx={{ minWidth: 15, mr: 1 }}>
                                {rating}
                              </Typography>
                              <StarIcon fontSize="small" sx={{ color: theme.palette.warning.main, mr: 1 }} />
                              <LinearProgress 
                                variant="determinate" 
                                value={percentage} 
                                sx={{ 
                                  flexGrow: 1, 
                                  height: 8, 
                                  borderRadius: 4,
                                  bgcolor: alpha(theme.palette.warning.main, 0.1)
                                }} 
                              />
                              <Typography variant="body2" sx={{ ml: 1, minWidth: 30 }}>
                                {percentage}%
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    {/* Sample Reviews */}
                    {[1, 2, 3].map(review => (
                      <Box key={review} sx={{ mb: 3, pb: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                          <Avatar sx={{ width: 48, height: 48, mr: 2 }}>
                            {String.fromCharCode(64 + review)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Student {review}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Rating value={6 - review} precision={1} readOnly size="small" sx={{ color: theme.palette.warning.main }} />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                {new Date(2024, 0, review).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Typography variant="body1">
                          This is a sample review for this course. Students would share their experiences and feedback about the content, instructor, and overall learning experience.
                        </Typography>
                      </Box>
                    ))}
                    
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button variant="outlined" sx={{ borderRadius: 2 }}>
                        Load More Reviews
                      </Button>
                    </Box>
                  </Box>
                </TabPanel>
                
                <TabPanel value={tabValue} index={3}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      Frequently Asked Questions
                    </Typography>
                    
                    {[1, 2, 3, 4].map(faq => (
                      <Accordion 
                        key={faq} 
                        elevation={0}
                        sx={{ 
                          border: `1px solid ${theme.palette.divider}`,
                          mb: 2,
                          borderRadius: 2,
                          '&:before': {
                            display: 'none',
                          },
                          '&.Mui-expanded': {
                            margin: 0,
                            mb: 2,
                          }
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          <Typography variant="subtitle1" fontWeight="medium">
                            Frequently Asked Question #{faq}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body1">
                            This is the answer to frequently asked question #{faq}. It provides helpful information about the course, requirements, or other common inquiries.
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                </TabPanel>
              </Paper>
            </Grid>
            
            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 80 }}>
                {/* Course Stats */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    mb: 4,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }}
                >
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Course Details
                    </Typography>
                    
                    <List sx={{ p: 0 }}>
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <LiveTvIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography variant="body2" color="text.secondary">
                              Content
                            </Typography>
                          } 
                          secondary={
                            <Typography variant="body1" fontWeight="medium">
                              {contents.length} lessons
                            </Typography>
                          }
                        />
                      </ListItem>
                      
                      <Divider component="li" />
                      
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <TimeIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography variant="body2" color="text.secondary">
                              Duration
                            </Typography>
                          } 
                          secondary={
                            <Typography variant="body1" fontWeight="medium">
                              {course.DurationMinutes} minutes
                            </Typography>
                          }
                        />
                      </ListItem>
                      
                      <Divider component="li" />
                      
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <AssignmentIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography variant="body2" color="text.secondary">
                              Difficulty
                            </Typography>
                          } 
                          secondary={
                            <Typography variant="body1" fontWeight="medium">
                              {getDifficultyLevel(course.DifficultyLevel)}
                            </Typography>
                          }
                        />
                      </ListItem>
                      
                      <Divider component="li" />
                      
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <SchoolIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography variant="body2" color="text.secondary">
                              Education Level
                            </Typography>
                          } 
                          secondary={
                            <Typography variant="body1" fontWeight="medium">
                              {getEducationLevel(course.EducationLevel)}
                            </Typography>
                          }
                        />
                      </ListItem>
                      
                      <Divider component="li" />
                      
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <StarIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography variant="body2" color="text.secondary">
                              Points
                            </Typography>
                          } 
                          secondary={
                            <Typography variant="body1" fontWeight="medium">
                              {course.Points} points to earn
                            </Typography>
                          }
                        />
                      </ListItem>
                    </List>
                  </Box>
                </Paper>
                
                {/* Enrollment Box */}
                {!isAuthenticated && (
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      overflow: 'hidden',
                      mb: 4,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      p: 3,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      bgcolor: alpha(theme.palette.primary.main, 0.02)
                    }}
                  >
                    <Typography variant="h6" gutterBottom fontWeight="bold" textAlign="center">
                      Ready to start learning?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} textAlign="center">
                      Sign in or create an account to enroll in this course and track your progress.
                    </Typography>
                    
                    <Button
                      fullWidth
                      variant="contained"
                      component={Link}
                      href="/auth/login"
                      sx={{ 
                        borderRadius: 2,
                        mb: 2,
                        py: 1.5,
                        boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                    >
                      Sign In
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      component={Link}
                      href="/auth/register"
                      sx={{ 
                        borderRadius: 2,
                        py: 1.5
                      }}
                    >
                      Create Account
                    </Button>
                  </Paper>
                )}
                
                {/* Related Courses */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    mb: 4
                  }}
                >
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Related Courses
                    </Typography>
                    
                    <List sx={{ p: 0 }}>
                      {[1, 2, 3].map(item => (
                        <ListItemButton 
                          key={item}
                          component={Link}
                          href={`/courses/${course.CourseID + item}`}
                          sx={{ 
                            px: 0, 
                            py: 2,
                            borderBottom: item !== 3 ? `1px solid ${theme.palette.divider}` : 'none',
                            borderRadius: 2
                          }}
                        >
                          <Box 
                            sx={{ 
                              width: 80, 
                              height: 60, 
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              borderRadius: 2,
                              mr: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <SchoolIcon color="primary" />
                          </Box>
                          <ListItemText 
                            primary={
                              <Typography variant="subtitle2" noWrap>
                                Related Course Title #{item}
                              </Typography>
                            } 
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {40 + item * 10} minutes
                                </Typography>
                                <Box 
                                  sx={{ 
                                    width: 4, 
                                    height: 4, 
                                    borderRadius: '50%', 
                                    bgcolor: 'text.disabled',
                                    mx: 0.5
                                  }} 
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {8 - item} lessons
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      ))}
                    </List>
                    
                    <Button
                      fullWidth
                      variant="text"
                      component={Link}
                      href="/courses"
                      sx={{ mt: 2 }}
                    >
                      View All Courses
                    </Button>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}