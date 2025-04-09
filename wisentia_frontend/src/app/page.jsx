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
  Tooltip,
  useMediaQuery
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
  MoreVert as MoreIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Optimize edilmiş parçacık animasyonu
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
    
    // Tuval boyutlarını ayarla
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Daha az parçacık oluştur - optimize edildi
    const createParticles = () => {
      // Daha az parçacık, daha hızlı performans
      const particleCount = Math.floor(window.innerWidth / 20); // Daha da azalttım
      const particles = [];
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.3, // Daha da küçük parçacıklar
          color: theme.palette.primary.main,
          speedX: Math.random() * 0.2 - 0.1, // Daha yavaş
          speedY: Math.random() * 0.2 - 0.1,
          opacity: Math.random() * 0.25 + 0.05 // Daha düşük opaklık
        });
      }
      
      return particles;
    };
    
    particlesRef.current = createParticles();
    
    // Fare hareketini yakala
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Optimize edilmiş animasyon döngüsü
    const animate = () => {
      // Tamamen temizleme işlemi - daha hızlı render
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle, index) => {
        // Parçacıkları hareket ettir
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Tuval kenarlarında geri dön
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Fare etkileşimi - daha az hesaplama
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 100; // Daha da az etki alanı
        
        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          particle.speedX += (dx / distance) * force * 0.01; // Çok daha az etki
          particle.speedY += (dy / distance) * force * 0.01;
        }
        
        // Performans için her 3 parçacıktan birini bağla
        if (index % 3 === 0) {
          for (let i = 0; i < particlesRef.current.length; i += 3) {
            if (index !== i) {
              const dx = particle.x - particlesRef.current[i].x;
              const dy = particle.y - particlesRef.current[i].y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 60) {
                const opacity = (60 - distance) / 60 * 0.07;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(particlesRef.current[i].x, particlesRef.current[i].y);
                ctx.strokeStyle = `rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, ${opacity})`;
                ctx.stroke();
              }
            }
          }
        }
        
        // Parçacığı çiz
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
        filter: 'blur(0.5px)' // Hafif bulanıklık
      }} 
    />
  );
};

// Optimize edilmiş arka plan
const AnimatedBackground = () => {
  const theme = useTheme();
  
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
      {/* Sadece 5 element */}
      {[...Array(5)].map((_, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: `${Math.random() * 250 + 150}px`,
            height: `${Math.random() * 250 + 150}px`,
            borderRadius: '50%',
            background: theme => `radial-gradient(circle, ${alpha(
              index % 2 === 0 ? theme.palette.primary.light : 
              theme.palette.secondary.light, 
              0.04 + Math.random() * 0.03
            )} 0%, rgba(255,255,255,0) 70%)`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            filter: 'blur(8px)',
            animation: `float${index % 3} ${12 + Math.random() * 10}s infinite linear`,
            '@keyframes float0': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(50px, -30px) scale(1.03)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            },
            '@keyframes float1': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(-50px, 30px) scale(0.97)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            },
            '@keyframes float2': {
              '0%': { transform: 'translate(0, 0) scale(1)' },
              '50%': { transform: 'translate(40px, 40px) scale(1.01)' },
              '100%': { transform: 'translate(0, 0) scale(1)' }
            }
          }}
        />
      ))}
    </Box>
  );
};

// Sabit boyutlu kurs kartı
const CourseCard = ({ course }) => {
  const theme = useTheme();
  
  const getCategoryColor = (category) => {
    const colors = {
      'Computer Science': theme.palette.primary.main,
      'Mathematics': theme.palette.secondary.main,
      'Physics': theme.palette.warning.main,
      'Artificial Intelligence': theme.palette.success.main, 
      'Data Science': theme.palette.info.main,
      'Web Development': '#9c27b0',
      'Blockchain': '#e91e63',
      'Beginner': theme.palette.info.main,
      'Intermediate': theme.palette.warning.main,
      'Advanced': theme.palette.error.main
    };
    
    return colors[category] || theme.palette.primary.main;
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        maxHeight: 500,
        width: 320, // Sabit genişlik
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
          transform: 'translateY(-8px)'
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
          <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: theme.palette.primary.main }}>
            {course.instructor ? course.instructor.charAt(0) : 'I'}
          </Avatar>
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
  );
};

// Sabit boyutlu özellik öğesi
const FeatureItem = ({ icon, title, description }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        p: 3,
        height: '100%',
        backgroundColor: 'background.paper',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
          transform: 'translateY(-5px)',
          backgroundColor: alpha(theme.palette.primary.main, 0.04)
        },
        transition: 'all 0.3s ease',
      }}
    >
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
        
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom 
          fontWeight="bold"
          sx={{
            backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, #9c27b0)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Paper>
  );
};

