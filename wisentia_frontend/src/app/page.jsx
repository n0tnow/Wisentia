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

// Header ile uyumlu Quantum Education Theme Colors
const QUANTUM_COLORS = {
  primary: '#6366F1',     // Indigo - Bilgi ve teknoloji
  secondary: '#8B5CF6',   // Purple - Yaratıcılık ve öğrenme
  accent: '#06B6D4',      // Cyan - Taze ve modern
  success: '#10B981',     // Emerald - Başarı ve ilerleme
  warning: '#F59E0B',     // Amber - Dikkat ve önem
  error: '#EF4444',       // Red - Uyarı
  neon: '#00D4FF',        // Neon Blue - Enerji
  plasma: '#FF006E',      // Magenta - Dinamizm
  education: '#7C3AED',   // Deep Purple - Eğitim
  gradients: {
    primary: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
    education: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 25%, #8B5CF6 50%, #06B6D4 75%, #10B981 100%)',
    hero: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 25%, #6366F1 50%, #8B5CF6 75%, #06B6D4 100%)',
    neon: 'linear-gradient(135deg, #00D4FF 0%, #7C3AED 50%, #FF006E 100%)',
    learning: 'linear-gradient(45deg, #10B981 0%, #06B6D4 25%, #6366F1 50%, #8B5CF6 75%, #7C3AED 100%)'
  },
  shadows: {
    neon: '0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(139, 92, 246, 0.3), 0 0 60px rgba(6, 182, 212, 0.2)',
    education: '0 0 30px rgba(124, 58, 237, 0.5), 0 0 60px rgba(99, 102, 241, 0.3)',
    glow: '0 0 15px rgba(6, 182, 212, 0.4), 0 0 30px rgba(139, 92, 246, 0.3)'
  }
};

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
    
    // Quantum renkleri
    const quantumColors = [
      QUANTUM_COLORS.primary,
      QUANTUM_COLORS.secondary,
      QUANTUM_COLORS.accent,
      QUANTUM_COLORS.neon,
      QUANTUM_COLORS.education
    ];
    
    // Daha az parçacık oluştur - optimize edildi
    const createParticles = () => {
      // Daha az parçacık, daha hızlı performans
      const particleCount = Math.floor(window.innerWidth / 25); // Daha da azalttım
      const particles = [];
      
      for (let i = 0; i < particleCount; i++) {
        const color = quantumColors[Math.floor(Math.random() * quantumColors.length)];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5, // Daha da küçük parçacıklar
          color: color,
          speedX: Math.random() * 0.3 - 0.15, // Daha yavaş
          speedY: Math.random() * 0.3 - 0.15,
          opacity: Math.random() * 0.3 + 0.1 // Daha düşük opaklık
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
    
    // Hex to RGB converter
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
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
        const maxDistance = 120; // Daha az etki alanı
        
        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          particle.speedX += (dx / distance) * force * 0.008; // Çok daha az etki
          particle.speedY += (dy / distance) * force * 0.008;
        }
        
        // Performans için her 4 parçacıktan birini bağla
        if (index % 4 === 0) {
          for (let i = 0; i < particlesRef.current.length; i += 4) {
            if (index !== i) {
              const dx = particle.x - particlesRef.current[i].x;
              const dy = particle.y - particlesRef.current[i].y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 80) {
                const opacity = (80 - distance) / 80 * 0.1;
                const rgb = hexToRgb(particle.color);
                if (rgb) {
                  ctx.beginPath();
                  ctx.moveTo(particle.x, particle.y);
                  ctx.lineTo(particlesRef.current[i].x, particlesRef.current[i].y);
                  ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
                  ctx.lineWidth = 0.5;
                  ctx.stroke();
                }
              }
            }
          }
        }
        
        // Parçacığı çiz
        const rgb = hexToRgb(particle.color);
        if (rgb) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity})`;
          ctx.fill();
          
          // Quantum glow effect
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 3;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
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
        filter: 'blur(0.3px)' // Hafif bulanıklık
      }} 
    />
  );
};

// Optimize edilmiş arka plan
// Optimize edilmiş arka plan
const AnimatedBackground = () => {
  const theme = useTheme();
  const [elements, setElements] = useState([]);
  
  useEffect(() => {
    // Client tarafında rastgele elementleri oluştur
    const newElements = Array(5).fill(0).map((_, index) => ({
      key: index,
      width: Math.random() * 250 + 150,
      height: Math.random() * 250 + 150,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: 0.04 + Math.random() * 0.03,
      animationIndex: index % 3
    }));
    
    setElements(newElements);
  }, []);
  
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
      {elements.map((element) => (
        <Box
          key={element.key}
          sx={{
            position: 'absolute',
            width: `${element.width}px`,
            height: `${element.height}px`,
            borderRadius: '50%',
            background: theme => `radial-gradient(circle, ${alpha(
              element.key % 2 === 0 ? theme.palette.primary.light : 
              theme.palette.secondary.light, 
              element.opacity
            )} 0%, rgba(255,255,255,0) 70%)`,
            top: `${element.top}%`,
            left: `${element.left}%`,
            filter: 'blur(8px)',
            animation: `float${element.animationIndex} ${12 + Math.random() * 10}s infinite linear`,
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

// Sabit yükseklikli kurs kartı - Banner görselli ve düzgün düzenli
const CourseCard = ({ course }) => {
  const theme = useTheme();
  
  const getCategoryColor = (category) => {
    const colors = {
      'Computer Science': QUANTUM_COLORS.primary,
      'Mathematics': QUANTUM_COLORS.secondary,
      'Physics': QUANTUM_COLORS.warning,
      'Artificial Intelligence': QUANTUM_COLORS.success, 
      'Data Science': QUANTUM_COLORS.accent,
      'Web Development': QUANTUM_COLORS.education,
      'Blockchain': QUANTUM_COLORS.plasma,
      'Beginner': QUANTUM_COLORS.accent,
      'Intermediate': QUANTUM_COLORS.warning,
      'Advanced': QUANTUM_COLORS.error
    };
    
    return colors[category] || QUANTUM_COLORS.primary;
  };
  
  return (
    <Card 
      sx={{ 
        height: 520, // Sabit yükseklik - tüm kartlar aynı boyutta
        width: 320, // Sabit genişlik
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: theme => theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${alpha(QUANTUM_COLORS.accent, 0.15)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme => theme.palette.mode === 'dark'
            ? '0 8px 30px rgba(0, 0, 0, 0.4)'
            : '0 8px 30px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-4px)',
          borderColor: alpha(QUANTUM_COLORS.accent, 0.3),
        }
      }}
    >
      <Box sx={{ position: 'relative', height: 180 }}> {/* Sabit görsel yüksekliği */}
        <CardMedia
          component="img"
          sx={{
            height: '100%',
            width: '100%',
            objectFit: 'cover',
            position: 'relative',
          }}
          image={course.thumbnailURL || course.ThumbnailURL || `https://via.placeholder.com/320x180/6366F1/FFFFFF?text=${encodeURIComponent(course.title || course.Title || 'Course')}`}
          alt={course.title || course.Title}
          onError={(e) => {
            // Görsel yüklenemezse gradient background göster
            e.target.style.display = 'none';
            e.target.parentElement.style.background = `linear-gradient(135deg, ${alpha(getCategoryColor(course.category || course.Category), 0.7)} 0%, ${alpha(getCategoryColor(course.level || course.difficulty || course.Difficulty), 0.8)} 100%)`;
          }}
        />
        
        {/* Gradient overlay */}
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '40%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none'
        }} />
        
        {/* Kategori Chip - Uzun kategoriler için alt satıra kayma */}
        <Chip 
          label={course.category || course.Category} 
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            maxWidth: 140, // Maksimum genişlik
            bgcolor: alpha(getCategoryColor(course.category || course.Category), 0.85),
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            '& .MuiChip-label': {
              whiteSpace: 'normal', // Alt satıra kaymasına izin ver
              lineHeight: 1.2,
              padding: '4px 8px',
              wordBreak: 'break-word', // Uzun kelimeleri böl
            }
          }}
        />
        
        <Chip 
          label={course.level || course.difficulty || course.Difficulty} 
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: alpha(getCategoryColor(course.level || course.difficulty || course.Difficulty), 0.85),
            color: 'white',
            fontSize: '0.7rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        />
        
        <IconButton 
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'white',
            width: 40,
            height: 40,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            '&:hover': {
              bgcolor: 'white',
              transform: 'scale(1.1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }
          }}
        >
          <PlayIcon sx={{ color: getCategoryColor(course.category || course.Category) }} />
        </IconButton>
      </Box>
      
      {/* Content alanı - Flex ile organize edildi */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flexGrow: 1,
        height: 'calc(100% - 180px)' // Kalan alan
      }}>
        <CardContent sx={{ 
          flexGrow: 1, 
          p: 3, 
          pb: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Başlık - Sabit yükseklik */}
          <Typography 
            gutterBottom 
            variant="h5" 
            component="h3" 
            fontWeight="bold" 
            sx={{
              background: `linear-gradient(135deg, ${getCategoryColor(course.category || course.Category)}, ${getCategoryColor(course.level || course.difficulty || course.Difficulty)})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              minHeight: 64, // Minimum 2 satır yüksekliği
              maxHeight: 64, // Maksimum 2 satır yüksekliği
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
              mb: 2
            }}
          >
            {course.title || course.Title}
          </Typography>
          
          {/* Kurs bilgileri */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SchoolIcon fontSize="small" sx={{ color: QUANTUM_COLORS.accent, mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {course.duration || course.totalVideos || 'Multiple lessons'} • {course.lessons || course.TotalVideos || '8 lessons'}
            </Typography>
          </Box>
          
          {/* Açıklama - Flex ile büyüyen alan */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              flexGrow: 1, // Kalan alanı kapla
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3, // Maksimum 3 satır
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.5,
              mb: 2
            }}
          >
            {course.description || course.Description || 'Learn the fundamentals and advance your skills with hands-on projects and quizzes.'}
          </Typography>
          
          {/* Instructor bilgisi - Alt kısımda sabit */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0, mt: 'auto' }}>
            <Avatar sx={{ 
              width: 24, 
              height: 24, 
              mr: 1, 
              background: `linear-gradient(135deg, ${QUANTUM_COLORS.primary}, ${QUANTUM_COLORS.secondary})`,
              border: `1px solid ${alpha(QUANTUM_COLORS.primary, 0.2)}`
            }}>
              {course.instructor ? course.instructor.charAt(0) : (course.CreatedBy ? 'I' : 'T')}
            </Avatar>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {course.instructor || course.CreatedBy || 'Instructor'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ color: QUANTUM_COLORS.warning, fontSize: 16 }} />
              <Typography variant="body2" fontWeight="bold" sx={{ ml: 0.5 }}>
                {course.rating || '4.8'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
        
        <Divider sx={{ bgcolor: alpha(QUANTUM_COLORS.accent, 0.1) }} />
        
        {/* Actions - Her zaman en altta */}
        <CardActions sx={{ p: 2, pt: 1, pb: 2, mt: 'auto' }}>
          <Button 
            component={Link} 
            href={`/courses/${course.id || course.courseID || course.CourseID}`}
            endIcon={<ArrowRightIcon />}
            sx={{ 
              borderRadius: 2,
              fontWeight: 'bold',
              ml: 'auto',
              color: getCategoryColor(course.category || course.Category),
              '&:hover': {
                bgcolor: alpha(getCategoryColor(course.category || course.Category), 0.08),
                transform: 'translateX(3px)'
              }
            }}
          >
            View Course
          </Button>
        </CardActions>
      </Box>
    </Card>
  );
};

// Temiz tasarımlı özellik öğesi - Glowing azaltıldı
const FeatureItem = ({ icon, title, description }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        p: 3,
        height: '100%',
        backgroundColor: 'background.paper',
        boxShadow: theme => theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${alpha(QUANTUM_COLORS.accent, 0.12)}`,
        '&:hover': {
          boxShadow: theme => theme.palette.mode === 'dark'
            ? '0 8px 30px rgba(0, 0, 0, 0.4)'
            : '0 8px 30px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)',
          backgroundColor: alpha(QUANTUM_COLORS.primary, 0.02),
          borderColor: alpha(QUANTUM_COLORS.accent, 0.2),
        },
        transition: 'all 0.3s ease',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Avatar sx={{ 
          bgcolor: alpha(QUANTUM_COLORS.primary, 0.08), 
          color: QUANTUM_COLORS.primary,
          width: 56,
          height: 56,
          mb: 2,
          border: `1px solid ${alpha(QUANTUM_COLORS.primary, 0.15)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: alpha(QUANTUM_COLORS.neon, 0.1),
            color: QUANTUM_COLORS.neon,
            transform: 'scale(1.05)',
          }
        }}>
          {icon}
        </Avatar>
        
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom 
          fontWeight="bold"
          sx={{
            background: `linear-gradient(135deg, ${QUANTUM_COLORS.primary}, ${QUANTUM_COLORS.education})`,
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

// Temiz tasarımlı testimonial öğesi - Glowing azaltıldı
const TestimonialCard = ({ name, role, text, image }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        width: 320, // Sabit genişlik
        height: 240, // Sabit yükseklik
        borderRadius: 3,
        backgroundColor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: theme => theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${alpha(QUANTUM_COLORS.accent, 0.12)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme => theme.palette.mode === 'dark'
            ? '0 8px 30px rgba(0, 0, 0, 0.4)'
            : '0 8px 30px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)',
          borderColor: alpha(QUANTUM_COLORS.accent, 0.2),
        }
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 3,
        height: '100%',
        background: `linear-gradient(135deg, ${QUANTUM_COLORS.primary}, ${QUANTUM_COLORS.education})`,
      }} />
      
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Avatar 
          src={image} 
          sx={{ 
            width: 48, 
            height: 48, 
            background: !image ? `linear-gradient(135deg, ${QUANTUM_COLORS.primary}, ${QUANTUM_COLORS.secondary})` : undefined,
            border: `1px solid ${alpha(QUANTUM_COLORS.primary, 0.2)}`,
          }}
        >
          {name.charAt(0)}
        </Avatar>
        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{
            background: `linear-gradient(135deg, ${QUANTUM_COLORS.primary}, ${QUANTUM_COLORS.education})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {name}
          </Typography>
          <Typography variant="body2" sx={{ color: QUANTUM_COLORS.accent }}>{role}</Typography>
        </Box>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', height: 96, overflow: 'hidden' }}>
        "{text}"
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} fontSize="small" sx={{ color: QUANTUM_COLORS.warning }} />
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
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Gerçek kurs verileri - API'den çekilen
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kursları API'den çek
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const courses = await response.json();
          // Rastgele 8 kurs seç
          const shuffled = courses.sort(() => 0.5 - Math.random());
          setFeaturedCourses(shuffled.slice(0, 8));
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);
  
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
                  background: QUANTUM_COLORS.gradients.education,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                Empower Your Learning Journey
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  color: 'text.secondary',
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
                }}
              >
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
                    background: QUANTUM_COLORS.gradients.primary,
                    boxShadow: QUANTUM_COLORS.shadows.neon,
                    '&:hover': {
                      background: QUANTUM_COLORS.gradients.neon,
                      transform: 'translateY(-2px)',
                      boxShadow: QUANTUM_COLORS.shadows.education,
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
                    borderColor: QUANTUM_COLORS.primary,
                    borderWidth: '2px',
                    color: QUANTUM_COLORS.primary,
                    '&:hover': {
                      borderColor: QUANTUM_COLORS.neon,
                      color: QUANTUM_COLORS.neon,
                      transform: 'translateY(-2px)',
                      borderWidth: '2px',
                      boxShadow: QUANTUM_COLORS.shadows.glow,
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
                      borderColor: alpha(QUANTUM_COLORS.accent, 0.4),
                      color: QUANTUM_COLORS.education,
                      fontWeight: 'bold',
                      '&:hover': {
                        borderColor: QUANTUM_COLORS.accent,
                        color: QUANTUM_COLORS.accent,
                      }
                    }}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ position: 'relative' }}>
              {/* Yeniden Tasarlanmış Orbit Sistemi - Tema Uyumlu */}
              <Box sx={{ 
                position: 'relative',
                width: '100%',
                height: { xs: 300, sm: 350, md: 400, lg: 450 },
                display: { xs: 'none', sm: 'flex' },
                justifyContent: 'center',
                alignItems: 'center',
                mt: { sm: 4, md: 0 },
                overflow: 'visible'
              }}>
                
                {/* Yeniden Tasarlanmış Merkez - Tema Uyumlu */}
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: { sm: 120, md: 140, lg: 160 },
                  height: { sm: 120, md: 140, lg: 160 },
                  borderRadius: '50%',
                  background: theme => theme.palette.mode === 'dark' 
                    ? `
                        radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 60%),
                        radial-gradient(circle at 70% 70%, ${alpha(QUANTUM_COLORS.neon, 0.2)} 0%, transparent 50%),
                        linear-gradient(135deg, ${alpha(QUANTUM_COLORS.education, 0.3)} 0%, ${alpha(QUANTUM_COLORS.primary, 0.25)} 50%, ${alpha(QUANTUM_COLORS.accent, 0.3)} 100%)
                      `
                    : `
                        radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 60%),
                        radial-gradient(circle at 70% 70%, ${alpha(QUANTUM_COLORS.accent, 0.3)} 0%, transparent 50%),
                        linear-gradient(135deg, ${alpha(QUANTUM_COLORS.primary, 0.2)} 0%, ${alpha(QUANTUM_COLORS.education, 0.15)} 50%, ${alpha(QUANTUM_COLORS.accent, 0.2)} 100%)
                      `,
                  backdropFilter: 'blur(20px)',
                  border: theme => theme.palette.mode === 'dark' 
                    ? `1px solid ${alpha('#ffffff', 0.1)}`
                    : `1px solid ${alpha(QUANTUM_COLORS.primary, 0.2)}`,
                  boxShadow: theme => theme.palette.mode === 'dark'
                    ? `
                        0 0 40px ${alpha(QUANTUM_COLORS.education, 0.15)},
                        inset 0 0 30px ${alpha('#ffffff', 0.03)}
                      `
                    : `
                        0 0 40px ${alpha(QUANTUM_COLORS.primary, 0.2)},
                        inset 0 0 30px ${alpha('#ffffff', 0.1)}
                      `,
                  zIndex: 8,
                  animation: 'centerPulse 6s ease-in-out infinite',
                  '@keyframes centerPulse': {
                    '0%': { 
                      transform: 'translate(-50%, -50%) scale(1)',
                    },
                    '50%': { 
                      transform: 'translate(-50%, -50%) scale(1.25)', // En küçük yörüngeye kadar smooth büyüme
                    },
                    '100%': { 
                      transform: 'translate(-50%, -50%) scale(1)',
                    }
                  }
                }} />

                {/* 3 Temiz Yörünge */}
                {[
                  {
                    // İç Yörünge
                    radius: { sm: 70, md: 90, lg: 110 },
                    icon: <SchoolIcon />,
                    color: QUANTUM_COLORS.primary,
                    speed: 25,
                    randomRotation: Math.random() * 360
                  },
                  {
                    // Orta Yörünge
                    radius: { sm: 110, md: 140, lg: 170 },
                    icon: <QuestIcon />,
                    color: QUANTUM_COLORS.accent,
                    speed: 35,
                    randomRotation: Math.random() * 360
                  },
                  {
                    // Dış Yörünge
                    radius: { sm: 150, md: 190, lg: 230 },
                    icon: <NftIcon />,
                    color: QUANTUM_COLORS.secondary,
                    speed: 45,
                    randomRotation: Math.random() * 360
                  }
                ].map((orbit, index) => (
                  <Box key={index}>
                    {/* Yörünge Halkası */}
                    <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: { 
                        sm: orbit.radius.sm * 2, 
                        md: orbit.radius.md * 2, 
                        lg: orbit.radius.lg * 2 
                      },
                      height: { 
                        sm: orbit.radius.sm * 2, 
                        md: orbit.radius.md * 2, 
                        lg: orbit.radius.lg * 2 
                      },
                      borderRadius: '50%',
                      border: `1px dashed ${alpha(orbit.color, 0.25)}`,
                      zIndex: 6
                    }} />
                    
                    {/* Dönen İkon Konteyner */}
                    <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: { 
                        sm: orbit.radius.sm * 2, 
                        md: orbit.radius.md * 2, 
                        lg: orbit.radius.lg * 2 
                      },
                      height: { 
                        sm: orbit.radius.sm * 2, 
                        md: orbit.radius.md * 2, 
                        lg: orbit.radius.lg * 2 
                      },
                      animation: `orbitRotation${index} ${orbit.speed}s linear infinite`,
                      transformOrigin: 'center center',
                      '@keyframes orbitRotation0': {
                        '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                        '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
                      },
                      '@keyframes orbitRotation1': {
                        '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                        '100%': { transform: 'translate(-50%, -50%) rotate(-360deg)' }
                      },
                      '@keyframes orbitRotation2': {
                        '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                        '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
                      },
                      zIndex: 12 // İconları üst katmana taşı
                    }}>
                      {/* İkon - Counter rotation ile her zaman düz duracak */}
                      <Avatar sx={{
                        position: 'absolute',
                        width: { sm: 45, md: 55, lg: 65 },
                        height: { sm: 45, md: 55, lg: 65 },
                        top: 0,
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: orbit.color,
                        color: 'white',
                        border: `3px solid ${alpha(orbit.color, 0.8)}`,
                        boxShadow: `0 0 20px ${alpha(orbit.color, 0.3)}`,
                        transition: 'all 0.3s ease',
                        // Counter rotation - icon her zaman düz duracak
                        animation: `iconCounterRotation${index} ${orbit.speed}s linear infinite`,
                        '@keyframes iconCounterRotation0': {
                          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                          '100%': { transform: 'translate(-50%, -50%) rotate(-360deg)' }
                        },
                        '@keyframes iconCounterRotation1': {
                          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
                        },
                        '@keyframes iconCounterRotation2': {
                          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                          '100%': { transform: 'translate(-50%, -50%) rotate(-360deg)' }
                        },
                        '&:hover': {
                          boxShadow: `0 0 40px ${alpha(orbit.color, 0.6)}`,
                          transform: `translate(-50%, -50%) scale(1.1)`,
                          bgcolor: alpha(orbit.color, 0.9),
                        }
                      }}>
                        {orbit.icon}
                      </Avatar>
                    </Box>
                  </Box>
                ))}

                {/* Yeniden Tasarlanmış Merkez İkon - Tema Uyumlu */}
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: { sm: 70, md: 80, lg: 90 },
                  height: { sm: 70, md: 80, lg: 90 },
                  borderRadius: '50%',
                  background: theme => theme.palette.mode === 'dark'
                    ? `
                        radial-gradient(circle at center,
                          ${QUANTUM_COLORS.neon} 0%,
                          ${QUANTUM_COLORS.education} 25%,
                          ${alpha(QUANTUM_COLORS.primary, 0.9)} 50%,
                          ${alpha(QUANTUM_COLORS.accent, 0.7)} 75%,
                          ${alpha(QUANTUM_COLORS.education, 0.5)} 100%
                        )
                      `
                    : `
                        radial-gradient(circle at center,
                          ${QUANTUM_COLORS.primary} 0%,
                          ${QUANTUM_COLORS.education} 30%,
                          ${alpha(QUANTUM_COLORS.accent, 0.9)} 60%,
                          ${alpha(QUANTUM_COLORS.secondary, 0.8)} 85%,
                          ${alpha(QUANTUM_COLORS.primary, 0.6)} 100%
                        )
                      `,
                  boxShadow: theme => theme.palette.mode === 'dark'
                    ? `
                        0 0 30px ${alpha(QUANTUM_COLORS.neon, 0.4)},
                        0 0 60px ${alpha(QUANTUM_COLORS.education, 0.2)},
                        inset 0 0 20px ${alpha('#ffffff', 0.1)}
                      `
                    : `
                        0 0 30px ${alpha(QUANTUM_COLORS.primary, 0.3)},
                        0 0 60px ${alpha(QUANTUM_COLORS.accent, 0.2)},
                        inset 0 0 20px ${alpha('#ffffff', 0.15)}
                      `,
                  border: theme => theme.palette.mode === 'dark'
                    ? `2px solid ${alpha(QUANTUM_COLORS.neon, 0.3)}`
                    : `2px solid ${alpha(QUANTUM_COLORS.primary, 0.4)}`,
                  zIndex: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    boxShadow: theme => theme.palette.mode === 'dark'
                      ? `
                          0 0 50px ${alpha(QUANTUM_COLORS.neon, 0.6)},
                          0 0 80px ${alpha(QUANTUM_COLORS.education, 0.3)},
                          inset 0 0 30px ${alpha('#ffffff', 0.15)}
                        `
                      : `
                          0 0 50px ${alpha(QUANTUM_COLORS.primary, 0.5)},
                          0 0 80px ${alpha(QUANTUM_COLORS.accent, 0.3)},
                          inset 0 0 30px ${alpha('#ffffff', 0.2)}
                        `,
                    transform: 'translate(-50%, -50%) scale(1.05)',
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <FlareIcon sx={{ 
                    fontSize: { sm: '2rem', md: '2.4rem', lg: '2.8rem' },
                    color: 'white',
                    filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                  }} />
                </Box>
              </Box>
              
              {/* Mobile için basit alternatif */}
              <Box sx={{ 
                display: { xs: 'flex', sm: 'none' },
                justifyContent: 'center',
                alignItems: 'center',
                py: 4
              }}>
                <Box sx={{
                  display: 'flex',
                  gap: 3,
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  {[
                    { icon: <SchoolIcon />, color: QUANTUM_COLORS.primary, label: 'Learn' },
                    { icon: <QuestIcon />, color: QUANTUM_COLORS.accent, label: 'Quest' },
                    { icon: <NftIcon />, color: QUANTUM_COLORS.secondary, label: 'Earn' }
                  ].map((item, index) => (
                    <Box key={index} sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Avatar sx={{
                        width: 60,
                        height: 60,
                        bgcolor: alpha(item.color, 0.1),
                        color: item.color,
                        border: `2px solid ${alpha(item.color, 0.3)}`,
                        boxShadow: `0 0 10px ${alpha(item.color, 0.2)}`,
                        animation: `mobileFloat${index} 3s infinite ease-in-out`,
                        '@keyframes mobileFloat0': {
                          '0%, 100%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-8px)' }
                        },
                        '@keyframes mobileFloat1': {
                          '0%, 100%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-12px)' }
                        },
                        '@keyframes mobileFloat2': {
                          '0%, 100%': { transform: 'translateY(0px)' },
                          '50%': { transform: 'translateY(-6px)' }
                        },
                        '&:hover': {
                          boxShadow: `0 0 20px ${alpha(item.color, 0.5)}`,
                        }
                      }}>
                        {item.icon}
                      </Avatar>
                      <Typography variant="caption" sx={{
                        color: item.color,
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
        
        {/* Kavisli Şekil Ayırıcı - Quantum renklerle */}
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
                    bgcolor: alpha(QUANTUM_COLORS.primary, 0.08),
                    color: QUANTUM_COLORS.primary,
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                    border: `1px solid ${alpha(QUANTUM_COLORS.primary, 0.15)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      bgcolor: alpha(QUANTUM_COLORS.accent, 0.1),
                      color: QUANTUM_COLORS.accent,
                    }
                  }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" component="p" fontWeight="bold" gutterBottom sx={{
                    background: `linear-gradient(135deg, ${QUANTUM_COLORS.primary}, ${QUANTUM_COLORS.education})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
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
                background: QUANTUM_COLORS.gradients.primary,
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
                background: QUANTUM_COLORS.gradients.education,
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
          
          {/* Gerçek Kurslardan Sürekli Kaydırma - Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <Box sx={{ display: 'flex', gap: 4 }}>
                {[...Array(4)].map((_, index) => (
                  <Card key={index} sx={{ 
                    width: 320, 
                    height: 500, 
                    borderRadius: 3,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 }
                    }
                  }}>
                    <Box sx={{ 
                      height: 180, 
                      bgcolor: 'action.hover',
                      borderRadius: '12px 12px 0 0'
                    }} />
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ 
                        height: 20, 
                        bgcolor: 'action.hover', 
                        borderRadius: 1, 
                        mb: 2 
                      }} />
                      <Box sx={{ 
                        height: 16, 
                        bgcolor: 'action.hover', 
                        borderRadius: 1, 
                        mb: 1,
                        width: '60%' 
                      }} />
                      <Box sx={{ 
                        height: 60, 
                        bgcolor: 'action.hover', 
                        borderRadius: 1 
                      }} />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          ) : featuredCourses.length > 0 ? (
            <InfiniteScroll speed={80}>
              {featuredCourses.map((course) => (
                <CourseCard key={course.id || course.CourseID} course={course} />
              ))}
            </InfiniteScroll>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No courses available at the moment.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please check back later or contact support.
              </Typography>
            </Box>
          )}
          
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
                border: `1px solid ${alpha(QUANTUM_COLORS.primary, 0.3)}`,
                color: QUANTUM_COLORS.primary,
                '&:hover': {
                  border: `1px solid ${QUANTUM_COLORS.accent}`,
                  color: QUANTUM_COLORS.accent,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 15px ${alpha(QUANTUM_COLORS.accent, 0.15)}`,
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
        bgcolor: 'background.default',
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
                background: QUANTUM_COLORS.gradients.neon,
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
                background: QUANTUM_COLORS.gradients.education,
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
        bgcolor: 'background.paper',
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
                background: QUANTUM_COLORS.gradients.learning,
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
                background: QUANTUM_COLORS.gradients.education,
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
      
      {/* CTA Bölümü - Glowing Azaltıldı */}
      <Box sx={{ 
        position: 'relative',
        bgcolor: 'background.default',
        py: 10,
        overflow: 'hidden'
      }}>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Paper elevation={0} sx={{
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: 'background.paper',
            boxShadow: theme => theme.palette.mode === 'dark' 
              ? '0 8px 40px rgba(0, 0, 0, 0.3)'
              : '0 8px 40px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            border: `1px solid ${alpha(QUANTUM_COLORS.accent, 0.15)}`,
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
                    background: `linear-gradient(135deg, ${QUANTUM_COLORS.neon}, ${QUANTUM_COLORS.plasma})`,
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
                    background: `linear-gradient(135deg, ${QUANTUM_COLORS.primary}, ${QUANTUM_COLORS.education})`,
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
                      background: `linear-gradient(135deg, ${QUANTUM_COLORS.primary}, ${QUANTUM_COLORS.secondary})`,
                      boxShadow: theme => theme.palette.mode === 'dark'
                        ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                        : '0 4px 20px rgba(99, 102, 241, 0.2)',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${QUANTUM_COLORS.neon}, ${QUANTUM_COLORS.accent})`,
                        transform: 'translateY(-1px)',
                        boxShadow: theme => theme.palette.mode === 'dark'
                          ? '0 6px 25px rgba(0, 0, 0, 0.4)'
                          : '0 6px 25px rgba(99, 102, 241, 0.25)',
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
                      borderColor: alpha(QUANTUM_COLORS.primary, 0.4),
                      borderWidth: '1px',
                      color: QUANTUM_COLORS.primary,
                      '&:hover': {
                        borderColor: QUANTUM_COLORS.accent,
                        color: QUANTUM_COLORS.accent,
                        transform: 'translateY(-1px)',
                        borderWidth: '1px',
                        boxShadow: `0 4px 15px ${alpha(QUANTUM_COLORS.accent, 0.2)}`,
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