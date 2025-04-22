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
  Tooltip,
  Container,
  useMediaQuery,
  Grow,
  SwipeableDrawer
} from '@mui/material';

// MUI icons
// Düzeltilmiş import bölümü:
// MUI icons
import {
  EmojiEvents as QuestIcon,
  Send as SendIcon,
  Category as CategoryIcon,
  Stars as DifficultyIcon,
  Timer as TimerIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  ArrowBack as BackIcon,
  AssignmentTurnedIn as TaskAltIcon, // Bu satırı değiştirdim
  Timelapse as DurationIcon,
  Campaign as RewardIcon,
  Info as InfoIcon,
  Celebration as CelebrationIcon,
  AutoAwesome as SparkleIcon,
  Lightbulb as LightbulbIcon,
  Psychology as AIIcon,
  Help as HelpIcon
} from '@mui/icons-material';

export default function GenerateQuestPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for form
  const [difficulty, setDifficulty] = useState('intermediate');
  const [category, setCategory] = useState('Blockchain');
  const [pointsRequired, setPointsRequired] = useState(100);
  const [pointsReward, setPointsReward] = useState(50);
  
  // State for request
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedQuest, setGeneratedQuest] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showTips, setShowTips] = useState(false);
  
  // Categories
  const categories = [
    'Blockchain',
    'Web3',
    'Artificial Intelligence',
    'Cryptocurrency',
    'Data Science',
    'Programming',
    'Cybersecurity',
    'Education Technology'
  ];
  
  // Difficulties
  const difficulties = [
    { value: 'beginner', label: 'Beginner', color: 'success', description: 'Easy tasks suitable for newcomers to the platform or subject.' },
    { value: 'intermediate', label: 'Intermediate', color: 'warning', description: 'Moderate challenge requiring some knowledge and experience.' }, 
    { value: 'advanced', label: 'Advanced', color: 'error', description: 'Complex tasks designed for experts, with deep technical challenges.' }
  ];

  // Confetti effect for success
  const [showConfetti, setShowConfetti] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);
  
  // Effect for confetti
  useEffect(() => {
    if (activeStep === 2) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeStep]);

  // Handle generating quest
  const handleGenerateQuest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/generate-quest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficulty,
          category,
          pointsRequired,
          pointsReward
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quest');
      }
      
      setGeneratedQuest(data.quest);
      setActiveStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle saving quest
  const handleSaveQuest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/approve-quest/${generatedQuest.contentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rewardPoints: pointsReward,
          requiredPoints: pointsRequired,
          difficultyLevel: difficulty
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save quest');
      }
      
      setActiveStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Steps for the quest generation process
  const steps = [
    'Configure Quest Parameters',
    'Review Generated Quest',
    'Quest Saved'
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
  
  // Render confetti effect (simple CSS version)
  const renderConfetti = () => {
    if (!showConfetti) return null;
    
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 1500,
          overflow: 'hidden',
        }}
      >
        {[...Array(50)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
              borderRadius: '50%',
              top: '-10px',
              left: `${Math.random() * 100}%`,
              animation: `confetti-fall ${Math.random() * 3 + 2}s linear forwards, confetti-shake ${Math.random() * 2 + 1}s ease-in-out infinite alternate`,
              '@keyframes confetti-fall': {
                to: { top: '100vh' }
              },
              '@keyframes confetti-shake': {
                to: { transform: `translateX(${Math.random() * 100 - 50}px)` }
              }
            }}
          />
        ))}
      </Box>
    );
  };

  // Tips for quest generation
  const renderQuestTips = () => (
    <SwipeableDrawer
      anchor="right"
      open={showTips}
      onClose={() => setShowTips(false)}
      onOpen={() => setShowTips(true)}
    >
      <Box sx={{ width: 320, p: 3, height: '100%', bgcolor: theme.palette.background.default }}>
        <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <LightbulbIcon sx={{ mr: 1, color: 'warning.main' }} />
          Quest Design Tips
        </Typography>
        
        <List>
          <ListItem sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
            <ListItemIcon>
              <CategoryIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Category Selection" 
              secondary="Choose a category that matches your educational content for better engagement"
            />
          </ListItem>
          
          <ListItem sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
            <ListItemIcon>
              <DifficultyIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Difficulty Balance" 
              secondary="Balance difficulty to challenge users without frustrating them. Consider your audience's skill level."
            />
          </ListItem>
          
          <ListItem sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
            <ListItemIcon>
              <RewardIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Reward Scale" 
              secondary="Scale rewards with difficulty. Higher rewards motivate users to attempt challenging quests."
            />
          </ListItem>
          
          <ListItem sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
            <ListItemIcon>
              <AIIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="AI Regeneration" 
              secondary="If the generated quest doesn't meet your needs, try regenerating with adjusted parameters."
            />
          </ListItem>
          
          <ListItem sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
            <ListItemIcon>
              <TimerIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Required Points" 
              secondary="Required points control quest access. Lower points increase accessibility, higher points create progression."
            />
          </ListItem>
        </List>
      </Box>
    </SwipeableDrawer>
  );

  return (
    <MainLayout>
      {renderConfetti()}
      {renderQuestTips()}
      
      <Container maxWidth="xl" sx={{ pt: 2 }}>
        <Box sx={{ 
          maxWidth: 1200, 
          mx: 'auto', 
          px: { xs: 2, sm: 3 },
          position: 'relative', 
          zIndex: 1,
          pb: 8,
        }}>
          {/* Decorative Background Elements */}
          <Box sx={{ 
            position: 'absolute',
            top: -50,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.secondary.main, 0.05),
            filter: 'blur(40px)',
            zIndex: -1
          }} />
          
          <Box sx={{ 
            position: 'absolute',
            bottom: -30,
            left: -80,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            filter: 'blur(40px)',
            zIndex: -1
          }} />
          
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
                  onClick={() => router.push('/admin/content/quests')}
                  sx={{ 
                    mr: 1, 
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.secondary.main, 0.2),
                      transform: 'scale(1.05)'
                    }
                  }}
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
                      background: 'linear-gradient(45deg, #9c27b0 30%, #d81b60 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0px 2px 5px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <SparkleIcon sx={{ mr: 1, WebkitTextFillColor: '#d81b60' }} />
                    AI Quest Generator
                  </Typography>
                </Fade>
              </Box>
              <Typography 
                variant="subtitle1" 
                color="text.secondary" 
                sx={{ 
                  mt: 1, 
                  maxWidth: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'space-between', sm: 'flex-start' }
                }}
              >
                <span>Create engaging quests automatically with artificial intelligence</span>
                <Tooltip title="Quest Design Tips">
                  <IconButton 
                    color="primary" 
                    size="small" 
                    onClick={() => setShowTips(true)}
                    sx={{ ml: { xs: 2, sm: 2 }, flexShrink: 0 }}
                  >
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
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
                color: 'secondary.main', 
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: 'secondary.main', 
              },
              '& .MuiStepConnector-line': {
                borderTopWidth: 3,
                borderRadius: 1,
              },
              '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                borderColor: theme.palette.secondary.main,
              },
              '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                borderColor: theme.palette.secondary.main,
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconProps={{
                  sx: {
                    '&.Mui-completed': {
                      boxShadow: '0 0 0 4px rgba(156, 39, 176, 0.1)',
                      borderRadius: '50%',
                    },
                    '&.Mui-active': {
                      boxShadow: '0 0 0 4px rgba(156, 39, 176, 0.1)',
                      borderRadius: '50%',
                    }
                  }
                }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error Alert */}
          {error && (
            <Grow in={!!error}>
              <Alert 
                severity="error" 
                variant="filled"
                sx={{ 
                  mb: 3,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </Grow>
          )}

          {/* Step 1: Configure */}
          {activeStep === 0 && (
            <Grow in={activeStep === 0} timeout={500}>
              <Paper
                elevation={6}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.07)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.08)',
                  }
                }}
              >
                <Box 
                  sx={{ 
                    p: 3, 
                    background: 'linear-gradient(135deg, #9c27b0 20%, #d81b60 90%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Decorative elements */}
                  <Box sx={{ 
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
                  }} />
                  
                  <Box sx={{ 
                    position: 'absolute',
                    bottom: -40,
                    left: 20,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
                  }} />
                  
                  <QuestIcon sx={{ 
                    fontSize: 38, 
                    mr: 2,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    animation: 'float 3s ease-in-out infinite',
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-5px)' }
                    }
                  }} />
                  <Typography variant="h5" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    Quest Configuration
                  </Typography>
                </Box>
                
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="difficulty-select-label">Difficulty Level</InputLabel>
                        <Select
                          labelId="difficulty-select-label"
                          id="difficulty-select"
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          label="Difficulty Level"
                          startAdornment={<DifficultyIcon sx={{ mr: 1, color: 'action.active' }} />}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              transition: 'all 0.2s',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.secondary.main,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderWidth: 2,
                            }
                          }}
                        >
                          {difficulties.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                <Chip 
                                  label={option.label} 
                                  size="small" 
                                  color={option.color} 
                                  sx={{ 
                                    mr: 1, 
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                  }} 
                                />
                                <Tooltip title={option.description} placement="right">
                                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                    {option.value === 'beginner' ? '(Easy tasks for newcomers)' : 
                                     option.value === 'intermediate' ? '(Moderate challenge)' : 
                                     '(Complex tasks for experts)'}
                                    <InfoIcon fontSize="inherit" sx={{ ml: 0.5, fontSize: 14, color: 'text.secondary' }} />
                                  </Typography>
                                </Tooltip>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="category-select-label">Category</InputLabel>
                        <Select
                          labelId="category-select-label"
                          id="category-select"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          label="Category"
                          startAdornment={<CategoryIcon sx={{ mr: 1, color: 'action.active' }} />}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              transition: 'all 0.2s',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.secondary.main,
                            }
                          }}
                        >
                          {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="points-required"
                        label="Required Points"
                        type="number"
                        variant="outlined"
                        value={pointsRequired}
                        onChange={(e) => setPointsRequired(Number(e.target.value))}
                        InputProps={{
                          startAdornment: (
                            <TimerIcon sx={{ mr: 1, color: 'action.active' }} />
                          ),
                        }}
                        helperText="Points a user needs to access this quest"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.2s',
                          },
                          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.secondary.main,
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        id="points-reward"
                        label="Reward Points"
                        type="number"
                        variant="outlined"
                        value={pointsReward}
                        onChange={(e) => setPointsReward(Number(e.target.value))}
                        InputProps={{
                          startAdornment: (
                            <RewardIcon sx={{ mr: 1, color: 'action.active' }} />
                          ),
                        }}
                        helperText="Points awarded upon completion"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.2s',
                          },
                          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.secondary.main,
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      onClick={handleGenerateQuest}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      sx={{ 
                        px: 4, 
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 4px 10px rgba(156, 39, 176, 0.3)',
                        background: 'linear-gradient(45deg, #9c27b0 30%, #d81b60 90%)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 6px 15px rgba(156, 39, 176, 0.4)',
                          transform: 'translateY(-2px)'
                        },
                        '&:active': {
                          boxShadow: '0 2px 5px rgba(156, 39, 176, 0.4)',
                          transform: 'translateY(0)'
                        }
                      }}
                    >
                      {loading ? 'Generating...' : 'Generate Quest'}
                    </Button>
                  </Box>
                </CardContent>
              </Paper>
            </Grow>
          )}

          {/* Step 2: Review */}
          {activeStep === 1 && generatedQuest && (
            <Fade in={true} timeout={500}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Paper
                    elevation={6}
                    sx={{
                      borderRadius: 4,
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.07)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 3, 
                        background: 'linear-gradient(135deg, #9c27b0 20%, #d81b60 90%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Decorative elements */}
                      <Box sx={{ 
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
                      }} />
                      
                      <QuestIcon sx={{ 
                        fontSize: 38, 
                        mr: 2,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 0.8 },
                          '50%': { opacity: 1 },
                          '100%': { opacity: 0.8 }
                        }
                      }} />
                      <Typography variant="h5" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        Generated Quest
                      </Typography>
                    </Box>
                    
                    <CardContent sx={{ p: 3, pt: 4, flexGrow: 1 }}>
                      <Typography 
                        variant="h4" 
                        gutterBottom 
                        fontWeight="500"
                        sx={{
                          color: theme.palette.secondary.main,
                          textShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          pb: 1,
                          borderBottom: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <SparkleIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                        {generatedQuest.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, mt: 2 }}>
                        <Tooltip title="Difficulty level of this quest">
                          <Chip 
                            label={getDifficultyLabel(difficulty)} 
                            color={getDifficultyColor(difficulty)} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontWeight: 500, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                          />
                        </Tooltip>
                        <Tooltip title="Quest category">
                          <Chip 
                            icon={<CategoryIcon />}
                            label={category} 
                            color="secondary" 
                            size="small" 
                            variant="outlined"
                            sx={{ fontWeight: 500, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                          />
                        </Tooltip>
                        <Tooltip title="Required points to access this quest">
                          <Chip 
                            icon={<TimerIcon />}
                            label={`Required: ${pointsRequired} pts`} 
                            color="primary" 
                            size="small" 
                            variant="outlined"
                            sx={{ fontWeight: 500, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                          />
                        </Tooltip>
                        <Tooltip title="Points awarded upon completion">
                          <Chip 
                            icon={<RewardIcon />}
                            label={`Reward: ${pointsReward} pts`} 
                            color="success" 
                            size="small"
                            sx={{ fontWeight: 500, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                          />
                        </Tooltip>
                      </Box>
                      
                      <Typography 
                        variant="body1" 
                        paragraph 
                        sx={{ 
                          mb: 4, 
                          lineHeight: 1.7,
                          color: alpha(theme.palette.text.primary, 0.9),
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          p: 2,
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                      >
                        {generatedQuest.description}
                      </Typography>
                      
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          color: 'secondary.main',
                          mb: 2,
                          borderBottom: `2px dashed ${alpha(theme.palette.secondary.main, 0.2)}`,
                          pb: 1
                        }}
                      >
                        <TaskAltIcon sx={{ mr: 1 }} />
                        Completion Conditions
                      </Typography>
                      
                      <List disablePadding>
                        {generatedQuest.conditions.map((condition, index) => (
                          <Grow in key={index} timeout={(index + 1) * 300}>
                            <ListItem
                              disablePadding
                              sx={{ 
                                mb: 2,
                                bgcolor: alpha(theme.palette.background.paper, 0.7),
                                py: 1.5,
                                px: 2,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.5),
                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                                  transform: 'translateX(5px)',
                                  boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                                }
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckIcon color="success" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={condition.description} 
                                primaryTypographyProps={{
                                  sx: { fontWeight: 500 }
                                }}
                              />
                            </ListItem>
                          </Grow>
                        ))}
                      </List>
                      
                      <Box sx={{ mt: 'auto', pt: 4, display: 'flex', alignItems: 'center' }}>
                        <DurationIcon sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Estimated completion time: {generatedQuest.estimated_completion_time} min
                        </Typography>
                      </Box>
                    </CardContent>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Paper
                    elevation={6}
                    sx={{
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.07)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 3, 
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
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
                        icon={<InfoIcon />}
                        sx={{ 
                          mb: 3,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          border: `1px solid ${alpha(theme.palette.info.main, 0.5)}`
                        }}
                      >
                        <Typography variant="body2">
                          Review the generated quest. If satisfied, save it to your platform. You can also regenerate with different parameters.
                        </Typography>
                      </Alert>
                      
                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            id="points-reward-edit"
                            label="Reward Points"
                            type="number"
                            variant="outlined"
                            value={pointsReward}
                            onChange={(e) => setPointsReward(Number(e.target.value))}
                            InputProps={{
                              startAdornment: (
                                <RewardIcon sx={{ mr: 1, color: 'action.active' }} />
                              ),
                            }}
                            helperText="You can adjust the reward points before saving"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                transition: 'all 0.2s',
                              },
                              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.secondary.main,
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="large"
                          onClick={handleSaveQuest}
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                          sx={{ 
                            py: 1.5,
                            borderRadius: 2,
                            boxShadow: '0 4px 10px rgba(156, 39, 176, 0.3)',
                            background: 'linear-gradient(45deg, #9c27b0 30%, #d81b60 90%)',
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: '0 6px 15px rgba(156, 39, 176, 0.4)',
                              transform: 'translateY(-2px)'
                            },
                            '&:active': {
                              boxShadow: '0 2px 5px rgba(156, 39, 176, 0.4)',
                              transform: 'translateY(0)'
                            }
                          }}
                        >
                          {loading ? 'Saving...' : 'Save Quest'}
                        </Button>
                        
                        <Button
                          variant="outlined"
                          color="primary"
                          size="large"
                          onClick={() => setActiveStep(0)}
                          disabled={loading}
                          startIcon={<EditIcon />}
                          sx={{ 
                            py: 1.5, 
                            borderRadius: 2,
                            borderWidth: 2,
                            '&:hover': {
                              borderWidth: 2,
                            }
                          }}
                        >
                          Modify Parameters
                        </Button>
                        
                        <Button
                          variant="text"
                          color="error"
                          onClick={() => router.push('/admin/content/quests')}
                          disabled={loading}
                          sx={{ mt: 1 }}
                        >
                          Cancel
                        </Button>
                      </Box>
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
                elevation={6}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  textAlign: 'center',
                  p: { xs: 3, sm: 4, md: 5 },
                  bgcolor: alpha(theme.palette.success.light, 0.05),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.success.main, 0.2),
                  boxShadow: '0 6px 20px rgba(0,0,0,0.07), 0 2px 5px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}
              >
                {/* Decorative Success Elements */}
                <Box sx={{ 
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.success.light, 0.15)} 0%, ${alpha(theme.palette.success.light, 0)} 70%)`,
                  zIndex: 0
                }} />
                
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 10,
                  left: 40,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.success.light, 0.1)} 0%, ${alpha(theme.palette.success.light, 0)} 70%)`,
                  zIndex: 0
                }} />
                
                <Box sx={{ position: 'relative', zIndex: 1, mb: 3 }}>
                  <Box sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    boxShadow: `0 0 0 8px ${alpha(theme.palette.success.main, 0.05)}`,
                    position: 'relative',
                    animation: 'pulse-success 2s infinite',
                    '@keyframes pulse-success': {
                      '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0.4)}` },
                      '70%': { boxShadow: `0 0 0 15px ${alpha(theme.palette.success.main, 0)}` },
                      '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0)}` }
                    }
                  }}>
                    <CheckIcon 
                      sx={{ 
                        fontSize: 54, 
                        color: 'success.main',
                      }} 
                    />
                  </Box>
                </Box>
                
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  fontWeight="bold" 
                  color="success.main"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                >
                  <CelebrationIcon sx={{ mr: 1 }} /> Quest Successfully Created!
                </Typography>
                
                <Typography 
                  variant="body1" 
                  paragraph 
                  color="text.secondary" 
                  sx={{ 
                    maxWidth: 600, 
                    mx: 'auto', 
                    mb: 4,
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                  }}
                >
                  The quest has been saved and is now available in your quest library. 
                  Users with sufficient points can now access and complete this quest.
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={() => router.push('/admin/content/quests')}
                    sx={{ 
                      px: 3, 
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 4px 10px rgba(156, 39, 176, 0.3)',
                      background: 'linear-gradient(45deg, #9c27b0 30%, #d81b60 90%)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: '0 6px 15px rgba(156, 39, 176, 0.4)',
                        transform: 'translateY(-2px)'
                      },
                      '&:active': {
                        boxShadow: '0 2px 5px rgba(156, 39, 176, 0.4)',
                        transform: 'translateY(0)'
                      }
                    }}
                  >
                    Go to Quests
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => {
                      setActiveStep(0);
                      setGeneratedQuest(null);
                    }}
                    sx={{ 
                      px: 3, 
                      py: 1.5, 
                      borderRadius: 2,
                      borderWidth: 2,
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    Create Another Quest
                  </Button>
                </Box>
              </Paper>
            </Zoom>
          )}
          
          {/* Loading Backdrop */}
          <Backdrop
            sx={{ 
              color: '#fff', 
              zIndex: (theme) => theme.zIndex.drawer + 1,
              bgcolor: alpha('#000', 0.7),
              backdropFilter: 'blur(4px)'
            }}
            open={loading}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress 
                color="inherit" 
                size={60}
                thickness={4}
                sx={{ mb: 2 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {activeStep === 0 ? 'Generating Quest with AI...' : 'Saving Quest...'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                This may take a few moments
              </Typography>
            </Box>
          </Backdrop>
        </Box>
      </Container>
    </MainLayout>
  );
}