'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  LinearProgress,
  Tabs,
  Tab,
  Divider,
  Alert,
  useTheme,
  alpha,
  IconButton,
  Paper,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Pagination,
  Modal,
  Fade,
  Backdrop,
  Stack,
  CircularProgress
} from '@mui/material';
import TokenIcon from '@mui/icons-material/Token';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExtensionIcon from '@mui/icons-material/Extension';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import DifficultyIcon from '@mui/icons-material/SignalCellularAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Background animation
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const theme = useTheme();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    const createParticles = () => {
      const particleCount = Math.floor(window.innerWidth / 25);
      const colors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.primary.light,
        theme.palette.secondary.light,
      ];
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: Math.random() * 0.2 - 0.1,
          speedY: Math.random() * 0.2 - 0.1,
          opacity: Math.random() * 0.25 + 0.05
        });
      }
    };
    
    createParticles();
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around canvas edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${parseInt(particle.color.slice(1, 3), 16)}, ${parseInt(particle.color.slice(3, 5), 16)}, ${parseInt(particle.color.slice(5, 7), 16)}, ${particle.opacity})`;
        ctx.fill();
        
        // Connect particles (optimized)
        if (index % 4 === 0) {
          for (let i = 0; i < particles.length; i += 4) {
            if (index !== i) {
              const dx = particle.x - particles[i].x;
              const dy = particle.y - particles[i].y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 80) {
                const opacity = (80 - distance) / 80 * 0.05;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(particles[i].x, particles[i].y);
                ctx.strokeStyle = `rgba(${parseInt(particle.color.slice(1, 3), 16)}, ${parseInt(particle.color.slice(3, 5), 16)}, ${parseInt(particle.color.slice(5, 7), 16)}, ${opacity})`;
                ctx.stroke();
              }
            }
          }
        }
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, [theme]);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        filter: 'blur(0.5px)'
      }} 
    />
  );
};

// Quest card component with similar design to course cards
const QuestCard = ({ quest, onClick }) => {
  const theme = useTheme();
  const [hover, setHover] = useState(false);
  
  // Helper function to get color based on difficulty
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return theme.palette.success.main;
      case 'intermediate':
        return theme.palette.primary.main;
      case 'advanced':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: hover ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hover ? 6 : 2,
        cursor: 'pointer',
        bgcolor: theme.palette.background.paper,
        border: hover ? `1px solid ${alpha(getDifficultyColor(quest.difficulty), 0.3)}` : 'none',
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Top section with colored background */}
      <Box sx={{ 
        position: 'relative',
        height: 140, // Fixed height instead of aspect ratio
        background: `linear-gradient(135deg, ${alpha(getDifficultyColor(quest.difficulty), 0.8)}, ${alpha(theme.palette.secondary.main, 0.7)})`,
      }}>
        {/* Pattern overlay with low opacity */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.1,
          background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }} />
        
        {/* Difficulty and category chips */}
        <Chip 
          label={quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)} 
          size="small" 
          sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: alpha('#fff', 0.2),
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.65rem',
            height: 20,
            '& .MuiChip-label': { px: 1 }
          }} 
        />
        
        <Chip 
          label={quest.category || 'General'} 
          size="small" 
          sx={{ 
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: alpha('#fff', 0.2),
            color: 'white',
            fontSize: '0.65rem',
            height: 20,
            '& .MuiChip-label': { px: 1 }
          }} 
        />
        
        {/* Reward points badge */}
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            bgcolor: alpha('#fff', 0.2),
            px: 1,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          <TokenIcon fontSize="small" sx={{ color: 'white', fontSize: 14, mr: 0.5 }} />
          <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
            {quest.rewardPoints} pts
          </Typography>
        </Box>
        
        {/* Play button on hover */}
        {hover && (
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              opacity: 0,
              animation: 'fadeIn 0.2s ease forwards',
              '@keyframes fadeIn': {
                from: { opacity: 0 },
                to: { opacity: 1 }
              }
            }}
          >
            <IconButton
              size="medium"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)',
                color: '#fff',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  transform: 'scale(1.1)'
                }
              }}
            >
              <PlayArrowIcon />
            </IconButton>
          </Box>
        )}
      </Box>
      
      {/* Card content */}
      <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="subtitle1" 
          component="h3" 
          fontWeight="bold"
          sx={{ 
            mb: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            fontSize: '0.9rem',
            height: '1.4rem'
          }}
        >
          {quest.title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 1.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            fontSize: '0.8rem',
            height: '2.4rem'
          }}
        >
          {quest.description}
        </Typography>
        
        {/* Progress bar */}
        <Box sx={{ mt: 'auto', mb: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Progress
            </Typography>
            <Typography variant="caption" color="text.primary" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
              {quest.progress ? quest.progress.completionPercentage : 0}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={quest.progress ? quest.progress.completionPercentage : 0}
            sx={{ 
              height: 4, 
              borderRadius: 2,
              background: alpha(theme.palette.grey[300], 0.5),
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${getDifficultyColor(quest.difficulty)}, ${theme.palette.secondary.main})`,
                borderRadius: 2,
              }
            }}
          />
        </Box>
      </CardContent>
      
      {/* Card footer */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 1.5,
        pt: 0.5,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}>
        {/* Reward icon and name */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            variant="rounded"
            sx={{ 
              width: 20, 
              height: 20, 
              mr: 0.5,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main
            }}
          >
            <StarIcon sx={{ fontSize: 12 }} />
          </Avatar>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
            {quest.rewardNft?.title || "NFT Reward"}
          </Typography>
        </Box>
        
        {/* Status chip */}
        {quest.progress && quest.progress.isCompleted ? (
          <Chip 
            icon={<CheckCircleIcon fontSize="small" />} 
            label={quest.progress.rewardClaimed ? "Completed" : "Claim"} 
            color={quest.progress.rewardClaimed ? "default" : "success"} 
            size="small"
            sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
          />
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ bgcolor: alpha(theme.palette.grey[100], 0.5), px: 1, py: 0.5, borderRadius: 1, fontSize: '0.7rem' }}>
            {quest.difficulty}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

// Quest Detail Modal Component - Netflix style
const QuestDetailModal = ({ open, onClose, quest, isAuthenticated, onEnroll, onClaimReward }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  
  if (!quest) return null;
  
  const handleClaimReward = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      await onClaimReward(quest.id);
      // Show success message
    } catch (error) {
      console.error("Failed to claim reward:", error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };
  
  const handleEnroll = () => {
    if (isAuthenticated) {
      onEnroll(quest.id);
    }
  };
  
  // Helper function to get color based on difficulty
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return theme.palette.success.main;
      case 'intermediate':
        return theme.palette.primary.main;
      case 'advanced':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Fade in={open}>
        <Box sx={{ 
          width: { xs: '90%', sm: '80%', md: '70%', lg: '60%' },
          maxWidth: 900,
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          position: 'relative',
        }}>
          {/* Close button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              bgcolor: alpha('#000', 0.5),
              color: 'white',
              zIndex: 10,
              '&:hover': {
                bgcolor: alpha('#000', 0.7),
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {/* Header banner */}
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                height: 200,
                background: `linear-gradient(135deg, ${alpha(getDifficultyColor(quest.difficulty), 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                p: 3,
              }}
            >
              {/* Pattern background */}
              <Box sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                opacity: 0.1,
                background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              }} />
              
              {/* Quest icon */}
              <Avatar
                sx={{
                  bgcolor: 'white',
                  color: getDifficultyColor(quest.difficulty),
                  width: 64,
                  height: 64,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  mb: 2,
                }}
              >
                <ExtensionIcon sx={{ fontSize: 36 }} />
              </Avatar>
              
              <Typography 
                variant="h5" 
                component="h2" 
                align="center" 
                fontWeight="bold" 
                color="white"
                sx={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
              >
                {quest.title}
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip 
                  label={quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)} 
                  size="small" 
                  sx={{ 
                    bgcolor: alpha('#fff', 0.3),
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
                
                <Chip 
                  icon={<TokenIcon sx={{ color: 'white !important', fontSize: '0.8rem' }} />}
                  label={`${quest.rewardPoints} Points`}
                  size="small" 
                  sx={{ 
                    bgcolor: alpha('#fff', 0.3),
                    color: 'white',
                    fontWeight: 'bold',
                    '& .MuiChip-icon': {
                      color: 'white'
                    }
                  }}
                />
              </Stack>
            </Box>
          </Box>
          
          {/* Modal content */}
          <Box sx={{ p: 3 }}>
            {/* Quest description */}
            <Typography variant="body1" paragraph>
              {quest.description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Quest conditions */}
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quest Conditions
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              {quest.conditions && quest.conditions.map((condition, index) => (
                <Paper 
                  key={index}
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {condition.type === 'course_completion' ? (
                    <SchoolIcon sx={{ color: theme.palette.primary.main, mr: 2 }} />
                  ) : condition.type === 'quiz_score' ? (
                    <QuizIcon sx={{ color: theme.palette.secondary.main, mr: 2 }} />
                  ) : (
                    <CheckCircleIcon sx={{ color: theme.palette.success.main, mr: 2 }} />
                  )}
                  
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {condition.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {condition.type === 'course_completion' 
                        ? 'Complete the course' 
                        : condition.type === 'quiz_score' 
                          ? `Pass the quiz with at least ${condition.targetValue}% score` 
                          : 'Complete the task'}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Rewards Section */}
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Completion Rewards
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Paper
                  elevation={0}
                  sx={{ 
                    p: 2,
                    height: '100%',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mr: 2
                    }}
                  >
                    <TokenIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {quest.rewardPoints} Points
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Platform points to use
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              
              {quest.rewardNft && (
                <Grid item xs={12} sm={6}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2,
                      height: '100%',
                      bgcolor: alpha(theme.palette.secondary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                        mr: 2
                      }}
                    >
                      <StarIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {quest.rewardNft.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Special collector NFT
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
            
            {/* Progress Section - For authenticated users */}
            {isAuthenticated && quest.progress && (
              <>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Progress Status
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Completion: {quest.progress.completionPercentage}%
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {quest.progress.currentProgress} / {quest.conditions?.length || 1}
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={quest.progress.completionPercentage}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      mb: 2,
                      background: alpha(theme.palette.grey[300], 0.5),
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${getDifficultyColor(quest.difficulty)}, ${theme.palette.secondary.main})`,
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>
              </>
            )}
            
            {/* Action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button 
                variant="outlined" 
                onClick={onClose}
                startIcon={<CloseIcon />}
              >
                Close
              </Button>
              
              {isAuthenticated ? (
                quest.progress && quest.progress.isCompleted && !quest.progress.rewardClaimed ? (
                  <Button 
                    variant="contained" 
                    color="success"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                    onClick={handleClaimReward}
                    disabled={loading}
                  >
                    Claim Reward
                  </Button>
                ) : quest.progress && quest.progress.isCompleted ? (
                  <Button 
                    variant="outlined" 
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    disabled
                  >
                    Completed
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    onClick={handleEnroll}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      '&:hover': {
                        background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      }
                    }}
                  >
                    Start Quest
                  </Button>
                )
              ) : (
                <Button 
                  variant="contained" 
                  component={Link}
                  href="/login"
                  startIcon={<LockIcon />}
                  sx={{
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    }
                  }}
                >
                  Login
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

// Category Section Component
const CategorySection = ({ title, quests, onQuestClick }) => {
  const theme = useTheme();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  const updateArrowVisibility = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
    }
  };
  
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateArrowVisibility);
      // Initial check
      updateArrowVisibility();
      // Check again after content might have loaded
      setTimeout(updateArrowVisibility, 500);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', updateArrowVisibility);
      }
    };
  }, [quests]);
  
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  if (!quests || quests.length === 0) return null;
  
  return (
    <Box sx={{ mb: 5, position: 'relative' }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        fontWeight="bold" 
        sx={{ mb: 2 }}
      >
        {title}
      </Typography>
      
      <Box sx={{ position: 'relative', width: '100%' }}>
        {/* Scroll left arrow */}
        {showLeftArrow && (
          <IconButton
            onClick={handleScrollLeft}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              boxShadow: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.background.paper, 1),
              }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
        
        {/* Scroll right arrow */}
        {showRightArrow && (
          <IconButton
            onClick={handleScrollRight}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              boxShadow: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.background.paper, 1),
              }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        )}
        
        {/* Scrollable row of quests */}
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
            pb: 1,
            px: 1,
            scrollbarWidth: 'none', // Firefox
            '&::-webkit-scrollbar': {
              display: 'none', // Chrome, Safari, Edge
            },
            msOverflowStyle: 'none', // IE
          }}
        >
          {quests.map((quest) => (
            <Box 
              key={quest.id} 
              sx={{ 
                minWidth: { xs: '80%', sm: '40%', md: '25%', lg: '22%' },
                maxWidth: { xs: '80%', sm: '40%', md: '25%', lg: '22%' },
                height: 320,
                flexShrink: 0,
              }}
            >
              <QuestCard quest={quest} onClick={() => onQuestClick(quest)} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// Main Quests Page Component
export default function QuestsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  // State definitions
  const [activeTab, setActiveTab] = useState(0);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    sort: 'newest'
  });
  
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8; // Items per page

  // Load mock quest data
  useEffect(() => {
    const fetchQuests = async () => {
      setLoading(true);
      try {
        // In a real application, fetch from API:
        // const response = await fetch('/api/quests/');
        // const data = await response.json();
        
        // Mock data
        const mockQuests = [
          {
            id: 1,
            title: "Blockchain Pioneer",
            description: "Complete the Introduction to Blockchain course and pass all quizzes with at least 80% score.",
            difficulty: "easy",
            category: "Blockchain",
            requiredPoints: 100,
            rewardPoints: 500,
            rewardNft: {
              id: 1,
              title: "Blockchain Pioneer Badge",
              imageUri: "/placeholder-nft1.jpg"
            },
            conditions: [
              { type: 'course_completion', targetId: 1, targetValue: 1, description: 'Complete the Introduction to Blockchain course' },
              { type: 'quiz_score', targetId: 1, targetValue: 80, description: 'Pass all quizzes with 80% score' }
            ],
            progress: {
              currentProgress: 1,
              isCompleted: false,
              rewardClaimed: false,
              completionPercentage: 50
            }
          },
          {
            id: 2,
            title: "Smart Contract Expert",
            description: "Finish the Smart Contract Development course and complete a smart contract project.",
            difficulty: "intermediate",
            category: "Development",
            requiredPoints: 300,
            rewardPoints: 800,
            rewardNft: {
              id: 2,
              title: "Smart Contract Expert Badge",
              imageUri: "/placeholder-nft2.jpg"
            },
            conditions: [
              { type: 'course_completion', targetId: 2, targetValue: 1, description: 'Complete the Smart Contract Development course' },
              { type: 'project_submission', targetId: 1, targetValue: 1, description: 'Submit a smart contract project' }
            ],
            progress: {
              currentProgress: 0,
              isCompleted: false,
              rewardClaimed: false,
              completionPercentage: 0
            }
          },
          {
            id: 3,
            title: "Web3 Developer",
            description: "Complete the Web3 Frontend Development course and build a dApp that interacts with a smart contract.",
            difficulty: "advanced",
            category: "Development",
            requiredPoints: 500,
            rewardPoints: 1200,
            rewardNft: {
              id: 3,
              title: "Web3 Developer Badge",
              imageUri: "/placeholder-nft3.jpg"
            },
            conditions: [
              { type: 'course_completion', targetId: 3, targetValue: 1, description: 'Complete the Web3 Frontend Development course' },
              { type: 'project_submission', targetId: 2, targetValue: 1, description: 'Submit a dApp project' }
            ],
            progress: {
              currentProgress: 0,
              isCompleted: false,
              rewardClaimed: false,
              completionPercentage: 0
            }
          },
          {
            id: 4,
            title: "Early Adopter",
            description: "Join the platform and complete your profile within the first month of launch.",
            difficulty: "easy",
            category: "Community",
            requiredPoints: 0,
            rewardPoints: 300,
            rewardNft: {
              id: 4,
              title: "Early Adopter Badge",
              imageUri: "/placeholder-nft4.jpg"
            },
            conditions: [
              { type: 'profile_completion', targetId: null, targetValue: 1, description: 'Complete your profile' }
            ],
            progress: {
              currentProgress: 1,
              isCompleted: true,
              rewardClaimed: true,
              completionPercentage: 100
            }
          },
          {
            id: 5,
            title: "Community Contributor",
            description: "Create 5 valuable posts in the community forum and earn at least 20 likes.",
            difficulty: "intermediate",
            category: "Community",
            requiredPoints: 200,
            rewardPoints: 600,
            rewardNft: {
              id: 5,
              title: "Community Contributor Badge",
              imageUri: "/placeholder-nft5.jpg"
            },
            conditions: [
              { type: 'community_posts', targetId: null, targetValue: 5, description: 'Create 5 posts in the community forum' },
              { type: 'community_likes', targetId: null, targetValue: 20, description: 'Earn 20 likes on your posts' }
            ],
            progress: {
              currentProgress: 1,
              isCompleted: false,
              rewardClaimed: false,
              completionPercentage: 50
            }
          },
          {
            id: 6,
            title: "AI Enthusiast",
            description: "Complete the AI Fundamentals course and train a simple machine learning model.",
            difficulty: "intermediate",
            category: "AI & ML",
            requiredPoints: 250,
            rewardPoints: 700,
            rewardNft: {
              id: 6,
              title: "AI Enthusiast Badge",
              imageUri: "/placeholder-nft6.jpg"
            },
            conditions: [
              { type: 'course_completion', targetId: 4, targetValue: 1, description: 'Complete the AI Fundamentals course' },
              { type: 'project_submission', targetId: 3, targetValue: 1, description: 'Train and submit a machine learning model' }
            ],
            progress: {
              currentProgress: 0,
              isCompleted: false,
              rewardClaimed: false,
              completionPercentage: 0
            }
          },
          {
            id: 7,
            title: "DeFi Explorer",
            description: "Learn about decentralized finance by completing the DeFi Basics course and participating in a simulated trading exercise.",
            difficulty: "intermediate",
            category: "DeFi",
            requiredPoints: 350,
            rewardPoints: 900,
            rewardNft: {
              id: 7,
              title: "DeFi Explorer Badge",
              imageUri: "/placeholder-nft7.jpg"
            },
            conditions: [
              { type: 'course_completion', targetId: 5, targetValue: 1, description: 'Complete the DeFi Basics course' },
              { type: 'simulation_completion', targetId: 1, targetValue: 1, description: 'Complete the DeFi trading simulation' }
            ],
            progress: {
              currentProgress: 0,
              isCompleted: false,
              rewardClaimed: false,
              completionPercentage: 0
            }
          },
          {
            id: 8,
            title: "NFT Creator",
            description: "Complete the NFT Creation course and mint your own digital collectible on the testnet.",
            difficulty: "advanced",
            category: "NFTs",
            requiredPoints: 400,
            rewardPoints: 1000,
            rewardNft: {
              id: 8,
              title: "NFT Creator Badge",
              imageUri: "/placeholder-nft8.jpg"
            },
            conditions: [
              { type: 'course_completion', targetId: 6, targetValue: 1, description: 'Complete the NFT Creation course' },
              { type: 'mint_completion', targetId: null, targetValue: 1, description: 'Mint an NFT on the testnet' }
            ],
            progress: {
              currentProgress: 0,
              isCompleted: false,
              rewardClaimed: false,
              completionPercentage: 0
            }
          },
          {
            id: 9,
            title: "Zero Knowledge Expert",
            description: "Understand the fundamentals of Zero Knowledge Proofs and implement a simple ZKP protocol.",
            difficulty: "advanced",
            category: "Cryptography",
            requiredPoints: 600,
            rewardPoints: 1500,
            rewardNft: {
              id: 9,
              title: "ZK Expert Badge",
              imageUri: "/placeholder-nft9.jpg"
            },
            conditions: [
              { type: 'course_completion', targetId: 7, targetValue: 1, description: 'Complete the ZK Proofs course' },
              { type: 'project_submission', targetId: 4, targetValue: 1, description: 'Implement a simple ZKP protocol' }
            ],
            progress: {
              currentProgress: 0,
              isCompleted: false,
              rewardClaimed: false,
              completionPercentage: 0
            }
          },
          {
            id: 10,
            title: "Metaverse Pioneer",
            description: "Explore and create content in the Metaverse using WebXR technologies.",
            difficulty: "intermediate",
            category: "Metaverse",
            requiredPoints: 400,
            rewardPoints: 800,
            rewardNft: {
              id: 10,
              title: "Metaverse Pioneer Badge",
              imageUri: "/placeholder-nft10.jpg"
            },
            conditions: [
              { type: 'course_completion', targetId: 8, targetValue: 1, description: 'Complete the Intro to Metaverse course' },
              { type: 'project_submission', targetId: 5, targetValue: 1, description: 'Create a simple WebXR experience' }
            ],
            progress: {
              currentProgress: 0,
              isCompleted: false,
              rewardClaimed: false,
              completionPercentage: 0
            }
          },
          {
            id: 11,
            title: "Data Science for Blockchain",
            description: "Apply data science techniques to analyze blockchain data and create meaningful visualizations.",
            difficulty: "intermediate",
            category: "Data Science",
            requiredPoints: 350,
            rewardPoints: 700,
            rewardNft: {
              id: 11,
              title: "Blockchain Data Scientist Badge",
              imageUri: "/placeholder-nft11.jpg"
            },
            conditions: [
              { type: 'course_completion', targetId: 9, targetValue: 1, description: 'Complete the Blockchain Data Analysis course' },
              { type: 'project_submission', targetId: 6, targetValue: 1, description: 'Create a blockchain data visualization project' }
            ],
            progress: {
              currentProgress: 0,
              isCompleted: false,
              rewardClaimed: false,
              completionPercentage: 0
            }
          },
          {
            id: 12,
            title: "Crypto Trading Basics",
            description: "Learn the fundamentals of cryptocurrency trading and technical analysis.",
            difficulty: "easy",
            category: "Trading",
            requiredPoints: 150,
            rewardPoints: 400,
            rewardNft: {
              id: 12,
              title: "Crypto Trader Badge",
              imageUri: "/placeholder-nft12.jpg"
            },
            conditions: [
              { type: 'course_completion', targetId: 10, targetValue: 1, description: 'Complete the Crypto Trading Basics course' },
              { type: 'quiz_score', targetId: 3, targetValue: 80, description: 'Pass the technical analysis quiz with at least 80%' }
            ],
            progress: {
              currentProgress: 0,
              isCompleted: false,
              rewardClaimed: false,
              completionPercentage: 0
            }
          }
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setQuests(mockQuests);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to load quests:', error);
        setError('Failed to load quests. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchQuests();
  }, []);
  
  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1); // Reset to first page when tab changes
  };
  
  // Quest card click handler
  const handleQuestClick = (quest) => {
    setSelectedQuest(quest);
    setModalOpen(true);
  };
  
  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  // Enroll in quest handler
  const handleEnrollQuest = (questId) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }
    
    // Navigate to quest detail page if authenticated
    router.push(`/quests/${questId}`);
    setModalOpen(false);
  };
  
  // Claim reward handler
  const handleClaimReward = async (questId) => {
    if (!isAuthenticated) return;
    
    try {
      // In a real application, API request:
      // const response = await fetch(`/api/quests/${questId}/claim-reward`, {
      //   method: 'POST',
      // });
      // if (!response.ok) throw new Error('Failed to claim reward');
      
      // Mock operation - assume success
      // Update quest list
      const updatedQuests = quests.map(quest => {
        if (quest.id === questId && quest.progress) {
          return {
            ...quest,
            progress: {
              ...quest.progress,
              rewardClaimed: true
            }
          };
        }
        return quest;
      });
      
      setQuests(updatedQuests);
      
      // Update selected quest
      if (selectedQuest && selectedQuest.id === questId) {
        setSelectedQuest({
          ...selectedQuest,
          progress: {
            ...selectedQuest.progress,
            rewardClaimed: true
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to claim reward:', error);
      throw error;
    }
  };
  
  // Search handler
  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1);
  };
  
  // Filter change handler
  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    setPage(1);
  };
  
  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      difficulty: 'all',
      category: 'all',
      sort: 'newest'
    });
    setPage(1);
  };
  
  // Filter quests based on tab
  const getFilteredQuests = () => {
    let filtered = [...quests];
    
    // Tab filter
    if (activeTab === 1) { // In Progress
      filtered = filtered.filter(quest => 
        quest.progress && 
        quest.progress.currentProgress > 0 && 
        !quest.progress.isCompleted
      );
    } else if (activeTab === 2) { // Completed
      filtered = filtered.filter(quest => 
        quest.progress && 
        quest.progress.isCompleted
      );
    } else if (activeTab === 3) { // Available
      filtered = filtered.filter(quest => 
        !quest.progress || 
        (quest.progress.currentProgress === 0 && !quest.progress.isCompleted)
      );
    }
    
    // Difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(quest => quest.difficulty === filters.difficulty);
    }
    
    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(quest => quest.category === filters.category);
    }
    
    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(quest => 
        quest.title.toLowerCase().includes(term) || 
        quest.description.toLowerCase().includes(term) ||
        (quest.category && quest.category.toLowerCase().includes(term))
      );
    }
    
    // Sorting
    if (filters.sort === 'points-high') {
      filtered.sort((a, b) => b.rewardPoints - a.rewardPoints);
    } else if (filters.sort === 'points-low') {
      filtered.sort((a, b) => a.rewardPoints - b.rewardPoints);
    }
    
    return filtered;
  };
  
  // Get paginated quests
  const getPaginatedQuests = () => {
    const filteredQuests = getFilteredQuests();
    const startIndex = (page - 1) * itemsPerPage;
    return filteredQuests.slice(startIndex, startIndex + itemsPerPage);
  };
  
  // Group quests by category
  const getCategorizedQuests = () => {
    const filteredQuests = getFilteredQuests();
    
    // Group by category
    const categories = {};
    filteredQuests.forEach(quest => {
      const category = quest.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(quest);
    });
    
    return categories;
  };

  // Group quests by difficulty
  const getDifficultyQuests = () => {
    const filteredQuests = getFilteredQuests();
    
    // Group by difficulty
    const difficulties = {
      easy: filteredQuests.filter(q => q.difficulty === 'easy'),
      intermediate: filteredQuests.filter(q => q.difficulty === 'intermediate'),
      advanced: filteredQuests.filter(q => q.difficulty === 'advanced')
    };
    
    return difficulties;
  };
  
  // Get unique categories
  const getUniqueCategories = () => {
    const categories = ['all', ...new Set(quests.map(quest => quest.category).filter(Boolean))];
    return categories;
  };
  
  // Page change handler
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  if (error) {
    return (
      <Container sx={{ my: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, position: 'relative', minHeight: '100vh' }}>
      {/* Background animation */}
      <ParticleBackground />
      
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ 
          mb: 6, 
          textAlign: 'center',
          position: 'relative'
        }}>
          <Typography 
            variant="h6" 
            component="p"
            sx={{ 
              mb: 1, 
              fontWeight: 'bold',
              display: 'inline-block',
              backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            Quests & Rewards
          </Typography>
          
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Master New Skills & Collect Rewards
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 3 }}>
            Complete quests to earn points and unique NFT rewards. Track your progress and showcase your achievements.
          </Typography>
          
          {!isAuthenticated && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 3,
                display: 'inline-flex',
                alignItems: 'center',
                background: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                mb: 3
              }}
            >
              <InfoIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="body2" sx={{ mr: 2 }}>
                Sign in to track your quest progress and earn rewards
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  component={Link} 
                  href="/login" 
                  variant="outlined" 
                  size="small" 
                  sx={{ 
                    borderRadius: 6,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    }
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  component={Link} 
                  href="/register" 
                  variant="contained" 
                  size="small"
                  sx={{ 
                    borderRadius: 6,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    }
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
        
        {/* Statistics - Equal sized cards */}
        <Box sx={{ mb: 5 }}>
          <Grid container spacing={2} justifyContent="center">
            {[
              { icon: <ExtensionIcon />, value: quests.length.toString(), label: "Total Quests" },
              { icon: <StarIcon />, value: "25K+", label: "Rewards Distributed" },
              { icon: <TokenIcon />, value: "10K+", label: "NFTs Earned" },
              { icon: <DifficultyIcon />, value: "3", label: "Difficulty Levels" }
            ].map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  height: 110, // Fixed height
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      mb: 1,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  
                  {/* Fixed height boxes for text */}
                  <Box sx={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 0.5,
            borderRadius: 2,
            background: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            overflow: 'auto'
          }}
        >
          <Tabs 
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 1.5,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
              '& .MuiTab-root': {
                minHeight: 48,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold',
                minWidth: 100,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              }
            }}
          >
            <Tab label="All Quests" />
            <Tab label="In Progress" />
            <Tab label="Completed" />
            <Tab label="Available" />
          </Tabs>
        </Paper>
        
        {/* Search and Filter Row */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Search field */}
          <TextField
            placeholder="Search quests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: '1 1 auto',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
              }
            }}
          />
          
          {/* Filter button */}
          <Button
            variant={filterOpen ? "contained" : "outlined"}
            startIcon={<FilterListIcon />}
            onClick={() => setFilterOpen(!filterOpen)}
            endIcon={<ArrowDropDownIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Filter
          </Button>
          
          {/* Reset button - show if any filter/search is active */}
          {(searchTerm || filters.difficulty !== 'all' || filters.category !== 'all') && (
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              size="medium"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Clear
            </Button>
          )}
        </Box>
        
        {/* Filter panel */}
        <Collapse in={filterOpen}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              background: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Grid container spacing={3}>
              {/* Difficulty filter */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={filters.difficulty}
                    label="Difficulty"
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  >
                    <MenuItem value="all">All Difficulties</MenuItem>
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Category filter */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filters.category}
                    label="Category"
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {getUniqueCategories().filter(cat => cat !== 'all').map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Sort option */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sort}
                    label="Sort By"
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                  >
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="points-high">Highest Points</MenuItem>
                    <MenuItem value="points-low">Lowest Points</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
        
        {/* Active filters */}
        {(filters.difficulty !== 'all' || filters.category !== 'all' || searchTerm) && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            {searchTerm && (
              <Chip 
                label={`Search: ${searchTerm}`}
                onDelete={() => setSearchTerm('')}
                size="small"
              />
            )}
            {filters.difficulty !== 'all' && (
              <Chip 
                label={`Difficulty: ${filters.difficulty}`}
                onDelete={() => handleFilterChange('difficulty', 'all')}
                size="small"
              />
            )}
            {filters.category !== 'all' && (
              <Chip 
                label={`Category: ${filters.category}`}
                onDelete={() => handleFilterChange('category', 'all')}
                size="small"
              />
            )}
          </Box>
        )}
        
        {/* Quests List */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Paper sx={{ 
                  height: 280, 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <Box sx={{ height: 120, bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ width: '70%', height: 20, bgcolor: alpha(theme.palette.grey[300], 0.7), borderRadius: 1, mb: 2 }} />
                    <Box sx={{ width: '100%', height: 10, bgcolor: alpha(theme.palette.grey[300], 0.5), borderRadius: 1, mb: 1 }} />
                    <Box sx={{ width: '90%', height: 10, bgcolor: alpha(theme.palette.grey[300], 0.5), borderRadius: 1, mb: 1 }} />
                    <Box sx={{ width: '80%', height: 10, bgcolor: alpha(theme.palette.grey[300], 0.5), borderRadius: 1, mb: 2 }} />
                    <Box sx={{ width: '100%', height: 6, bgcolor: alpha(theme.palette.grey[300], 0.5), borderRadius: 3, mb: 3 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.grey[300], 0.7), borderRadius: 1, mr: 1.5 }} />
                      <Box sx={{ width: '60%', height: 10, bgcolor: alpha(theme.palette.grey[300], 0.5), borderRadius: 1 }} />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <>
            {getFilteredQuests().length > 0 ? (
              <>
                {/* Netflix-style Category Sections */}
                {activeTab === 0 && !searchTerm && filters.category === 'all' && filters.difficulty === 'all' ? (
                  <>
                    {/* Show by difficulty */}
                    {getDifficultyQuests().easy.length > 0 && (
                      <CategorySection 
                        title="Easy Quests"
                        quests={getDifficultyQuests().easy}
                        onQuestClick={handleQuestClick}
                      />
                    )}
                    
                    {getDifficultyQuests().intermediate.length > 0 && (
                      <CategorySection 
                        title="Intermediate Quests"
                        quests={getDifficultyQuests().intermediate}
                        onQuestClick={handleQuestClick}
                      />
                    )}
                    
                    {getDifficultyQuests().advanced.length > 0 && (
                      <CategorySection 
                        title="Advanced Quests"
                        quests={getDifficultyQuests().advanced}
                        onQuestClick={handleQuestClick}
                      />
                    )}
                    
                    {/* Show by category */}
                    {Object.entries(getCategorizedQuests())
                      .filter(([category]) => category !== 'Uncategorized') // Skip the uncategorized entry
                      .map(([category, categoryQuests]) => (
                        <CategorySection 
                          key={category}
                          title={`${category} Quests`}
                          quests={categoryQuests}
                          onQuestClick={handleQuestClick}
                        />
                      ))
                    }
                  </>
                ) : (
                  <>
                    {/* Traditional Grid View for Filtered Results */}
                    <Grid container spacing={2}>
                      {getPaginatedQuests().map((quest) => (
                        <Grid item xs={6} sm={4} md={3} key={quest.id}>
                          <Box sx={{ height: 280 }}>
                            <QuestCard 
                              quest={quest} 
                              onClick={() => handleQuestClick(quest)} 
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    
                    {/* Pagination */}
                    {getFilteredQuests().length > itemsPerPage && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination 
                          count={Math.ceil(getFilteredQuests().length / itemsPerPage)} 
                          page={page}
                          onChange={handlePageChange}
                          color="primary"
                          size="large"
                          showFirstButton
                          showLastButton
                          sx={{
                            '& .MuiPaginationItem-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      </Box>
                    )}
                  </>
                )}
              </>
            ) : (
              <Box sx={{ 
                width: '100%', 
                textAlign: 'center', 
                py: 8,
                px: 2,
                background: alpha(theme.palette.background.paper, 0.5),
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
              }}>
                <Typography variant="h6" paragraph>
                  No quests found for the selected filters.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={handleClearFilters}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}
                >
                  View All Quests
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
      
      {/* Quest Detail Modal */}
      <QuestDetailModal 
        open={modalOpen}
        onClose={handleCloseModal}
        quest={selectedQuest}
        isAuthenticated={isAuthenticated}
        onEnroll={handleEnrollQuest}
        onClaimReward={handleClaimReward}
      />
    </Box>
  );
}