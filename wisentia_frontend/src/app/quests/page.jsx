'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent, 
  CardActions, CardMedia, Divider, TextField, CircularProgress, 
  Modal, Fade, Backdrop, IconButton, Stack, Chip, Avatar, Paper,
  LinearProgress, Drawer, Switch, FormGroup, FormControlLabel,
  Select, MenuItem, FormControl, InputLabel, Pagination,
  useMediaQuery, Tabs, Tab, List, ListItem, ListItemText, useTheme, alpha,
  Collapse, Alert
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExtensionIcon from '@mui/icons-material/Extension';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TokenIcon from '@mui/icons-material/Token';
import CategoryIcon from '@mui/icons-material/Category';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TuneIcon from '@mui/icons-material/Tune';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import LoopIcon from '@mui/icons-material/Loop';
import InfoIcon from '@mui/icons-material/Info';
import CircleIcon from '@mui/icons-material/Circle';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

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
const QuestCard = ({ quest, onClick, onEnroll, isAuthenticated }) => {
  const theme = useTheme();
  const [hover, setHover] = useState(false);
  
  if (!quest) {
    return null;
  }
  
  // Helper function to get color based on difficulty
  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return theme.palette.primary.main;
    
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

  // Safely get values with fallbacks - check all possible property names
  const difficulty = quest.difficulty || quest.DifficultyLevel || quest.difficultyLevel || '';
  const title = quest.title || quest.Title || '';
  const description = quest.description || quest.Description || '';
  const rewardPoints = quest.rewardPoints || quest.RewardPoints || 0;
  const category = quest.category || quest.Category || '';
  const progress = quest.progress || {};
  const completionPercentage = progress.completionPercentage || 0;
  const isStarted = progress.currentProgress !== undefined;
  const isCompleted = progress.isCompleted || false;
  const questId = quest.QuestID || quest.id || quest.questId;

  // Determine if we should show the start button
  const showStartButton = isAuthenticated && !isStarted && !isCompleted;

  // Handle start button click
  const handleStartClick = (e) => {
    e.stopPropagation(); // Prevent card click from triggering
    if (onEnroll && questId) {
      onEnroll(questId);
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
        border: hover ? `1px solid ${alpha(getDifficultyColor(difficulty), 0.3)}` : 'none',
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Top section with colored background */}
      <Box sx={{ 
        position: 'relative',
        height: 140, // Fixed height instead of aspect ratio
        background: `linear-gradient(135deg, ${alpha(getDifficultyColor(difficulty), 0.8)}, ${alpha(theme.palette.secondary.main, 0.7)})`,
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
        {difficulty && (
        <Chip 
            label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} 
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
        )}
        
        {category && (
        <Chip 
            label={category} 
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
        )}
        
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
            {rewardPoints} pts
          </Typography>
        </Box>
        
        {/* Play button on hover */}
        {hover && !showStartButton && (
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
          {title}
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
          {description}
        </Typography>
        
        {/* Progress indicator or status chip */}
        {isCompleted ? (
          <Chip 
            icon={<CheckCircleIcon fontSize="small" />}
            label="Completed" 
            size="small"
            sx={{ 
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              borderRadius: 1,
              fontWeight: 'medium',
              fontSize: '0.7rem',
              mt: 'auto',
              alignSelf: 'flex-start'
            }}
          />
        ) : isStarted ? (
          <Box sx={{ mt: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Progress</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                {completionPercentage}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={completionPercentage} 
              sx={{ 
                height: 4, 
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }} 
            />
          </Box>
        ) : showStartButton ? (
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayArrowIcon />}
            onClick={handleStartClick}
            sx={{
              mt: 'auto',
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              borderRadius: 1.5,
              boxShadow: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                boxShadow: 3,
              }
            }}
          >
            Start Quest
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};

// Get bottom section of QuestDetailModal with enrollment/claim buttons
const QuestDetailActionsSection = ({ quest, isAuthenticated, onEnroll, onClaimReward, loading }) => {
  const theme = useTheme();
  
  // Safely get progress data
  const progress = quest.progress || {};
  const isCompleted = progress.isCompleted || false;
  const rewardClaimed = progress.rewardClaimed || false;
  
  if (!isAuthenticated) {
    return (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          href="/login?redirect=/quests"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 'bold',
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          }}
        >
          Login to Start Quest
        </Button>
      </Box>
    );
  }
  
  // User enrolled, completed but not claimed
  if (isCompleted && !rewardClaimed) {
    return (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button 
          variant="contained"
          color="secondary"
          onClick={onClaimReward}
          disabled={loading}
          startIcon={<EmojiEventsIcon />}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 'bold',
            fontSize: '1rem',
            textTransform: 'none',
            background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Claim Reward'}
        </Button>
      </Box>
    );
  }
  
  // User enrolled and claimed reward
  if (isCompleted && rewardClaimed) {
    return (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            borderRadius: 2,
        display: 'flex', 
        alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          <CheckCircleIcon color="success" />
          <Typography color="success.main" fontWeight="medium">
            Quest completed and reward claimed!
          </Typography>
        </Paper>
        </Box>
    );
  }
  
  // User enrolled but not completed
  if (progress.currentProgress !== undefined) {
    const percentage = Math.min(100, Math.max(0, progress.currentProgress));
    
    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Quest Progress
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {percentage}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={percentage} 
            sx={{ 
              mt: 1, 
              height: 8, 
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }} 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Complete the conditions above to earn your reward.
          </Typography>
      </Box>
    );
  }
  
  // Default: Not enrolled
  return (
    <Box sx={{ mt: 3, textAlign: 'center' }}>
      <Button 
        variant="contained"
        onClick={onEnroll}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
        sx={{
          px: 4,
          py: 1.5,
          borderRadius: 2,
          fontWeight: 'bold',
          fontSize: '1rem',
          textTransform: 'none',
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        }}
      >
        {loading ? 'Starting...' : 'Start Quest'}
      </Button>
    </Box>
  );
};

// Quest Detail Modal Component - Netflix style
const QuestDetailModal = ({ open, onClose, quest, isAuthenticated, onEnroll, onClaimReward, loading }) => {
  const theme = useTheme();
  
  // If quest is not defined, don't render anything
  if (!quest) {
    return null;
  }
  
  // Safely extract properties with fallbacks
  const title = quest.title || quest.Title || '';
  const description = quest.description || quest.Description || '';
  const difficulty = quest.difficulty || quest.DifficultyLevel || '';
  const rewardPoints = quest.rewardPoints || quest.RewardPoints || 0;
  // Make sure conditions is always an array
  const conditions = Array.isArray(quest.conditions) 
    ? quest.conditions 
    : Array.isArray(quest.Conditions) 
      ? quest.Conditions 
      : [];
  const progress = quest.progress || {};
  const completionPercentage = progress.completionPercentage || 0;
  const rewardNft = quest.rewardNft || {};
  
  // Helper function to get color based on difficulty
  const getDifficultyColor = (diff) => {
    if (!diff) return theme.palette.primary.main;
    
    switch (diff.toLowerCase()) {
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

  // Extract topic from conditions or description
  const getTopic = () => {
    // First check conditions
    if (conditions && conditions.length > 0) {
      const conditionTypes = conditions.map(c => c.conditionType || c.type).filter(Boolean);
      if (conditionTypes.includes('course_completion')) return 'Learning';
      if (conditionTypes.includes('quiz_score')) return 'Quiz';
    }
    
    // Then check description for keywords
    if (description) {
      if (/\bweb3\b|\bblockchain\b|\bcrypto\b|\bnft\b/i.test(description)) {
        return 'Web3';
      }
      if (/\bcoding\b|\bprogramming\b|\bdevelop(er|ment)?\b/i.test(description)) {
        return 'Coding';
      }
      if (/\bdesign\b|\bui\b|\bux\b/i.test(description)) {
        return 'Design';
      }
    }
    
    return 'General';
  };
  
  // Basic handler for enrollment - calls parent handler
  const handleEnroll = () => {
    const questId = quest.QuestID || quest.id || quest.questId; 
    if (onEnroll && questId) {
      onEnroll(questId);
    }
  };
  
  // Basic handler for reward claiming - calls parent handler
  const handleClaimReward = () => {
    const questId = quest.QuestID || quest.id || quest.questId;
    if (onClaimReward && questId) {
      onClaimReward(questId);
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
                background: `linear-gradient(135deg, ${alpha(getDifficultyColor(difficulty), 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
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
                  color: getDifficultyColor(difficulty),
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
                {title}
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {difficulty && (
                <Chip 
                    label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} 
                  size="small" 
                  sx={{ 
                    bgcolor: alpha('#fff', 0.3),
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
                )}
                
                <Chip 
                  icon={<TokenIcon sx={{ color: 'white !important', fontSize: '0.8rem' }} />}
                  label={`${rewardPoints} Points`}
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
                
                {/* Add topic tag */}
                <Chip 
                  label={getTopic()}
                  size="small" 
                  sx={{ 
                    bgcolor: alpha('#fff', 0.3),
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              </Stack>
            </Box>
          </Box>
          
          {/* Modal content */}
          <Box sx={{ p: 3 }}>
            {/* Quest description */}
            <Typography variant="body1" paragraph>
              {description}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Quest conditions */}
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quest Conditions
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              {conditions && conditions.length > 0 ? (
                conditions.map((condition, index) => {
                  // Extract condition properties safely
                  const conditionId = condition.conditionId || condition.ConditionID || index;
                  const conditionType = condition.conditionType || condition.ConditionType || '';
                  const conditionDescription = condition.description || condition.Description || 'Complete this condition';
                  
                  return (
                <Paper 
                      key={conditionId}
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
                      <Box 
                  sx={{ 
                          mr: 2, 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                    display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                  }}
                >
                        {progress?.isCompleted ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CircleIcon 
                    sx={{ 
                              fontSize: 24, 
                              color: alpha(theme.palette.text.secondary, 0.5)
                            }} 
                          />
                        )}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {conditionDescription}
                    </Typography>
                        {conditionType && (
                          <Typography variant="caption" color="text.secondary">
                            {conditionType.charAt(0).toUpperCase() + conditionType.slice(1).replace('_', ' ')}
                    </Typography>
                        )}
                  </Box>
                </Paper>
                  );
                })
              ) : (
                  <Paper 
                    elevation={0}
                    sx={{ 
                    p: 3,
                    mb: 2,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                    border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                      borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <InfoIcon sx={{ color: theme.palette.info.main, mb: 1, fontSize: 32 }} />
                  <Typography variant="body1" paragraph>
                    This quest has no specific conditions to complete.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                    Just start the quest to participate and earn your reward.
                      </Typography>
                  </Paper>
              )}
            </Box>
            
                <Divider sx={{ my: 2 }} />
                
            {/* Action Buttons */}
            <QuestDetailActionsSection 
              quest={quest} 
              isAuthenticated={isAuthenticated}
              onEnroll={handleEnroll}
              onClaimReward={handleClaimReward}
              loading={loading}
            />
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

// Category Section Component
const CategorySection = ({ title, quests, onQuestClick, onEnroll, isAuthenticated }) => {
  const theme = useTheme();
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Format title with proper capitalization
  const formattedTitle = title ? (
    title.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  ) : '';
  
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
        {formattedTitle}
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
              key={quest.QuestID || quest.id || quest.questId || Math.random().toString(36).substring(2, 9)} 
              sx={{ 
                minWidth: { xs: '80%', sm: '40%', md: '25%', lg: '22%' },
                maxWidth: { xs: '80%', sm: '40%', md: '25%', lg: '22%' },
                height: 320,
                flexShrink: 0,
              }}
            >
              <QuestCard 
                quest={quest} 
                onClick={() => onQuestClick(quest)} 
                onEnroll={onEnroll} 
                isAuthenticated={isAuthenticated} 
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// Filters section in the QuestsPage component
const FilterSection = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  availableDifficulties,
  availableCategories,
  availableTopics
}) => {
  return (
    <Grid container spacing={2}>
      {/* Difficulty filter */}
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Difficulty</InputLabel>
          <Select
            value={filters.difficulty}
            label="Difficulty"
            onChange={(e) => onFilterChange('difficulty', e.target.value)}
          >
            <MenuItem value="all">All Difficulties</MenuItem>
            {availableDifficulties.map(difficulty => (
              <MenuItem key={difficulty} value={difficulty.toLowerCase()}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </MenuItem>
            ))}
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
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {availableCategories.map(category => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      {/* Topic/Type filter */}
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Topic</InputLabel>
          <Select
            value={filters.topic}
            label="Topic"
            onChange={(e) => onFilterChange('topic', e.target.value)}
          >
            <MenuItem value="all">All Topics</MenuItem>
            {availableTopics.map(topic => (
              <MenuItem key={topic} value={topic}>
                {topic}
              </MenuItem>
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
            onChange={(e) => onFilterChange('sort', e.target.value)}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="points-high">Highest Points</MenuItem>
            <MenuItem value="points-low">Lowest Points</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      {/* Clear filters button */}
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          onClick={onClearFilters} 
          startIcon={<FilterListIcon />}
          size="small"
        >
          Clear Filters
        </Button>
      </Grid>
    </Grid>
  );
};

// Main Quests Page Component
export default function QuestsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, token, user, updateUser } = useAuth();
  const toast = useToast();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [enrolledQuests, setEnrolledQuests] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [rewardAnimation, setRewardAnimation] = useState(false);
  const [rewardNFT, setRewardNFT] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    topic: 'all',
    sort: 'newest'
  });
  const [page, setPage] = useState(1);
  const questsPerPage = 12;
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());
  
  // Get unique values for filters
  const availableDifficulties = useMemo(() => {
    return ['all', ...new Set(quests.map(quest => 
      (quest.difficulty || quest.DifficultyLevel || '').toLowerCase()
    ).filter(Boolean))];
  }, [quests]);
  
  const availableCategories = useMemo(() => {
    return ['all', ...new Set(quests.map(quest => 
      quest.category || quest.Category || ''
    ).filter(Boolean))];
  }, [quests]);
  
  const availableTopics = useMemo(() => {
    // Extract topics from quests based on condition types and descriptions
    const topics = new Set(quests.map(quest => {
      // Check conditions first
      const conditions = quest.conditions || [];
      if (conditions.some(c => (c.type || c.conditionType || '').includes('course')))
        return 'Learning';
      if (conditions.some(c => (c.type || c.conditionType || '').includes('quiz')))
        return 'Quiz';
        
      // Then check description
      const desc = quest.description || quest.Description || '';
      if (/\bweb3\b|\bblockchain\b|\bcrypto\b/i.test(desc))
        return 'Web3';
      if (/\bcoding\b|\bprogramming\b/i.test(desc))
        return 'Coding';
      if (/\bdesign\b|\bui\b|\bux\b/i.test(desc))
        return 'Design';
        
      return ''; // Default
    }).filter(Boolean));
    
    return ['all', ...topics];
  }, [quests]);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchQuests();
    } else {
      setQuests([]);
      setLoading(false);
    }
  }, [isAuthenticated, refreshTrigger]);
  
  const fetchQuests = async () => {
    if (!isAuthenticated) {
      // If not authenticated, only fetch public quests
      setLoading(true);
      try {
        const response = await fetch('/api/quests/');
        if (!response.ok) {
          throw new Error('Failed to fetch quests');
        }
        const data = await response.json();
        setQuests(data);
      } catch (error) {
        console.error('Error fetching quests:', error);
        setError('Failed to load quests. Please try again later.');
        setQuests([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // If authenticated, fetch quests with user progress
    setLoading(true);
    try {
      const response = await fetch('/api/quests/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch quests');
      }
      
      const data = await response.json();
      console.log('Quests data:', data);
      setQuests(data);
      
      // Filter enrolled and completed quests
      const enrolled = data.filter(quest => quest.userProgress && !quest.userProgress.isCompleted);
      const completed = data.filter(quest => quest.userProgress && quest.userProgress.isCompleted);
      
      setEnrolledQuests(enrolled);
      setCompletedQuests(completed);
      
    } catch (error) {
      console.error('Error fetching quests:', error);
      setError('Failed to load quests. Please try again later.');
      setQuests([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Quest card click handler
  const handleQuestClick = (quest) => {
    setSelectedQuest(quest);
    setModalOpen(true);
    
    // Quest detaylarını API'den getir
    if (quest?.QuestID || quest?.id || quest?.questId) {
      const questId = quest.QuestID || quest.id || quest.questId;
      
      // Set loading state while fetching details
      setLoading(true);
      
      fetch(`/api/quests/${questId}`)
        .then(res => {
          if (!res.ok) {
            // Handle non-200 responses
            if (res.status === 404) {
              throw new Error('Quest not found');
            } else if (res.status === 401) {
              throw new Error('Authentication required');
            }
            throw new Error(`API error: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          // Only update if we have valid data
          if (data) {
            // Check for error property
            if (data && typeof data === 'object' && 'error' in data) {
              console.error('Error in quest detail response:', data.error);
              toast.error('Failed to load quest details');
              return;
            }
            
            // Log the data to help with debugging
            console.log('Quest details received:', data);
            
            // Update the selected quest with details from the API
            setSelectedQuest(prevQuest => ({...prevQuest, ...data}));
          }
        })
        .catch(err => {
          console.error('Error fetching quest details:', err);
          toast.error('Failed to load quest details. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  
  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1); // Reset to first page when tab changes
  };
  
  // Search handler
  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1); // Reset page when search changes
  };
  
  // Filter change handler
  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    setPage(1); // Reset page when filters change
  };
  
  // Clear filters handler
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      difficulty: 'all',
      category: 'all',
      topic: 'all',
      sort: 'newest'
    });
    setPage(1); // Reset page when filters are cleared
  };
  
  // Function to check quest progress
  const checkQuestProgress = async (questId) => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      // Get token for authorization
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        return;
      }

      // Call the check-progress endpoint
      const response = await fetch(`/api/quests/${questId}/check-progress`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to check quest progress:', response.status);
        return;
      }

      const data = await response.json();
      console.log('Quest progress checked:', data);

      if (data.success) {
        // Update the quest progress in state
        setSelectedQuest(prev => {
          if (prev && prev.QuestID === questId) {
            return {
              ...prev,
              progress: {
                currentProgress: data.currentProgress || 0,
                isCompleted: data.isCompleted || false,
                completionPercentage: data.progressPercentage || 0,
                rewardClaimed: prev.progress?.rewardClaimed || false
              },
              conditions: Array.isArray(prev.conditions) ? prev.conditions.map((condition, index) => {
                // If we have progress data for this condition, update it
                if (data.conditions && data.conditions[index]) {
                  return {
                    ...condition,
                    progress: data.conditions[index].progress
                  };
                }
                return condition;
              }) : []
            };
          }
          return prev;
        });

        // Also update the quests list if this quest is in it
        setQuests(prevQuests => {
          return prevQuests.map(quest => {
            if (quest.QuestID === questId) {
              return {
                ...quest,
                userProgress: {
                  currentProgress: data.currentProgress || 0,
                  isCompleted: data.isCompleted || false,
                  completionPercentage: data.progressPercentage || 0,
                  rewardClaimed: quest.userProgress?.rewardClaimed || false
                }
              };
            }
            return quest;
          });
        });
      }
    } catch (error) {
      console.error('Error checking quest progress:', error);
    }
  };

  const handleEnrollQuest = (questId) => {
    if (!isAuthenticated) {
      toast?.warn('Bu göreve katılmak için giriş yapmalısınız.');
      router.push('/login?redirect=/quests');
      return;
    }
    
    // Set loading state
    setLoading(true);

    // Get token for authorization
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      toast?.error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      router.push('/login?redirect=/quests');
      setLoading(false);
      return;
    }

    // API'ye ilerleme başlatma isteği gönder
    fetch(`/api/quests/${questId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        completedConditionIds: []
      })
    })
      .then(res => {
        // Log the raw response for debugging
        console.log(`Progress API response status: ${res.status}`);
        
        // Handle HTTP errors first
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            toast?.error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
            router.push('/login?redirect=/quests');
            throw new Error('Authentication required');
          } else if (res.status === 400) {
            return res.json().then(errorData => {
              // Check if this is the specific "Quest koşulları bulunamadı" error
              // which we should now handle gracefully instead of showing an error
              if (errorData?.error === "Quest koşulları bulunamadı") {
                console.log("Quest has no conditions, but proceeding with enrollment");
                return {
                  success: true,
                  message: "Successfully enrolled in quest with no conditions",
                  progress: {
                    currentProgress: 1,
                    isCompleted: true,
                    completionPercentage: 100 
                  }
                };
              }
              throw new Error(errorData?.error || 'Bad request: Invalid quest ID or parameters');
            });
          } else if (res.status === 404) {
            throw new Error('Quest not found');
          } else {
            throw new Error(`Server error: ${res.status}`);
          }
        }
        
        // Try to parse JSON response
        return res.json().catch(() => {
          // If JSON parsing fails, return a default success object
          console.warn('Could not parse JSON response, using default');
          return { success: true, message: 'Successfully enrolled in quest' };
        });
      })
      .then(data => {
        console.log('Progress API response data:', data);
        
        // Always check if data exists before proceeding
        if (!data) {
          toast?.error('Invalid response from server');
          return;
        }
        
        // Safely check for success property
        if (data.success) {
          toast?.success('Göreve katılım başarılı!');
          
          // Seçili görevi güncelle
          setSelectedQuest(prev => {
            // Make a deep copy to ensure we don't have reference issues
            const updatedQuest = {...prev};
            
            // Update progress information
            updatedQuest.progress = data.progress || { 
              currentProgress: 0,
              isCompleted: false,
              completionPercentage: 0
            };
            
            // Ensure that conditions are properly handled
            if (!Array.isArray(updatedQuest.conditions) || updatedQuest.conditions.length === 0) {
              // For quests with no conditions, make sure we don't display errors
              console.log("Setting empty conditions array for quest without conditions");
              updatedQuest.conditions = [];
            }
            
            return updatedQuest;
          });
          
          // Check actual progress to properly update conditions and progress
          setTimeout(() => {
            checkQuestProgress(questId);
          }, 500);
          
          // Refresh quests after successful enrollment
          setTimeout(() => {
            // Use directly from state updates since fetchQuests is not accessible here
            // This will refresh the quests list by refetching from API
            setQuests(prev => {
              // Force refresh of quests list by updating state
              // This will trigger the useEffect to refetch quests
              setRefreshTrigger(Date.now());
              return prev;
            });
          }, 1000);
        } else {
          // Handle API error responses
          const errorMessage = data.error || 'Göreve katılım sırasında bir hata oluştu.';
          toast?.error(errorMessage);
        }
      })
      .catch(err => {
        console.error('Göreve katılım sırasında hata:', err);
        // Only show toast if it's not already handled and toast is defined
        if (err && err.message !== 'Authentication required' && typeof toast !== 'undefined') {
          toast?.error(err.message || 'Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Claim reward handler
  const handleClaimReward = async (questId) => {
    if (!isAuthenticated) {
      toast.warn('Ödül almak için giriş yapmalısınız.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/quests/${questId}/claim-reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('access_token')}` : ''
        }
      });

      // Handle failed responses
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
          router.push('/login?redirect=/quests');
          return;
        }
        
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      // Parse the successful response
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Error parsing success response:', e);
        data = { success: true };
      }

      if (data && data.success) {
        if (typeof toast !== 'undefined') {
          toast.success('Ödülünüz başarıyla talep edildi!');
        }
        
        // Animasyon efekti
        setRewardAnimation(true);
        
        // Kazanılan puanları göster
        if (data.rewards && data.rewards.points) {
          toast.success(`${data.rewards.points} puan kazandınız!`);
        }
        
        // NFT kazanıldıysa bildirim göster
        if (data.rewards && data.rewards.nft) {
          setRewardNFT(true);
          toast.success('Bir NFT ödülü kazandınız!');
        }
        
        // Seçili görevi güncelle
        setSelectedQuest(prev => ({
          ...prev,
          progress: {
            ...prev.progress,
            rewardClaimed: true
          }
        }));
        
        // Kullanıcı bilgilerini güncelle (örn. toplam puanları)
        if (updateUser) {
          updateUser();
        }
        
        // 3 saniye sonra animasyonu kapat
        setTimeout(() => {
          setRewardAnimation(false);
          setRewardNFT(false);
        }, 3000);
      } else {
        // Handle API response without success field
        toast.error(data && data.error ? data.error : 'Ödül alınamadı. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      console.error('Ödül talep edilirken hata oluştu:', error);
      toast.error(error && error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter quests based on tab
  const getFilteredQuests = () => {
    if (!quests || !Array.isArray(quests)) return [];
    
    return quests.filter(quest => {
      // Filter by difficulty
    if (filters.difficulty !== 'all') {
        const questDifficulty = quest.difficulty || quest.DifficultyLevel || '';
        if (questDifficulty.toLowerCase() !== filters.difficulty.toLowerCase()) {
          return false;
        }
    }
    
      // Filter by category
    if (filters.category !== 'all') {
        const questCategory = quest.category || quest.Category || '';
        if (questCategory !== filters.category) {
          return false;
        }
      }
      
      // Filter by topic
      if (filters.topic !== 'all') {
        // Check quest conditions for topic match
        const conditions = quest.conditions || [];
        const conditionTypes = conditions.map(c => c.conditionType || c.type).filter(Boolean);
        
        // Check description for topic keywords
        const description = quest.description || quest.Description || '';
        
        // Check for Web3 topic
        if (filters.topic === 'Web3' && 
            !(/\bweb3\b|\bblockchain\b|\bcrypto\b|\bnft\b/i.test(description)) &&
            !conditionTypes.some(type => /blockchain|crypto|nft|token|web3/i.test(type))) {
          return false;
        }
        
        // Check for Coding topic
        if (filters.topic === 'Coding' && 
            !(/\bcoding\b|\bprogramming\b|\bdevelop(er|ment)?\b/i.test(description)) &&
            !conditionTypes.some(type => /coding|programming|develop/i.test(type))) {
          return false;
        }
        
        // Check for Design topic
        if (filters.topic === 'Design' && 
            !(/\bdesign\b|\bui\b|\bux\b/i.test(description)) &&
            !conditionTypes.some(type => /design|ui|ux/i.test(type))) {
          return false;
        }
        
        // Check for Learning topic
        if (filters.topic === 'Learning' && 
            !(/\blearn\b|\beducation\b|\bcourse\b|\bstudy\b/i.test(description)) &&
            !conditionTypes.includes('course_completion')) {
          return false;
        }
        
        // Check for Quiz topic
        if (filters.topic === 'Quiz' && 
            !(/\bquiz\b|\btest\b|\bexam\b|\bchallenge\b/i.test(description)) &&
            !conditionTypes.includes('quiz_score')) {
          return false;
        }
      }
      
      // Search
      if (searchTerm) {
        const title = quest.title || quest.Title || '';
        const description = quest.description || quest.Description || '';
        const searchRegex = new RegExp(searchTerm, 'i');
        if (!searchRegex.test(title) && !searchRegex.test(description)) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => {
      // Sort based on selected sort option
      if (filters.sort === 'newest') {
        // Assuming each quest has a creationDate property
        const dateA = new Date(a.creationDate || a.CreationDate || 0);
        const dateB = new Date(b.creationDate || b.CreationDate || 0);
        return dateB - dateA;
      } else if (filters.sort === 'points-high') {
        const pointsA = a.rewardPoints || a.RewardPoints || 0;
        const pointsB = b.rewardPoints || b.RewardPoints || 0;
        return pointsB - pointsA;
      } else if (filters.sort === 'points-low') {
        const pointsA = a.rewardPoints || a.RewardPoints || 0;
        const pointsB = b.rewardPoints || b.RewardPoints || 0;
        return pointsA - pointsB;
      }
      return 0;
    });
  };
  
  // Get paginated quests
  const getPaginatedQuests = () => {
    const filteredQuests = getFilteredQuests();
    const startIndex = (page - 1) * questsPerPage;
    return filteredQuests.slice(startIndex, startIndex + questsPerPage);
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
    
    // Group by difficulty (case-insensitive matching)
    const difficulties = {
      easy: filteredQuests.filter(q => (q.difficulty || '').toLowerCase() === 'easy'),
      intermediate: filteredQuests.filter(q => (q.difficulty || '').toLowerCase() === 'intermediate'),
      advanced: filteredQuests.filter(q => (q.difficulty || '').toLowerCase() === 'advanced')
    };
    
    return difficulties;
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
              { icon: <SignalCellularAltIcon />, value: "3", label: "Difficulty Levels" }
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
            <FilterSection 
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              availableDifficulties={availableDifficulties}
              availableCategories={availableCategories}
              availableTopics={availableTopics}
            />
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
              <Grid xs={12} sm={6} md={3} key={item}>
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
                        onEnroll={handleEnrollQuest}
                        isAuthenticated={isAuthenticated}
                      />
                    )}
                    
                    {getDifficultyQuests().intermediate.length > 0 && (
                      <CategorySection 
                        title="Intermediate Quests"
                        quests={getDifficultyQuests().intermediate}
                        onQuestClick={handleQuestClick}
                        onEnroll={handleEnrollQuest}
                        isAuthenticated={isAuthenticated}
                      />
                    )}
                    
                    {getDifficultyQuests().advanced.length > 0 && (
                      <CategorySection 
                        title="Advanced Quests"
                        quests={getDifficultyQuests().advanced}
                        onQuestClick={handleQuestClick}
                        onEnroll={handleEnrollQuest}
                        isAuthenticated={isAuthenticated}
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
                          onEnroll={handleEnrollQuest}
                          isAuthenticated={isAuthenticated}
                        />
                      ))
                    }
                  </>
                ) : (
                  <>
                    {/* Traditional Grid View for Filtered Results */}
                    <Grid container spacing={2}>
                      {getPaginatedQuests().map((quest) => (
                        <Grid xs={6} sm={4} md={3} key={quest.id}>
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
                    {getFilteredQuests().length > questsPerPage && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination 
                          count={Math.ceil(getFilteredQuests().length / questsPerPage)} 
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
        loading={loading}
      />
    </Box>
  );
}