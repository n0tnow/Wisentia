'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  useTheme,
  alpha,
  Paper,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import Link from 'next/link';
import {
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  LocalActivity as NftIcon,
  Whatshot as TrendingIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  ChevronRight as ArrowRightIcon,
  Star as StarIcon,
  People as CommunityIcon,
  DevicesOutlined as DevicesIcon,
  Badge as BadgeIcon,
  FilterNone as ResourcesIcon,
  Flare as FlareIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

// Particle animation component
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const theme = useTheme();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let mouseX = 0;
    let mouseY = 0;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Create particles
    const createParticles = () => {
      const particleCount = Math.floor(window.innerWidth / 10);
      const particles = [];
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          color: theme.palette.primary.main,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          opacity: Math.random() * 0.5 + 0.1
        });
      }
      
      return particles;
    };
    
    particlesRef.current = createParticles();
    
    // Handle mouse movement
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle, index) => {
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around canvas
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Mouse interaction
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;
        
        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          particle.speedX += (dx / distance) * force * 0.02;
          particle.speedY += (dy / distance) * force * 0.02;
          
          // Limit speed
          const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
          if (speed > 1) {
            particle.speedX = (particle.speedX / speed) * 1;
            particle.speedY = (particle.speedY / speed) * 1;
          }
        }
        
        // Connect nearby particles
        particlesRef.current.forEach((otherParticle, otherIndex) => {
          if (index !== otherIndex) {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              const opacity = (100 - distance) / 100 * 0.2;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, ${opacity})`;
              ctx.stroke();
            }
          }
        });
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, ${particle.opacity})`;
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setCanvasDimensions);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme.palette.primary.main]);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }} 
    />
  );
};

