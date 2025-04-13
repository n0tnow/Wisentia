'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
  Button,
  Avatar,
  Chip,
  Tab,
  Tabs,
  LinearProgress,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Tooltip,
  Alert,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExtensionIcon from '@mui/icons-material/Extension';
import TokenIcon from '@mui/icons-material/Token';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RecommendIcon from '@mui/icons-material/Recommend';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TimelineIcon from '@mui/icons-material/Timeline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import LockIcon from '@mui/icons-material/Lock';
import InfoIcon from '@mui/icons-material/Info';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import BarChartIcon from '@mui/icons-material/BarChart';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function DashboardPage() {
  const { user, isAuthenticated, authChecked } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [subscriptionDialog, setSubscriptionDialog] = useState(false);
  const authCheckRef = useRef(false);
  
  // Dashboard data states
  const [stats, setStats] = useState(null);
  const [learningProgress, setLearningProgress] = useState(null);
  const [timeSpent, setTimeSpent] = useState(null);
  const [activitySummary, setActivitySummary] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [aiAnalytics, setAiAnalytics] = useState(null);
  
  const theme = useTheme();
  
  // Check subscription status
  useEffect(() => {
    if (user) {
      // Check user's subscription status
      // This is a simple date check, in a real app use backend data
      if (user.subscriptionEndDate) {
        try {
          const endDate = new Date(user.subscriptionEndDate);
          setSubscriptionActive(endDate > new Date());
        } catch (e) {
          console.error("Error processing subscription date:", e);
          setSubscriptionActive(false);
        }
      } else {
        setSubscriptionActive(false);
      }
    }
  }, [user]);
  
  // Load dashboard data only once auth is checked
  useEffect(() => {
    // Prevent infinite redirects - only check auth status once
    if (!authChecked) return;
    
    if (!isAuthenticated && authCheckRef.current) {
      router.push('/login');
      return;
    }
    
    // Mark that we've checked authentication
    authCheckRef.current = true;
    
    if (!isAuthenticated) return;
    
    // Function to load all data
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Loading dashboard with mock data");
        
        // Mock stats veri
        const mockStats = {
          completedCourses: 5,
          completedVideos: 32,
          completedQuests: 8,
          earnedNFTs: 4,
          totalPoints: 1450,
          streakDays: 7
        };
        setStats(mockStats);
        
        // Mock learning progress veri
        const mockLearningProgress = {
          ongoingCourses: [
            {
              CourseID: 1,
              Title: "Blockchain Fundamentals",
              CompletionPercentage: 65,
              LastAccessDate: new Date().toISOString(),
              Category: "Blockchain",
              Difficulty: "intermediate",
              ThumbnailURL: null
            },
            {
              CourseID: 2,
              Title: "Web3 Development",
              CompletionPercentage: 30,
              LastAccessDate: new Date().toISOString(),
              Category: "Development",
              Difficulty: "advanced",
              ThumbnailURL: null
            }
          ],
          completedCourses: [
            {
              CourseID: 3,
              Title: "Crypto Basics",
              CompletionDate: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
              Category: "Cryptocurrency",
              Difficulty: "beginner",
              Rating: 4.5,
              ThumbnailURL: null
            }
          ],
          ongoingQuests: [
            {
              QuestID: 1,
              Title: "Blockchain Explorer",
              DifficultyLevel: "medium",
              CurrentProgress: 70,
              RequiredPoints: 100
            },
            {
              QuestID: 2,
              Title: "Smart Contract Master",
              DifficultyLevel: "hard",
              CurrentProgress: 30,
              RequiredPoints: 150
            }
          ],
          categoryStats: {
            "Blockchain": 3,
            "Development": 2,
            "Cryptocurrency": 1,
            "Web3": 2
          }
        };
        setLearningProgress(mockLearningProgress);
        
        // Mock time spent veri
        const mockTimeSpent = {
          totalHours: 45,
          lastWeekHours: 8,
          dailyAverage: 1.2,
          weekdayDistribution: {
            "Monday": 2.5,
            "Tuesday": 1.5,
            "Wednesday": 1.8,
            "Thursday": 2.0,
            "Friday": 1.2,
            "Saturday": 3.5,
            "Sunday": 2.0
          }
        };
        setTimeSpent(mockTimeSpent);
        
        // Mock activity summary 
        const mockActivitySummary = {
          recentActivities: [
            {
              id: 1,
              type: "course_completion",
              description: "Completed 'Crypto Basics' course",
              timestamp: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
              points: 200
            },
            {
              id: 2,
              type: "quest_progress",
              description: "Made progress on 'Blockchain Explorer' quest",
              timestamp: new Date(Date.now() - 1*24*60*60*1000).toISOString(),
              points: 50
            },
            {
              id: 3,
              type: "video_watched",
              description: "Watched 'Smart Contract Introduction'",
              timestamp: new Date(Date.now() - 12*60*60*1000).toISOString(),
              points: 10
            }
          ],
          monthlyPointsEarned: 350,
          weeklyPointsEarned: 120
        };
        setActivitySummary(mockActivitySummary);
        
        // Mock AI recommendations (premium content)
        if (subscriptionActive) {
          const mockAiRecommendations = [
            {
              RecommendationID: 1,
              RecommendationType: "course",
              TargetID: 4,
              RecommendationReason: "Based on your interest in blockchain",
              Confidence: 0.85,
              target: {
                title: "Smart Contract Development",
                category: "Development",
                difficulty: "advanced",
                thumbnailURL: null
              }
            },
            {
              RecommendationID: 2,
              RecommendationType: "course",
              TargetID: 5,
              RecommendationReason: "Popular among users with similar learning patterns",
              Confidence: 0.78,
              target: {
                title: "NFT Marketplace Creation",
                category: "Blockchain",
                difficulty: "intermediate",
                thumbnailURL: null
              }
            },
            {
              RecommendationID: 3,
              RecommendationType: "course",
              TargetID: 6,
              RecommendationReason: "Complements your completed courses",
              Confidence: 0.92,
              target: {
                title: "Web3 Authentication",
                category: "Development",
                difficulty: "intermediate",
                thumbnailURL: null
              }
            }
          ];
          setAiRecommendations(mockAiRecommendations);
          
          const mockAiAnalytics = {
            learningStyle: "Visual",
            strengthAreas: JSON.stringify(["Blockchain Concepts", "Cryptocurrency Fundamentals", "DApp Development"]),
            weaknessAreas: JSON.stringify(["Smart Contract Security", "Solidity Advanced Features", "Cross-chain Technology"])
          };
          setAiAnalytics(mockAiAnalytics);
        }
        
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [isAuthenticated, authChecked]); // Remove subscriptionActive from dependencies
  
  // API call functions
  const fetchUserStats = async () => {
    try {
      // Backend API'ye erişmeye çalış
      try {
        const response = await fetch(`${API_BASE_URL}/analytics/user-stats/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (apiError) {
        console.error("User stats API error:", apiError);
        
        // Mock veri kullan
        console.log("Using mock user stats data");
        const mockStats = {
          completedCourses: 5,
          completedVideos: 32,
          completedQuests: 8,
          earnedNFTs: 4,
          totalPoints: 1450,
          streakDays: 7
        };
        
        setStats(mockStats);
      }
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      throw error;
    }
  };
  
  const fetchLearningProgress = async () => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/analytics/learning-progress/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setLearningProgress(data);
      } catch (apiError) {
        console.error("Learning progress API error:", apiError);
        
        // Mock veri
        const mockLearningProgress = {
          ongoingCourses: [
            {
              CourseID: 1,
              Title: "Blockchain Fundamentals",
              CompletionPercentage: 65,
              LastAccessDate: new Date().toISOString(),
              Category: "Blockchain",
              Difficulty: "intermediate",
              ThumbnailURL: null
            },
            {
              CourseID: 2,
              Title: "Web3 Development",
              CompletionPercentage: 30,
              LastAccessDate: new Date().toISOString(),
              Category: "Development",
              Difficulty: "advanced",
              ThumbnailURL: null
            }
          ],
          completedCourses: [
            {
              CourseID: 3,
              Title: "Crypto Basics",
              CompletionDate: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
              Category: "Cryptocurrency",
              Difficulty: "beginner",
              Rating: 4.5,
              ThumbnailURL: null
            }
          ],
          ongoingQuests: [
            {
              QuestID: 1,
              Title: "Blockchain Explorer",
              DifficultyLevel: "medium",
              CurrentProgress: 70,
              RequiredPoints: 100
            },
            {
              QuestID: 2,
              Title: "Smart Contract Master",
              DifficultyLevel: "hard",
              CurrentProgress: 30,
              RequiredPoints: 150
            }
          ],
          categoryStats: {
            "Blockchain": 3,
            "Development": 2,
            "Cryptocurrency": 1,
            "Web3": 2
          }
        };
        
        setLearningProgress(mockLearningProgress);
      }
    } catch (error) {
      console.error("Error fetching learning progress:", error);
      throw error;
    }
  };
  
  const fetchTimeSpent = async () => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/analytics/time-spent/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setTimeSpent(data);
      } catch (apiError) {
        console.error("Time spent API error:", apiError);
        
        // Mock veri
        const mockTimeSpent = {
          totalHours: 45,
          lastWeekHours: 8,
          dailyAverage: 1.2,
          weekdayDistribution: {
            "Monday": 2.5,
            "Tuesday": 1.5,
            "Wednesday": 1.8,
            "Thursday": 2.0,
            "Friday": 1.2,
            "Saturday": 3.5,
            "Sunday": 2.0
          }
        };
        
        setTimeSpent(mockTimeSpent);
      }
    } catch (error) {
      console.error("Error fetching time statistics:", error);
      throw error;
    }
  };
  
  const fetchActivitySummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/user-activity-summary/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setActivitySummary(data);
    } catch (error) {
      console.error("Error fetching activity summary:", error);
      throw error;
    }
  };
  
  const fetchAiRecommendations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/recommendations/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setAiRecommendations(data);
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
      // This error won't prevent dashboard from working, just the AI recommendations section won't be shown
      setAiRecommendations(null);
    }
  };
  
  const fetchAiAnalytics = async () => {
    try {
      // This endpoint might be different in your actual API
      const response = await fetch(`${API_BASE_URL}/ai/user-analytics/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setAiAnalytics(data);
    } catch (error) {
      console.error("Error fetching AI analytics:", error);
      // This error won't prevent dashboard from working, just the AI analytics section won't be shown
      setAiAnalytics(null);
    }
  };
  
  const dismissRecommendation = async (recommendationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/recommendations/${recommendationId}/dismiss/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // If successful, reload recommendations
      await fetchAiRecommendations();
    } catch (error) {
      console.error("Error dismissing recommendation:", error);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const formatCompletionDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString || 'Unknown';
    }
  };
  
  const handleSubscriptionClick = () => {
    setSubscriptionDialog(true);
  };
  
  // Loading state
  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading dashboard data...
        </Typography>
      </Container>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ mb: 4 }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Failed to Load Data
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          startIcon={<RefreshIcon />}
        >
          Try Again
        </Button>
      </Container>
    );
  }
  
  // User not authenticated
  if (!isAuthenticated && authChecked) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="warning">
          You need to log in to view your dashboard data.
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => router.push('/login')}
        >
          Log In
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Title and Welcome Message */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.15)})`,
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: 150,
            height: 150,
            background: `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
            transform: 'translate(30%, -30%)',
            borderRadius: '50%'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Welcome, <Box component="span" fontWeight="bold">{user?.username || 'Guest'}</Box>! 
              Here's your learning progress.
            </Typography>
          </Box>
          
          {user && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Box sx={{ mr: 2, textAlign: 'right' }}>
                <Typography variant="body2" fontWeight="bold">Level {user?.Level || 1}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats?.totalPoints || 0} XP
                </Typography>
              </Box>
              <Avatar 
                alt={user?.username} 
                src={user?.profileImage} 
                sx={{ 
                  width: 60, 
                  height: 60,
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              />
            </Box>
          )}
        </Box>
        
        {/* Learning Streak */}
        {stats?.streakDays > 0 && (
          <Chip
            icon={<LocalFireDepartmentIcon />}
            label={`${stats.streakDays}-day learning streak!`}
            color="warning"
            variant="outlined"
            sx={{ 
              mt: 2, 
              fontWeight: 'bold',
              borderWidth: 2,
              '& .MuiChip-icon': { color: 'warning.main' }
            }}
          />
        )}
      </Paper>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SchoolIcon color="primary" fontSize="large" />
              <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                {stats?.completedCourses || 0} / {learningProgress?.ongoingCourses?.length + (stats?.completedCourses || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Courses Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEventsIcon color="primary" fontSize="large" />
              <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                {stats?.completedQuests || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quests Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TokenIcon color="primary" fontSize="large" />
              <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                {stats?.earnedNFTs || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                NFTs Owned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ 
            height: '100%',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon color="primary" fontSize="large" />
              <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                {stats?.totalPoints || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Points Earned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* AI Insights - Premium Content */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.info.main, subscriptionActive ? 0.3 : 0.1)}`,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s ease',
          filter: !subscriptionActive ? 'grayscale(0.5)' : 'none',
          opacity: !subscriptionActive ? 0.8 : 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PsychologyIcon sx={{ color: 'info.main', mr: 1, fontSize: 28 }} />
          <Typography variant="h5" fontWeight="bold">
            AI Insights
          </Typography>
          
          {!subscriptionActive && (
            <Chip 
              icon={<LockIcon />}
              label="Premium" 
              size="small" 
              color="warning" 
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        
        {!subscriptionActive ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" paragraph>
              AI insights and personalized learning recommendations are exclusive to premium members.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSubscriptionClick}
              sx={{ 
                borderRadius: 8,
                px: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              Go Premium
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Learning Style */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', boxShadow: 'none', border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" color="info.main" gutterBottom>
                    Learning Style
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexDirection: 'column',
                    py: 2
                  }}>
                    <Avatar 
                      sx={{ 
                        width: 70, 
                        height: 70, 
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: 'info.main',
                        mb: 1
                      }}
                    >
                      {aiAnalytics?.learningStyle?.[0] || '?'}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      {aiAnalytics?.learningStyle || 'Not Analyzed'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                      {aiAnalytics?.learningStyle === 'Visual' && 'You learn better with visual content.'}
                      {aiAnalytics?.learningStyle === 'Auditory' && 'You learn better with auditory content.'}
                      {aiAnalytics?.learningStyle === 'Reading' && 'You learn better by reading.'}
                      {aiAnalytics?.learningStyle === 'Kinesthetic' && 'You learn better by doing.'}
                      {!aiAnalytics?.learningStyle && 'Complete more lessons to determine your learning style.'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Strengths */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', boxShadow: 'none', border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" color="success.main" gutterBottom>
                    Your Strengths
                  </Typography>
                  
                  {aiAnalytics?.strengthAreas?.length > 0 ? (
                    <List dense sx={{ py: 1 }}>
                      {JSON.parse(aiAnalytics?.strengthAreas || '[]').slice(0, 3).map((area, index) => (
                        <ListItem key={index}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                              <CheckCircleOutlineIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={area} 
                            secondary={`${90 - index * 5}% success rate`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Not enough data yet. Complete more courses to determine your strengths.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Areas to Improve */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', boxShadow: 'none', border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" color="warning.main" gutterBottom>
                    Areas to Improve
                  </Typography>
                  
                  {aiAnalytics?.weaknessAreas?.length > 0 ? (
                    <List dense sx={{ py: 1 }}>
                      {JSON.parse(aiAnalytics?.weaknessAreas || '[]').slice(0, 3).map((area, index) => (
                        <ListItem key={index}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
                              <ErrorOutlineIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={area} 
                            secondary={`${60 - index * 10}% completion rate`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Not enough data yet. Complete more courses to determine areas for improvement.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>
      
      {/* Active Quests */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <ExtensionIcon sx={{ mr: 1 }} />
          Active Quests
        </Typography>
        <Grid container spacing={3}>
          {learningProgress?.ongoingQuests?.length > 0 ? (
            learningProgress.ongoingQuests.map((quest) => (
              <Grid item xs={12} sm={6} key={quest.QuestID}>
                <Card sx={{ 
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mr: 1.5 }}>
                        <ExtensionIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {quest.Title}
                        </Typography>
                        <Chip 
                          label={quest.DifficultyLevel} 
                          size="small" 
                          color={
                            quest.DifficultyLevel === 'easy' ? 'success' : 
                            quest.DifficultyLevel === 'hard' ? 'error' : 'warning'
                          }
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Progress:</span>
                        <span>{quest.CurrentProgress} / {quest.RequiredPoints} points</span>
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(quest.CurrentProgress / quest.RequiredPoints) * 100} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Tooltip title="Reward for completing this quest">
                          <Chip 
                            icon={<EmojiEventsIcon />}
                            label={`${quest.RequiredPoints * 2} Points Reward`}
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        </Tooltip>
                      </Box>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => router.push(`/quests/${quest.QuestID}`)}
                        endIcon={<DoubleArrowIcon />}
                      >
                        View Quest
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  px: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`
                }}
              >
                <Typography variant="body1" paragraph>
                  You don't have any active quests yet.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => router.push('/quests')}
                >
                  Explore Quests
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
      
      {/* Recommended Courses - Premium Content */}
      {subscriptionActive && aiRecommendations?.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <RecommendIcon sx={{ mr: 1 }} />
            Recommended Courses
            <Chip 
              label="AI" 
              size="small" 
              color="info" 
              sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 1, py: 0.1 } }}
            />
          </Typography>
          <Grid container spacing={3}>
            {aiRecommendations.filter(r => r.RecommendationType === 'course').slice(0, 3).map((recommendation) => (
              <Grid item xs={12} sm={4} key={recommendation.RecommendationID}>
                <Card sx={{ 
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  },
                  position: 'relative',
                  overflow: 'visible'
                }}>
                  {/* Match Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      zIndex: 1,
                      bgcolor: 'info.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      boxShadow: 2
                    }}
                  >
                    {Math.round(recommendation.Confidence * 100)}%
                  </Box>
                  
                  <Box 
                    component="img"
                    src={recommendation.target?.thumbnailURL || '/placeholder-course.jpg'}
                    alt={recommendation.target?.title}
                    sx={{
                      width: '100%',
                      height: 140,
                      objectFit: 'cover'
                    }}
                  />
                  
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {recommendation.target?.title}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={recommendation.target?.category} 
                        size="small" 
                        color="primary"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip 
                        label={recommendation.target?.difficulty} 
                        size="small" 
                        color={
                          recommendation.target?.difficulty === 'beginner' ? 'success' : 
                          recommendation.target?.difficulty === 'advanced' ? 'error' : 'warning'
                        }
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Reason:</strong> {recommendation.RecommendationReason}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Button
                        size="small"
                        onClick={() => dismissRecommendation(recommendation.RecommendationID)}
                        sx={{ color: 'text.secondary' }}
                      >
                        Dismiss
                      </Button>
                      
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={() => router.push(`/courses/${recommendation.TargetID}`)}
                      >
                        View Course
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Course Progress */}
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            mb: 3,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 1.5,
            },
            '& .MuiTab-root': {
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              minHeight: 48
            },
          }}
        >
          <Tab label="In Progress" icon={<SchoolIcon />} iconPosition="start" />
          <Tab label="Completed" icon={<VerifiedIcon />} iconPosition="start" />
        </Tabs>
        
        <Grid container spacing={3}>
          {activeTab === 0 ? (
            learningProgress?.ongoingCourses?.length > 0 ? (
              learningProgress.ongoingCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.CourseID}>
                  <Card sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}>
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={course.ThumbnailURL || `/placeholder-course${course.CourseID % 5 + 1}.jpg`}
                        alt={course.Title}
                        sx={{
                          width: '100%',
                          height: 140,
                          objectFit: 'cover'
                        }}
                      />
                      <Box sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        width: '100%', 
                        p: 1,
                        backgroundColor: 'rgba(0,0,0,0.7)'
                      }}>
                        <LinearProgress
                          variant="determinate"
                          value={course.CompletionPercentage}
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                            }
                          }}
                        />
                      </Box>
                      
                      <Chip 
                        label={course.Category} 
                        size="small"
                        color="primary"
                        sx={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10,
                          backgroundColor: alpha(theme.palette.primary.main, 0.8)
                        }} 
                      />
                    </Box>
                    
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {course.Title}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Last viewed: {new Date(course.LastAccessDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="caption" fontWeight="bold" color="primary">
                          {Math.round(course.CompletionPercentage)}%
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={`Difficulty: ${course.Difficulty}`}
                        size="small"
                        color={
                          course.Difficulty === 'beginner' ? 'success' : 
                          course.Difficulty === 'advanced' ? 'error' : 'warning'
                        }
                        sx={{ mb: 2 }}
                      />
                      
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        startIcon={<PlayArrowIcon />}
                        sx={{ 
                          mt: 1,
                          borderRadius: '8px',
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                          transition: 'all 0.3s',
                          '&:hover': {
                            boxShadow: `0 6px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                          }
                        }}
                        onClick={() => router.push(`/courses/${course.CourseID}`)}
                      >
                        Continue
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    px: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                    border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`
                  }}
                >
                  <Typography variant="body1" paragraph>
                    You haven't started any courses yet.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => router.push('/courses')}
                  >
                    Explore Courses
                  </Button>
                </Paper>
              </Grid>
            )
          ) : (
            learningProgress?.completedCourses?.length > 0 ? (
              learningProgress.completedCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.CourseID}>
                  <Card sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}>
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src={course.ThumbnailURL || `/placeholder-course${course.CourseID % 5 + 1}.jpg`}
                        alt={course.Title}
                        sx={{
                          width: '100%',
                          height: 140,
                          objectFit: 'cover',
                          filter: 'brightness(0.9)',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette.success.main, 0.3),
                        }}
                      >
                        <Chip
                          icon={<VerifiedIcon />}
                          label="COMPLETED"
                          color="success"
                          sx={{ 
                            fontWeight: 'bold',
                            bgcolor: alpha(theme.palette.success.main, 0.9),
                          }}
                        />
                      </Box>
                      
                      <Chip 
                        label={course.Category} 
                        size="small"
                        color="primary"
                        sx={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10,
                          backgroundColor: alpha(theme.palette.primary.main, 0.8)
                        }} 
                      />
                    </Box>
                    
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {course.Title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Completed: {formatCompletionDate(course.CompletionDate)}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {[...Array(5)].map((_, i) => (
                            <StarIcon 
                              key={i} 
                              fontSize="small" 
                              sx={{ 
                                color: i < Math.floor(course.Rating || 4.5) ? 'warning.main' : alpha(theme.palette.warning.main, 0.3),
                                fontSize: '18px'
                              }} 
                            />
                          ))}
                        </Box>
                      </Box>
                      
                      <Chip 
                        label={`Difficulty: ${course.Difficulty}`}
                        size="small"
                        color={
                          course.Difficulty === 'beginner' ? 'success' : 
                          course.Difficulty === 'advanced' ? 'error' : 'warning'
                        }
                        sx={{ mb: 2 }}
                      />
                      
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={() => router.push(`/courses/${course.CourseID}`)}
                      >
                        Review Course
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    px: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                    border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`
                  }}
                >
                  <Typography variant="body1">
                    You haven't completed any courses yet.
                  </Typography>
                </Paper>
              </Grid>
            )
          )}
        </Grid>
        
        {/* Category Statistics */}
        {learningProgress?.categoryStats && Object.keys(learningProgress.categoryStats).length > 0 && (
          <Paper sx={{ mt: 3, p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
              <BarChartIcon sx={{ mr: 1 }} />
              Category Statistics
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {Object.entries(learningProgress.categoryStats).map(([category, count]) => (
                <Grid item xs={6} sm={4} md={3} key={category}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                  }}>
                    <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                      {count}
                    </Typography>
                    <Typography variant="body2" align="center">
                      {category}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>
      
      {/* Premium Subscription Dialog */}
      <Dialog
        open={subscriptionDialog}
        onClose={() => setSubscriptionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" fontWeight="bold">
            Upgrade to Premium
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            With Premium subscription, you can enjoy these benefits:
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <PsychologyIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="AI Analysis" 
                secondary="Personalized learning analytics and recommendations" 
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  <LightbulbIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="Exclusive Content" 
                secondary="Access to premium courses and content" 
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <TokenIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="Special NFTs" 
                secondary="NFTs exclusive to premium members" 
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setSubscriptionDialog(false)}>Later</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setSubscriptionDialog(false);
              router.push('/subscription');
            }}
            sx={{ 
              borderRadius: 8,
              px: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            View Subscription Plans
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}