// Sabit boyutlu testimonial öğesi
const TestimonialCard = ({ name, role, text, image }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        width: 320, // Sabit genişlik
        height: 240, // Sabit yükseklik
        borderRadius: 4,
        backgroundColor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          transform: 'translateY(-5px)',
        }
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 4,
        height: '100%',
        background: `linear-gradient(to bottom, ${theme.palette.primary.main}, #9c27b0)`,
      }} />
      
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Avatar 
          src={image} 
          sx={{ 
            width: 48, 
            height: 48, 
            background: !image ? `linear-gradient(135deg, ${theme.palette.primary.main}, #9c27b0)` : undefined
          }}
        >
          {name.charAt(0)}
        </Avatar>
        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">{name}</Typography>
          <Typography variant="body2" color="text.secondary">{role}</Typography>
        </Box>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', height: 96, overflow: 'hidden' }}>
        "{text}"
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} fontSize="small" sx={{ color: theme.palette.warning.main }} />
        ))}
      </Box>
    </Paper>
  );
};

// Optimize edilmiş sonsuz kaydırma (durmadan kaydırır)
const InfiniteScroll = ({ children, speed = 40, reverse = false }) => {
  return (
    <Box 
      sx={{ 
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: 'fit-content',
          animation: `scroll${reverse ? 'Reverse' : ''} ${speed}s linear infinite`,
          '@keyframes scroll': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(calc(-50% - 16px))' }
          },
          '@keyframes scrollReverse': {
            '0%': { transform: 'translateX(calc(-50% - 16px))' },
            '100%': { transform: 'translateX(0)' }
          }
        }}
      >
        <Box sx={{ display: 'flex', gap: 4, padding: 2 }}>
          {children}
        </Box>
        <Box sx={{ display: 'flex', gap: 4, padding: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

// Ana Sayfa Komponenti
export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Örnek kurs verileri
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
    { 
      id: 4, 
      title: "Web Development Bootcamp", 
      category: "Web Development", 
      level: "Beginner",
      instructor: "Jessica Miller",
      rating: 4.9,
      lessons: 20,
      duration: "10 hours",
      description: "Master HTML, CSS, and JavaScript to build responsive and dynamic websites from scratch."
    },
    { 
      id: 5, 
      title: "Machine Learning Fundamentals", 
      category: "Artificial Intelligence", 
      level: "Intermediate",
      instructor: "Dr. Andrew Chen",
      rating: 4.6,
      lessons: 14,
      duration: "7 hours",
      description: "Learn the core concepts of machine learning algorithms and implement them with Python."
    },
    { 
      id: 6, 
      title: "Blockchain Technology", 
      category: "Blockchain", 
      level: "Intermediate",
      instructor: "Vitalik Brown",
      rating: 4.8,
      lessons: 12,
      duration: "6.5 hours",
      description: "Understand the principles of blockchain, cryptocurrencies, and smart contracts."
    },
    { 
      id: 7, 
      title: "Data Science with Python", 
      category: "Data Science", 
      level: "Intermediate",
      instructor: "Dr. Sarah Johnson",
      rating: 4.7,
      lessons: 16,
      duration: "9 hours",
      description: "Analyze real-world data, create visualizations, and build predictive models using Python."
    },
  ];
  
  // Örnek referanslar
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
    },
    {
      name: "Marcus Wilson",
      role: "Web Developer",
      text: "The platform is intuitive, and the content is up-to-date. I particularly enjoy the community discussions.",
      image: ""
    },
    {
      name: "Priya Sharma",
      role: "AI Researcher",
      text: "As someone working in AI, I find the advanced courses exceptionally well designed with practical applications.",
      image: ""
    },
    {
      name: "David Kim",
      role: "Blockchain Engineer",
      text: "The blockchain courses helped me transition into the Web3 space. The NFT rewards are a brilliant touch!",
      image: ""
    },
  ];
  
  // İstatistikler
  const stats = [
    { value: 500, label: "Courses", icon: <SchoolIcon /> },
    { value: 1200, label: "Quests", icon: <QuestIcon /> },
    { value: 25000, label: "Learners", icon: <CommunityIcon /> },
    { value: 10000, label: "NFTs", icon: <NftIcon /> }
  ];

  // Özellik öğeleri
  const features = [
    {
      icon: <SchoolIcon fontSize="large" />,
      title: "Interactive Learning",
      description: "Engage with interactive content and quizzes that make learning fun and effective."
    },
    {
      icon: <QuestIcon fontSize="large" />,
      title: "Quest-Based Progress",
      description: "Complete quests to demonstrate your knowledge and earn points and rewards."
    },
    {
      icon: <NftIcon fontSize="large" />,
      title: "NFT Certifications",
      description: "Earn unique NFTs as proof of your achievements and showcase your skills."
    },
    {
      icon: <DevicesIcon fontSize="large" />,
      title: "Learn Anywhere",
      description: "Access your courses and track your progress from any device, anytime, anywhere."
    }
  ];

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Parçacık Arka Planı */}
      <ParticleBackground />
      
      {/* Kahraman Bölümü */}
      <Box
        sx={{
          position: 'relative',
          backgroundColor: 'background.default',
          color: 'text.primary',
          pt: { xs: 10, md: 16 },
          pb: { xs: 12, md: 20 },
          overflow: 'hidden',
        }}
      >
        <AnimatedBackground />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                fontWeight="bold"
                sx={{ 
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #9c27b0 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Empower Your Learning Journey
              </Typography>
              
              <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary' }}>
                Discover interactive courses, complete engaging quests, and earn unique NFTs 
                <br/>with our gamified education platform.
              </Typography>
              
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
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
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, #9c27b0)`,
                    boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, #7b1fa2)`,
                      transform: 'translateY(-2px)',
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
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      transform: 'translateY(-2px)',
                      borderWidth: '2px'
                    }
                  }}
                >
                  View Quests
                </Button>
              </Stack>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['Interactive', 'Gamified', 'NFT Certificates', 'Learn Anywhere'].map((tag, i) => (
                  <Chip 
                    key={i} 
                    label={tag} 
                    variant="outlined"
                    sx={{
                      borderRadius: 6,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      color: 'text.primary',
                    }}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ position: 'relative' }}>
              {/* Orbit Tasarımı - Yazının Tam Sağında */}
              <Box sx={{ 
                position: 'absolute',
                width: 400,
                height: 400,
                top: '50%',
                right: -250, // Sağa taşımak için negatif değer
                transform: 'translateY(-50%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {/* Ana Daire */}
                <Box sx={{
                  position: 'absolute',
                  width: 240,
                  height: 240,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, ${alpha('#9c27b0', 0.3)} 100%)`,
                  animation: 'orbitPulse 4s infinite alternate ease-in-out',
                  '@keyframes orbitPulse': {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.03)' }
                  },
                  zIndex: 3
                }} />
                
                {/* Yörüngeler - Merkezleri Aynı Noktada */}
                {[0, 1, 2].map((_, index) => (
                  <Box key={index} sx={{
                    position: 'absolute',
                    width: 280 + index * 60,
                    height: 280 + index * 60,
                    borderRadius: '50%',
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.15)}`,
                    animation: `orbitSpin${index} ${20 + index * 10}s linear infinite`,
                    '@keyframes orbitSpin0': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    },
                    '@keyframes orbitSpin1': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(-360deg)' }
                    },
                    '@keyframes orbitSpin2': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    },
                    zIndex: 2
                  }}>
                    {/* Yörüngedeki İkonlar */}
                    <Avatar sx={{
                      position: 'absolute',
                      width: 44,
                      height: 44,
                      top: index === 0 ? '10%' : index === 1 ? '94%' : '90%',
                      left: index === 0 ? '50%' : index === 1 ? '10%' : '30%',
                      transform: 'translate(-50%, -50%)',
                      bgcolor: 'background.paper',
                      color: index === 0 ? theme.palette.primary.main : 
                             index === 1 ? theme.palette.secondary.main : 
                             '#9c27b0',
                      animation: `counterSpin${index} ${20 + index * 10}s linear infinite`,
                      '@keyframes counterSpin0': {
                        '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                        '100%': { transform: 'translate(-50%, -50%) rotate(-360deg)' }
                      },
                      '@keyframes counterSpin1': {
                        '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                        '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
                      },
                      '@keyframes counterSpin2': {
                        '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                        '100%': { transform: 'translate(-50%, -50%) rotate(-360deg)' }
                      },
                      zIndex: 4,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}>
                      {index === 0 ? <SchoolIcon /> : 
                       index === 1 ? <QuestIcon /> : 
                       <NftIcon />}
                    </Avatar>
                  </Box>
                ))}
                
                {/* Merkez İkon */}
                <Avatar sx={{
                  position: 'absolute',
                  width: 64,
                  height: 64,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, #9c27b0)`,
                  color: 'white',
                  boxShadow: '0 0 20px rgba(0,0,0,0.15)',
                  zIndex: 5
                }}>
                  <FlareIcon fontSize="large" />
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </Container>
        
        {/* Kavisli Şekil Ayırıcı */}
        <Box sx={{
          position: 'absolute',
          bottom: -2,
          left: 0,
          width: '100%',
          overflow: 'hidden',
          lineHeight: 0,
          zIndex: 2,
        }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{
              position: 'relative',
              display: 'block',
              width: 'calc(100% + 1.3px)',
              height: 80,
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
      
      {/* İstatistikler Bölümü */}
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
                <Box sx={{ textAlign: 'center', py: 2 }}>
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
                    {stat.value > 999 ? `${stat.value/1000}k+` : stat.value}
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
      
      {/* Öne çıkan Kurslar Bölümü - Sürekli Kaydırma */}
      <Box sx={{ 
        bgcolor: 'background.paper',
        py: 10,
        position: 'relative'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            mb: 6, 
            textAlign: 'center',
          }}>
            <Typography 
              variant="h6" 
              component="p" 
              sx={{ 
                mb: 1, 
                fontWeight: 'bold',
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, #9c27b0)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              FEATURED COURSES
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom 
              fontWeight="bold"
              sx={{
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, #9c27b0)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Start Your Learning Journey
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Discover our most popular courses designed to help you master new skills and advance your career.
            </Typography>
          </Box>
          
          {/* Sürekli akan kurs kartları */}
          <InfiniteScroll speed={80}>
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </InfiniteScroll>
          
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
                border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  border: `2px solid ${theme.palette.primary.main}`,
                  transform: 'translateY(-2px)',
                }
              }}
            >
              View All Courses
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Özellikler Bölümü - 2x2 Grid */}
      <Box sx={{
        position: 'relative',
        bgcolor: 'background.default', // Açık tema için uyumlu
        py: 10,
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography 
              variant="h6" 
              component="p" 
              sx={{ 
                mb: 1, 
                fontWeight: 'bold',
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, #9c27b0)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              WHY CHOOSE WISENTIA
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom 
              fontWeight="bold"
              sx={{
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, #9c27b0)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Learning Reimagined
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Discover how our innovative platform transforms traditional education into an engaging and rewarding experience.
            </Typography>
          </Box>
          
          {/* 2x2 Grid için düzenleme */}
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} key={index} sx={{ 
                display: 'flex', 
                height: { xs: 'auto', sm: 280 }
              }}>
                <FeatureItem 
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Referanslar Bölümü - Sürekli akan karşı yönde karouseller */}
      <Box sx={{ 
        bgcolor: 'background.paper', // Açık tema için uyumlu
        py: 10
      }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography 
              variant="h6" 
              component="p" 
              sx={{ 
                mb: 1, 
                fontWeight: 'bold',
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, #9c27b0)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              TESTIMONIALS
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              gutterBottom 
              fontWeight="bold"
              sx={{
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, #9c27b0)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              What Our Learners Say
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Join thousands of satisfied learners who have transformed their skills and careers with Wisentia.
            </Typography>
          </Box>
          
          {/* Sürekli akan ters yönde referans kartları */}
          <InfiniteScroll speed={60} reverse={true}>
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index}
                name={testimonial.name}
                role={testimonial.role}
                text={testimonial.text}
                image={testimonial.image}
              />
            ))}
          </InfiniteScroll>
        </Container>
      </Box>
      
      {/* CTA Bölümü */}
      <Box sx={{ 
        position: 'relative',
        bgcolor: 'background.default',
        py: 10,
        overflow: 'hidden'
      }}>
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
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h6" 
                  component="p" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 'bold',
                    backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, #9c27b0)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  GET STARTED TODAY
                </Typography>
                <Typography 
                  variant="h3" 
                  component="h2" 
                  gutterBottom 
                  fontWeight="bold"
                  sx={{
                    backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, #9c27b0)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
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
                    href="/register"
                    color="primary"
                    sx={{ 
                      borderRadius: 2,
                      py: 1.5,
                      px: 4,
                      fontWeight: 'bold',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, #9c27b0)`,
                      boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, #7b1fa2)`,
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    Create Account
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="large" 
                    component={Link} 
                    href="/login"
                    sx={{ 
                      borderRadius: 2,
                      py: 1.5,
                      px: 4,
                      fontWeight: 'bold',
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        transform: 'translateY(-2px)',
                        borderWidth: '2px'
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