// 3D floating card component
const FloatingCard = ({ children, delay = 0, ...props }) => {
  const [transform, setTransform] = useState('');
  
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };
  
  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
  };
  
  return (
    <Box
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      sx={{
        transition: 'transform 0.2s ease-out',
        transform: transform || 'perspective(1000px) rotateX(0) rotateY(0)',
        animation: `float ${3 + Math.random()}s ease-in-out ${delay}s infinite alternate`,
        '@keyframes float': {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '100%': { transform: 'translateY(-10px) rotate(2deg)' }
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Stats counter with animation
const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTime = useRef(null);
  
  useEffect(() => {
    startTime.current = Date.now();
    const animateCount = () => {
      const elapsedTime = Date.now() - startTime.current;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easeOutQuad(progress);
      countRef.current = Math.floor(easedProgress * end);
      setCount(countRef.current);
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };
    
    requestAnimationFrame(animateCount);
    
    return () => {
      countRef.current = 0;
      setCount(0);
    };
  }, [end, duration]);
  
  // Easing function
  const easeOutQuad = (t) => t * (2 - t);
  
  return (
    <Typography component="span" sx={{ fontWeight: 'bold' }}>
      {prefix}{count}{suffix}
    </Typography>
  );
};

// Animated background element
const AnimatedBackground = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: 0,
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {[...Array(6)].map((_, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: `${Math.random() * 300 + 200}px`,
            height: `${Math.random() * 300 + 200}px`,
            borderRadius: '50%',
            background: theme => `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, rgba(255,255,255,0) 70%)`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float${index} ${10 + Math.random() * 10}s infinite linear`,
            '@keyframes float0': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(100px, -50px) scale(1.1)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            },
            '@keyframes float1': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(-100px, 50px) scale(0.9)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            },
            '@keyframes float2': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(70px, 70px) scale(1.05)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            },
            '@keyframes float3': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(-70px, -70px) scale(0.95)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            },
            '@keyframes float4': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(120px, 10px) scale(1.1)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            },
            '@keyframes float5': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(-40px, 120px) scale(0.85)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            }
          }}
        />
      ))}
    </Box>
  );
};

// Glowing text component
const GlowingText = ({ children, color, glow = 10, ...props }) => {
  const theme = useTheme();
  const glowColor = color || theme.palette.primary.main;
  
  return (
    <Typography
      sx={{
        position: 'relative',
        color: glowColor,
        textShadow: `0 0 ${glow}px ${alpha(glowColor, 0.7)}`,
        animation: 'pulse 4s infinite alternate',
        '@keyframes pulse': {
          '0%': { textShadow: `0 0 ${glow}px ${alpha(glowColor, 0.7)}` },
          '100%': { textShadow: `0 0 ${glow + 5}px ${alpha(glowColor, 0.9)}` }
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

// Featured course card component
const CourseCard = ({ course, index }) => {
  const theme = useTheme();
  
  const getCategoryColor = (category) => {
    const colors = {
      'Computer Science': theme.palette.primary.main,
      'Mathematics': theme.palette.secondary.main,
      'Physics': theme.palette.warning.main,
      'Beginner': theme.palette.info.main,
      'Intermediate': theme.palette.warning.main,
      'Advanced': theme.palette.error.main
    };
    
    return colors[category] || theme.palette.primary.main;
  };
  
  return (
    <FloatingCard delay={index * 0.2}>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="div"
            sx={{
              pt: '56.25%',
              background: `linear-gradient(135deg, ${alpha(getCategoryColor(course.category), 0.8)} 0%, ${alpha(getCategoryColor(course.level), 0.9)} 100%)`,
              position: 'relative',
            }}
          />
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '30%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)'
          }} />
          <Chip 
            label={course.category} 
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: alpha(getCategoryColor(course.category), 0.9),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          <Chip 
            label={course.level} 
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: alpha(getCategoryColor(course.level), 0.9),
              color: 'white'
            }}
          />
          <IconButton 
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'white',
              '&:hover': {
                bgcolor: 'white',
                transform: 'scale(1.1)'
              }
            }}
          >
            <PlayIcon sx={{ color: getCategoryColor(course.category) }} />
          </IconButton>
        </Box>
        
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Typography gutterBottom variant="h5" component="h3" fontWeight="bold">
            {course.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SchoolIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {course.duration || '2 hours'} • {course.lessons || '8 lessons'}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {course.description || 'Learn the fundamentals and advance your skills with hands-on projects and quizzes.'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: theme.palette.primary.main }}>I</Avatar>
            <Typography variant="body2">
              {course.instructor || 'Dr. John Smith'}
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ color: theme.palette.warning.main, fontSize: 16 }} />
              <Typography variant="body2" fontWeight="bold" sx={{ ml: 0.5 }}>
                {course.rating || '4.8'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
        
        <Divider />
        
        <CardActions sx={{ p: 2, pt: 1, pb: 1 }}>
          <Button 
            component={Link} 
            href={`/courses/${course.id}`}
            endIcon={<ArrowRightIcon />}
            sx={{ 
              borderRadius: 2,
              fontWeight: 'bold',
              ml: 'auto'
            }}
          >
            View Course
          </Button>
        </CardActions>
      </Card>
    </FloatingCard>
  );
};

// Feature item component
const FeatureItem = ({ icon, title, description, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        p: 3,
        height: '100%',
        transition: 'all 0.3s ease',
        backgroundColor: 'background.paper',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
          transform: 'translateY(-5px)',
          backgroundColor: alpha(theme.palette.primary.main, 0.04)
        },
        animation: `fadeIn 0.8s ease-out ${delay}s both`,
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        }
      }}
    >
      <Box sx={{ 
        position: 'absolute', 
        width: 150, 
        height: 150, 
        borderRadius: '50%', 
        top: -50, 
        right: -50, 
        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, rgba(0,0,0,0) 70%)` 
      }} />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Avatar sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.1), 
          color: theme.palette.primary.main,
          width: 56,
          height: 56,
          mb: 2
        }}>
          {icon}
        </Avatar>
        
        <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Box>
  );
};

// Testimonial component
const Testimonial = ({ name, role, text, image, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <FloatingCard delay={delay} sx={{ height: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          height: '100%',
          backgroundColor: 'background.paper',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 4,
          height: '100%',
          bgcolor: theme.palette.primary.main,
        }} />
        
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Avatar src={image} sx={{ width: 60, height: 60, border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            {name.charAt(0)}
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">{name}</Typography>
            <Typography variant="body2" color="text.secondary">{role}</Typography>
          </Box>
          <Box sx={{ ml: 'auto', fontSize: 40, color: alpha(theme.palette.primary.main, 0.1), lineHeight: 1 }}>
            "
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
          "{text}"
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} fontSize="small" sx={{ color: theme.palette.warning.main }} />
          ))}
        </Box>
      </Paper>
    </FloatingCard>
  );
};

