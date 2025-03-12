'use client';
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  useTheme,
  alpha,
  Avatar,
  Chip
} from '@mui/material';
import {
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  LocalActivity as NFTIcon,
  Timeline as ProgressIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Whatshot as WhatshotIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/app/auth/ProtectedRoute';
import Link from 'next/link';
import api from '@/services/api';

export default function DashboardPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // API'den dashboard verilerini alma
    const fetchDashboardData = async () => {
      try {
        // Gerçek uygulamada API'den alacağız
        setDashboardData({
          stats: {
            totalCourses: 8,
            completedCourses: 3,
            activeQuests: 4,
            completedQuests: 6,
            totalPoints: user?.Points || 750,
            nftCount: 4,
            streak: 12, // Günlük çalışma serisi
            level: 8, // Kullanıcı seviyesi
            skillPoints: {
              programming: 85,
              math: 60,
              science: 70,
              language: 45,
              business: 30
            }
          },
          recentCourses: [
            { id: 1, title: 'Introduction to Programming', progress: 75, category: 'Computer Science' },
            { id: 2, title: 'Advanced Mathematics', progress: 30, category: 'Mathematics' }
          ],
          recommendedCourses: [
            { id: 3, title: 'Data Structures', category: 'Computer Science', level: 'Intermediate' },
            { id: 4, title: 'Quantum Physics', category: 'Physics', level: 'Advanced' },
            { id: 5, title: 'Business Management', category: 'Business', level: 'Intermediate' }
          ],
          activeQuests: [
            { id: 1, title: 'Coding Challenge: Arrays', category: 'Computer Science', due: '2 days', difficulty: 'Medium' },
            { id: 2, title: 'Math Puzzle', category: 'Mathematics', due: '5 days', difficulty: 'Hard' }
          ],
          achievements: [
            { id: 1, title: 'First Course Completed', date: '2023-11-01', points: 50 },
            { id: 2, title: '10-Day Streak', date: '2023-11-12', points: 100 },
            { id: 3, title: 'Python Master', date: '2023-10-28', points: 200 }
          ]
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // SVG Patterns for background
  const SVGPattern = () => (
    <Box sx={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%',
      height: '100%',
      zIndex: 0,
      opacity: 0.5,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern1" patternUnits="userSpaceOnUse" width="100" height="100" patternTransform="rotate(45)">
            <circle cx="50" cy="50" r="10" fill="rgba(255,255,255,0.1)" />
          </pattern>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.05)' }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)' }} />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#pattern1)" />
        <rect width="100%" height="100%" fill="url(#gradient1)" />
      </svg>
    </Box>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ProtectedRoute>
      <Box sx={{ 
        position: 'relative',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.05)} 0%, ${alpha(theme.palette.secondary.dark, 0.1)} 100%)`,
        minHeight: '100vh',
        pt: { xs: 2, md: 4 },
        pb: { xs: 4, md: 6 }
      }}>
        {/* Animated Background Elements */}
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          {/* Floating Elements */}
          {[...Array(10)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: Math.random() * 20 + 10,
                height: Math.random() * 20 + 10,
                background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.05)`,
                borderRadius: '50%',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float${i % 3 + 1} ${Math.random() * 20 + 10}s infinite ease-in-out`,
                '@keyframes float1': {
                  '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                  '50%': { transform: 'translateY(-20px) rotate(10deg)' }
                },
                '@keyframes float2': {
                  '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                  '50%': { transform: 'translateY(20px) rotate(-10deg)' }
                },
                '@keyframes float3': {
                  '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
                  '50%': { transform: 'translateX(20px) rotate(10deg)' }
                }
              }}
            />
          ))}
        </Box>
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Welcome Section */}
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              borderRadius: 4,
              overflow: 'hidden',
              mb: { xs: 4, md: 5 },
              p: { xs: 3, md: 4 },
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.dark})`,
              color: 'white',
            }}
          >
            <SVGPattern />
            
            <Box sx={{ position: 'relative', zIndex: 1, width: { xs: '100%', md: '60%' } }}>
              <Typography 
                variant="h4" 
                component="h1" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                Welcome back, {user?.FirstName || user?.Username}!
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                Continue your learning journey. You're making great progress!
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Chip 
                  icon={<WhatshotIcon />} 
                  label={`${dashboardData.stats.streak} Day Streak`} 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white',
                    fontWeight: 'bold',
                    '& .MuiChip-icon': { color: 'white' }
                  }} 
                />
                <Chip 
                  icon={<StarIcon />} 
                  label={`Level ${dashboardData.stats.level}`} 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white',
                    fontWeight: 'bold',
                    '& .MuiChip-icon': { color: 'white' }
                  }} 
                />
                <Chip 
                  icon={<TrendingUpIcon />} 
                  label={`${dashboardData.stats.totalPoints} Points`} 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white',
                    fontWeight: 'bold',
                    '& .MuiChip-icon': { color: 'white' }
                  }} 
                />
              </Box>
            </Box>
            
            {/* Circular Progress */}
            <Box sx={{ 
              position: 'relative', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: { xs: 4, md: 0 }
            }}>
              <Box sx={{ position: 'relative', width: 150, height: 150 }}>
                <Box sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <Typography variant="h4" fontWeight="bold">
                    {Math.round((dashboardData.stats.completedCourses / (dashboardData.stats.completedCourses + dashboardData.stats.totalCourses - dashboardData.stats.completedCourses)) * 100)}%
                  </Typography>
                  <Typography variant="body2">Overall Progress</Typography>
                </Box>
                
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle
                    cx="75"
                    cy="75"
                    r="65"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="75"
                    cy="75"
                    r="65"
                    fill="none"
                    stroke="white"
                    strokeWidth="10"
                    strokeDasharray="408"
                    strokeDashoffset={408 - (408 * (dashboardData.stats.completedCourses / (dashboardData.stats.completedCourses + dashboardData.stats.totalCourses - dashboardData.stats.completedCourses)))}
                    strokeLinecap="round"
                    transform="rotate(-90 75 75)"
                  />
                </svg>
              </Box>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                Keep going to reach your goals!
              </Typography>
            </Box>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                <Box sx={{ 
                  height: 4, 
                  bgcolor: theme.palette.primary.main,
                  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                }} />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                  }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Courses
                    </Typography>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                      <SchoolIcon />
                    </Avatar>
                  </Box>
                  
                  <Typography component="p" variant="h4" fontWeight="bold">
                    {dashboardData.stats.completedCourses}/{dashboardData.stats.totalCourses}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.success.main, mt: 1 }}>
                    <TrendingUpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    {((dashboardData.stats.completedCourses / dashboardData.stats.totalCourses) * 100).toFixed(0)}% completion rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ 
                  height: 4, 
                  bgcolor: theme.palette.secondary.main,
                  background: `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`
                }} />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                  }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Quests
                    </Typography>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}>
                      <QuestIcon />
                    </Avatar>
                  </Box>
                  
                  <Typography component="p" variant="h4" fontWeight="bold">
                    {dashboardData.stats.completedQuests}/{dashboardData.stats.activeQuests + dashboardData.stats.completedQuests}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.success.main, mt: 1 }}>
                    <TrendingUpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    {((dashboardData.stats.completedQuests / (dashboardData.stats.activeQuests + dashboardData.stats.completedQuests)) * 100).toFixed(0)}% completion rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ 
                  height: 4, 
                  bgcolor: theme.palette.warning.main,
                  background: `linear-gradient(to right, ${theme.palette.warning.main}, ${theme.palette.warning.light})`
                }} />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                  }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Points
                    </Typography>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                      <StarIcon />
                    </Avatar>
                  </Box>
                  
                  <Typography component="p" variant="h4" fontWeight="bold">
                    {dashboardData.stats.totalPoints}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <Box component="span" sx={{ 
                      display: 'inline-block', 
                      px: 1, 
                      py: 0.5, 
                      borderRadius: 1, 
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.dark,
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      LEVEL {dashboardData.stats.level}
                    </Box>
                    <Box component="span" sx={{ ml: 1 }}>
                      +250 points to next level
                    </Box>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ 
                  height: 4, 
                  bgcolor: theme.palette.success.main,
                  background: `linear-gradient(to right, ${theme.palette.success.main}, ${theme.palette.success.light})`
                }} />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                  }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      NFTs
                    </Typography>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                      <NFTIcon />
                    </Avatar>
                  </Box>
                  
                  <Typography component="p" variant="h4" fontWeight="bold">
                    {dashboardData.stats.nftCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.success.main, mt: 1 }}>
                    <TrendingUpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    3 new NFTs available to earn
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* Recent Courses */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Continue Learning
                  </Typography>
                </Box>
                
                {dashboardData.recentCourses.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {dashboardData.recentCourses.map((course) => (
                      <ListItem key={course.id} disablePadding>
                        <ListItemButton 
                          component={Link} 
                          href={`/courses/${course.id}`}
                          sx={{ 
                            py: 2,
                            px: 3,
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.05)
                            }
                          }}
                        >
                          <ListItemIcon sx={{ 
                            minWidth: 40,
                            color: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <SchoolIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={course.title}
                            secondary={
                                <Box sx={{ mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary" component="div">
                                    {course.category} • Progress: {course.progress}%
                                </Typography>
                                <Box sx={{
                                    width: '100%',
                                    height: 4,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    borderRadius: 2,
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{
                                    width: `${course.progress}%`,
                                    height: '100%',
                                    bgcolor: theme.palette.primary.main,
                                    borderRadius: 2
                                    }} />
                                </Box>
                                </Box>
                            }
                            primaryTypographyProps={{ fontWeight: 'medium' }}
                            />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1">
                      You haven't started any courses yet.
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ p: 2, pt: 0, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
                  <Button 
                    component={Link} 
                    href="/courses"
                    sx={{ borderRadius: 2 }}
                  >
                    View All Courses
                  </Button>
                </Box>
              </Card>
            </Grid>

            {/* Active Quests */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Active Quests
                  </Typography>
                </Box>
                
                {dashboardData.activeQuests.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {dashboardData.activeQuests.map((quest) => (
                      <ListItem key={quest.id} disablePadding>
                        <ListItemButton 
                          component={Link} 
                          href={`/quests/${quest.id}`}
                          sx={{ 
                            py: 2,
                            px: 3,
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.secondary.main, 0.05)
                            }
                          }}
                        >
                          <ListItemIcon sx={{ 
                            minWidth: 40,
                            color: theme.palette.secondary.main,
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <QuestIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={quest.title}
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {quest.category}
                                </Typography>
                                <Box sx={{ 
                                  width: 4,
                                  height: 4,
                                  borderRadius: '50%',
                                  bgcolor: 'text.disabled',
                                  mx: 1
                                }} />
                                <Typography variant="body2" color="text.secondary">
                                  {quest.difficulty} Difficulty
                                </Typography>
                                <Box sx={{ 
                                  width: 4,
                                  height: 4,
                                  borderRadius: '50%',
                                  bgcolor: 'text.disabled',
                                  mx: 1
                                }} />
                                <Typography 
                                  variant="body2" 
                                  color={quest.due.includes('1') ? 'error.main' : 'text.secondary'}
                                  fontWeight={quest.due.includes('1') ? 'bold' : 'normal'}
                                >
                                  Due: {quest.due}
                                </Typography>
                              </Box>
                            }
                            primaryTypographyProps={{ fontWeight: 'medium' }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1">
                      No active quests at the moment.
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ p: 2, pt: 0, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
                  <Button 
                    component={Link} 
                    href="/quests"
                    sx={{ borderRadius: 2 }}
                  >
                    View All Quests
                  </Button>
                </Box>
              </Card>
            </Grid>

            {/* Recent Achievements */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Recent Achievements
                  </Typography>
                </Box>
                
                {dashboardData.achievements.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {dashboardData.achievements.map((achievement) => (
                      <ListItem key={achievement.id} sx={{ px: 3, py: 2 }}>
                        <ListItemIcon sx={{ 
                          minWidth: 40,
                          color: theme.palette.warning.main,
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <StarIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={achievement.title}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(achievement.date).toLocaleDateString()}
                              </Typography>
                              <Chip 
                                label={`+${achievement.points} points`}
                                size="small"
                                sx={{ 
                                  ml: 1,
                                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                                  color: theme.palette.warning.dark,
                                  fontWeight: 'bold'
                                }}
                              />
                            </Box>
                          }
                          primaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                        <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1">
                      No achievements yet. Keep learning to earn achievements!
                    </Typography>
                  </Box>
                )}
              </Card>
            </Grid>

            {/* Skill Progress */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Your Skills
                  </Typography>
                </Box>
                
                <Box sx={{ p: 3 }}>
                  {Object.entries(dashboardData.stats.skillPoints).map(([skill, points]) => (
                    <Box key={skill} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                          {skill}
                        </Typography>
                        <Typography variant="body2">
                          {points}/100
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        width: '100%', 
                        height: 8, 
                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: `${points}%`, 
                          height: '100%', 
                          bgcolor: getSkillColor(skill, theme),
                          borderRadius: 4
                        }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
                
                <Box sx={{ p: 3, pt: 0, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Complete more courses and quests to improve your skills!
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Recommended Courses */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Recommended for You
                  </Typography>
                </Box>
                
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {dashboardData.recommendedCourses.map((course) => (
                      <Grid item key={course.id} xs={12} sm={6} md={4}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            borderRadius: 3,
                            boxShadow: `0 5px 15px rgba(0, 0, 0, 0.08)`,
                            overflow: 'hidden',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: `0 10px 20px rgba(0, 0, 0, 0.12)`,
                            }
                          }}
                        >
                          <Box sx={{ 
                            height: 8, 
                            bgcolor: getCategoryColor(course.category, theme)
                          }} />
                          <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {course.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                {course.category}
                              </Typography>
                              <Box sx={{ 
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                bgcolor: 'text.disabled',
                                mx: 1
                              }} />
                              <Typography variant="body2" color="text.secondary">
                                {course.level}
                              </Typography>
                            </Box>
                          </CardContent>
                          <CardActions sx={{ px: 2, pb: 2 }}>
                            <Button 
                              fullWidth
                              variant="outlined"
                              size="small" 
                              component={Link}
                              href={`/courses/${course.id}`}
                              sx={{ borderRadius: 2 }}
                            >
                              View Course
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}

// Yetenek rengini döndürür
function getSkillColor(skill, theme) {
  const skillColors = {
    programming: theme.palette.primary.main,
    math: theme.palette.secondary.main,
    science: theme.palette.warning.main,
    language: theme.palette.success.main,
    business: theme.palette.error.main
  };
  return skillColors[skill] || theme.palette.grey[500];
}

// Kategori rengini döndürür
function getCategoryColor(category, theme) {
  const categoryColors = {
    'Computer Science': theme.palette.primary.main,
    'Mathematics': theme.palette.secondary.main,
    'Physics': theme.palette.warning.main,
    'Business': theme.palette.error.main,
    'Languages': theme.palette.success.main
  };
  return categoryColors[category] || theme.palette.grey[500];
}