// Main Homepage Component
export default function Home() {
  const theme = useTheme();
  
  // Sample data for featured courses
  const featuredCourses = [
    { 
      id: 1, 
      title: "Introduction to Programming", 
      category: "Computer Science", 
      level: "Beginner",
      instructor: "Dr. Alan Turing",
      rating: 4.9,
      lessons: 12,
      duration: "6 hours",
      description: "Start your coding journey with this comprehensive introduction to programming fundamentals."
    },
    { 
      id: 2, 
      title: "Advanced Mathematics", 
      category: "Mathematics", 
      level: "Intermediate",
      instructor: "Prof. Ada Lovelace",
      rating: 4.7,
      lessons: 15,
      duration: "8 hours",
      description: "Dive into advanced mathematical concepts with real-world applications and problem-solving techniques."
    },
    { 
      id: 3, 
      title: "Quantum Physics Essentials", 
      category: "Physics", 
      level: "Advanced",
      instructor: "Dr. Marie Curie",
      rating: 4.8,
      lessons: 10,
      duration: "5 hours",
      description: "Explore the fascinating world of quantum mechanics and understand the fundamental principles."
    },
  ];
  
  // Sample testimonials
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      text: "Wisentia transformed my learning experience. The interactive courses and quests helped me master new skills quickly.",
      image: ""
    },
    {
      name: "Michael Chen",
      role: "Data Scientist",
      text: "The NFT certificates are a great addition! They're a unique way to showcase my accomplishments and keep me motivated.",
      image: ""
    },
    {
      name: "Olivia Rodriguez",
      role: "Student",
      text: "I've tried many online platforms, but Wisentia's gamified approach makes learning enjoyable and effective.",
      image: ""
    }
  ];
  
  // Stats
  const stats = [
    { value: 500, label: "Courses", icon: <SchoolIcon /> },
    { value: 1200, label: "Quests", icon: <QuestIcon /> },
    { value: 25000, label: "Learners", icon: <CommunityIcon /> },
    { value: 10000, label: "NFTs", icon: <NftIcon /> }
  ];

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          backgroundColor: 'background.default',
          color: 'text.primary',
          pt: { xs: 10, md: 12 },
          pb: { xs: 10, md: 12 },
          overflow: 'hidden',
        }}
      >
        <AnimatedBackground />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} sx={{ 
              animation: 'fadeInLeft 1s ease-out',
              '@keyframes fadeInLeft': {
                from: { opacity: 0, transform: 'translateX(-50px)' },
                to: { opacity: 1, transform: 'translateX(0)' }
              }
            }}>
              <Typography 
                variant="h2" 
                component="h1" 
                fontWeight="bold"
                sx={{ 
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                Empower Your Learning Journey
              </Typography>
              
              <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
                Discover interactive courses, complete engaging quests, and earn unique NFTs with our gamified education platform.
              </Typography>
              
              <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  component={Link} 
                  href="/courses"
                  color="primary"
                  endIcon={<ArrowRightIcon />}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.5,
                    px: 3,
                    fontWeight: 'bold',
                    boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 15px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                    }
                  }}
                >
                  Explore Courses
                </Button>
                
                <Button 
                  variant="outlined" 
                  size="large" 
                  component={Link} 
                  href="/quests"
                  sx={{ 
                    borderRadius: 2,
                    py: 1.5,
                    px: 3,
                    fontWeight: 'bold',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  View Quests
                </Button>
              </Stack>
              
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                {['Interactive', 'Gamified', 'NFT Certificates', 'Learn Anywhere'].map((tag, i) => (
                  <Chip 
                    key={i} 
                    label={tag} 
                    variant="outlined"
                    sx={{
                      borderRadius: 6,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      color: 'text.primary',
                      '& .MuiChip-label': { px: 1.5 }
                    }}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ 
              position: 'relative',
              minHeight: 400,
              animation: 'fadeInRight 1s ease-out',
              '@keyframes fadeInRight': {
                from: { opacity: 0, transform: 'translateX(50px)' },
                to: { opacity: 1, transform: 'translateX(0)' }
              }
            }}>
              {/* 3D Hero Image */}
              <Box sx={{ 
                position: 'relative', 
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                perspective: '1000px'
              }}>
                {/* Main Circle */}
                <Box sx={{
                  position: 'center',
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.3)} 100%)`,
                  boxShadow: `0 0 100px ${alpha(theme.palette.primary.main, 0.3)}`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  animation: 'pulse 4s infinite alternate',
                  '@keyframes pulse': {
                    '0%': { 
                      boxShadow: `0 0 100px ${alpha(theme.palette.primary.main, 0.3)}`,
                      transform: 'translate(-50%, -50%) scale(1)'
                    },
                    '100%': { 
                      boxShadow: `0 0 150px ${alpha(theme.palette.primary.main, 0.5)}`,
                      transform: 'translate(-50%, -50%) scale(1.05)'
                    }
                  }
                }} />
                
                {/* Orbiting Elements */}
                {[0, 1, 2].map((_, index) => (
                  <Box key={index} sx={{
                    position: 'absolute',
                    width: 350 + index * 100,
                    height: 350 + index * 100,
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                    animation: `orbit${index} ${10 + index * 5}s linear infinite`,
                    '@keyframes orbit0': {
                      '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                      '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
                    },
                    '@keyframes orbit1': {
                      '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                      '100%': { transform: 'translate(-50%, -50%) rotate(-360deg)' }
                    },
                    '@keyframes orbit2': {
                      '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                      '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
                    }
                  }}>
                    {/* Orbital Icons */}
                    <Avatar sx={{
                      position: 'absolute',
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.primary.main,
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                      width: 60,
                      height: 60,
                      top: index === 0 ? 0 : index === 1 ? '50%' : 'auto',
                      left: index === 0 ? '50%' : index === 1 ? 0 : '75%',
                      bottom: index === 2 ? 0 : 'auto',
                      right: index === 1 ? 'auto' : 'auto',
                      transform: 'translate(-50%, -50%)',
                      animation: `counterOrbit${index} ${10 + index * 5}s linear infinite`,
                      '@keyframes counterOrbit0': {
                        '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                        '100%': { transform: 'translate(-50%, -50%) rotate(-360deg)' }
                      },
                      '@keyframes counterOrbit1': {
                        '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                        '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
                      },
                      '@keyframes counterOrbit2': {
                        '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                        '100%': { transform: 'translate(-50%, -50%) rotate(-360deg)' }
                      }
                    }}>
                      {index === 0 ? <SchoolIcon fontSize="large" /> : 
                       index === 1 ? <QuestIcon fontSize="large" /> : 
                       <NftIcon fontSize="large" />}
                    </Avatar>
                  </Box>
                ))}
                
                {/* Center Icon */}
                <Avatar sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: theme.palette.background.paper,
                  color: theme.palette.primary.main,
                  boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
                  width: 80,
                  height: 80,
                  zIndex: 1
                }}>
                  <FlareIcon fontSize="large" />
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </Container>
        
        {/* Curved Shape Divider */}
        <Box sx={{
          position: 'absolute',
          bottom: -2,
          left: 0,
          width: '100%',
          overflow: 'hidden',
          lineHeight: 0,
          zIndex: 2
        }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{
              position: 'relative',
              display: 'block',
              width: 'calc(100% + 1.3px)',
              height: 60,
              transform: 'rotate(180deg)'
            }}
          >
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
              fill={theme.palette.background.paper}
            />
          </svg>
        </Box>
      </Box>
      
      {/* Stats Section */}
      <Box sx={{ 
        bgcolor: 'background.paper',
        py: 5,
        position: 'relative',
        zIndex: 3
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ 
                  textAlign: 'center',
                  py: 2,
                  animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`,
                  '@keyframes fadeInUp': {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' }
                  }
                }}>
                  <Avatar sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2
                  }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" component="p" fontWeight="bold" gutterBottom>
                    <AnimatedCounter end={stat.value} prefix={stat.value >= 10000 ? '+' : ''} />
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Featured Courses Section */}
      <Box sx={{ 
        bgcolor: 'background.paper',
        py: 10,
        position: 'relative'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            mb: 6, 
            textAlign: 'center',
            animation: 'fadeIn 1s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}>
            <GlowingText 
              variant="h6" 
              component="p" 
              color={theme.palette.primary.main}
              glow={10}
              sx={{ mb: 1, fontWeight: 'bold' }}
            >
              FEATURED COURSES
            </GlowingText>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Start Your Learning Journey
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Discover our most popular courses designed to help you master new skills and advance your career.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {featuredCourses.map((course, index) => (
              <Grid item key={course.id} xs={12} sm={6} md={4}>
                <CourseCard course={course} index={index} />
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              size="large" 
              component={Link} 
              href="/courses"
              endIcon={<ArrowRightIcon />}
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                px: 3,
                fontWeight: 'bold',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                }
              }}
            >
              View All Courses
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box sx={{
        position: 'relative',
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        py: 10,
        overflow: 'hidden'
      }}>
        {/* Animated Background */}
        <AnimatedBackground />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            mb: 6, 
            textAlign: 'center',
            animation: 'fadeIn 1s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}>
            <GlowingText 
              variant="h6" 
              component="p" 
              color={theme.palette.primary.main}
              glow={10}
              sx={{ mb: 1, fontWeight: 'bold' }}
            >
              WHY CHOOSE WISENTIA
            </GlowingText>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Learning Reimagined
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Discover how our innovative platform transforms traditional education into an engaging and rewarding experience.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6} lg={3}>
              <FeatureItem 
                icon={<SchoolIcon fontSize="large" />}
                title="Interactive Learning"
                description="Engage with interactive content and quizzes that make learning fun and effective."
                delay={0.1}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <FeatureItem 
                icon={<QuestIcon fontSize="large" />}
                title="Quest-Based Progress"
                description="Complete quests to demonstrate your knowledge and earn points and rewards."
                delay={0.2}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <FeatureItem 
                icon={<NftIcon fontSize="large" />}
                title="NFT Certifications"
                description="Earn unique NFTs as proof of your achievements and showcase your skills."
                delay={0.3}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <FeatureItem 
                icon={<DevicesIcon fontSize="large" />}
                title="Learn Anywhere"
                description="Access your courses and track your progress from any device, anytime, anywhere."
                delay={0.4}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Testimonials Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            mb: 6, 
            textAlign: 'center',
            animation: 'fadeIn 1s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' }
            }
          }}>
            <GlowingText 
              variant="h6" 
              component="p" 
              color={theme.palette.primary.main}
              glow={10}
              sx={{ mb: 1, fontWeight: 'bold' }}
            >
              TESTIMONIALS
            </GlowingText>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              What Our Learners Say
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Join thousands of satisfied learners who have transformed their skills and careers with Wisentia.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item key={index} xs={12} md={4}>
                <Testimonial 
                  name={testimonial.name}
                  role={testimonial.role}
                  text={testimonial.text}
                  image={testimonial.image}
                  delay={index * 0.2}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box sx={{ 
        position: 'relative',
        bgcolor: 'background.default',
        py: 10,
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.03)} 0%, ${alpha(theme.palette.secondary.dark, 0.05)} 100%)`,
          zIndex: 0
        }} />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Paper elevation={0} sx={{
            borderRadius: 6,
            overflow: 'hidden',
            backgroundColor: 'background.paper',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <Box sx={{
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Elements */}
              <Box sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, rgba(255,255,255,0) 70%)`,
                zIndex: 0
              }} />
              <Box sx={{
                position: 'absolute',
                bottom: -100,
                left: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.05)} 0%, rgba(255,255,255,0) 70%)`,
                zIndex: 0
              }} />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <GlowingText 
                  variant="h6" 
                  component="p" 
                  color={theme.palette.primary.main}
                  glow={10}
                  sx={{ mb: 1, fontWeight: 'bold' }}
                >
                  GET STARTED TODAY
                </GlowingText>
                <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                  Ready to Transform Your Learning?
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                  Join Wisentia and start your journey towards mastering new skills, earning rewards, and building your portfolio of achievements.
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                  <Button 
                    variant="contained" 
                    size="large" 
                    component={Link} 
                    href="/auth/register"
                    color="primary"
                    sx={{ 
                      borderRadius: 2,
                      py: 1.5,
                      px: 4,
                      fontWeight: 'bold',
                      boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 15px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                      }
                    }}
                  >
                    Create Account
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="large" 
                    component={Link} 
                    href="/auth/login"
                    sx={{ 
                      borderRadius: 2,
                      py: 1.5,
                      px: 4,
                      fontWeight: 'bold',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    Sign In
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}