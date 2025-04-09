'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Pagination,
  Button,
  Divider,
  Alert,
  useTheme,
  alpha,
  IconButton,
  InputAdornment,
  Paper,
  Avatar,
  useMediaQuery,
  Modal,
  Rating,
  Fade,
  Backdrop
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ClearIcon from '@mui/icons-material/Clear';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import StarIcon from '@mui/icons-material/Star';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';

// Course Detail Modal Component
const CourseDetailModal = ({ open, onClose, course, onEnroll }) => {
  const theme = useTheme();
  
  if (!course) return null;
  
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
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
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
          
          {/* Course Banner Image */}
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                height: 200,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
                position: 'relative',
              }}
            />
            
            {/* Play button overlay */}
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <IconButton
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                  p: 2
                }}
              >
                <PlayArrowIcon sx={{ fontSize: 40, color: '#fff' }} />
              </IconButton>
            </Box>
            
            {/* Course info overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Chip 
                    label={course.difficulty} 
                    size="small" 
                    sx={{ 
                      mr: 1, 
                      bgcolor: 
                        course.difficulty === 'Beginner' ? theme.palette.success.main :
                        course.difficulty === 'Intermediate' ? theme.palette.primary.main :
                        theme.palette.secondary.main,
                      color: 'white'
                    }} 
                  />
                  <Chip 
                    label={course.category} 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: '#fff' 
                    }} 
                  />
                </Box>
                <Rating value={course.rating || 4.5} precision={0.1} size="small" readOnly />
              </Box>
            </Box>
          </Box>
          
          {/* Course details */}
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
              {course.title}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {course.description || 'No description available.'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                src={course.instructorAvatar || '/default-avatar.jpg'} 
                alt={course.instructorName}
                sx={{ width: 32, height: 32, mr: 1 }}
              />
              <Typography variant="subtitle2">
                {course.instructorName}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <AccessTimeIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="subtitle2">{course.duration}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <VideoLibraryIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">Videos</Typography>
                  <Typography variant="subtitle2">{course.videoCount} videos</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <StarIcon color="warning" />
                  <Typography variant="body2" color="text.secondary">Rating</Typography>
                  <Typography variant="subtitle2">{course.rating}/5</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <HowToRegIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">Enrolled</Typography>
                  <Typography variant="subtitle2">158 students</Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<HowToRegIcon />}
              fullWidth
              onClick={() => onEnroll(course.id)}
              sx={{
                py: 1.5,
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                }
              }}
            >
              Enroll Now
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

// Course card component with border animation
const CourseCard = ({ course, onClick, index = 0 }) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Determine color based on difficulty
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner':
        return theme.palette.success.main;
      case 'Intermediate':
        return theme.palette.primary.main;
      case 'Advanced':
        return theme.palette.secondary.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Box 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      sx={{
        position: 'relative',
        height: '100%',
        cursor: 'pointer',
        // Border animation container
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: -2,
          borderRadius: 3,
          padding: 2,
          background: `linear-gradient(135deg, 
            ${theme.palette.primary.main}, 
            ${theme.palette.secondary.main}, 
            ${theme.palette.primary.main}, 
            ${theme.palette.secondary.main})`,
          backgroundSize: '400% 400%',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          animation: 'border-rotate 3s linear infinite',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          zIndex: 0
        }
      }}
    >
      <Card 
        elevation={hovered ? 8 : 2}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          position: 'relative',
          zIndex: 1,
          maxWidth: '100%'
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="div"
            sx={{
              height: 0,
              paddingTop: '56.25%', // 16:9 aspect ratio
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
            }}
          />
          
          {/* Difficulty chip */}
          <Chip
            label={course.difficulty}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: alpha(getDifficultyColor(course.difficulty), 0.9),
              color: 'white',
              fontWeight: 600,
              fontSize: '0.65rem',
              height: 20,
              '& .MuiChip-label': { px: 1, py: 0 },
            }}
          />
          
          {/* Category chip */}
          <Chip
            label={course.category}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: alpha(theme.palette.background.paper, 0.85),
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: '0.65rem',
              height: 20,
              '& .MuiChip-label': { px: 1, py: 0 },
            }}
          />
          
          {/* Simple button overlay on hover */}
          {hovered && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                animation: 'fadeIn 0.2s ease forwards',
                '@keyframes fadeIn': {
                  from: { opacity: 0 },
                  to: { opacity: 1 }
                }
              }}
            >
              <IconButton
                size="large"
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
                <PlayArrowIcon fontSize="large" />
              </IconButton>
            </Box>
          )}
        </Box>
        
        <CardContent sx={{ flexGrow: 1, p: 1.5, zIndex: 1 }}>
          <Typography 
            variant="subtitle1" 
            component="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              fontSize: '0.85rem',
              lineHeight: 1.2,
              height: '2rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {course.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 1,
              height: '2.4rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontSize: '0.75rem',
            }}
          >
            {course.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              src={course.instructorAvatar || '/default-avatar.jpg'} 
              alt={course.instructorName}
              sx={{ 
                width: 20, 
                height: 20, 
                mr: 0.75,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              noWrap 
              sx={{ 
                maxWidth: '70%',
                fontWeight: 500,
                fontSize: '0.7rem',
              }}
            >
              {course.instructorName}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 0.75 }} />
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 0.75
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon 
                fontSize="small" 
                sx={{ 
                  mr: 0.5, 
                  color: 'text.secondary', 
                  fontSize: '0.7rem',
                }} 
              />
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.7rem',
                }}
              >
                {course.duration || '3h 20m'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VideoLibraryIcon 
                fontSize="small" 
                sx={{ 
                  mr: 0.5, 
                  color: 'text.secondary', 
                  fontSize: '0.7rem',
                }} 
              />
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.7rem',
                }}
              >
                {course.videoCount || 12}
              </Typography>
            </Box>
            
            {course.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon 
                  sx={{ 
                    color: theme.palette.warning.main, 
                    fontSize: '0.7rem', 
                    mr: 0.5,
                  }} 
                />
                <Typography 
                  variant="body2" 
                  fontWeight={500}
                  sx={{ 
                    fontSize: '0.7rem',
                  }}
                >
                  {course.rating}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// Scrollable course section component
const ScrollableSection = ({ title, courses, onCourseClick }) => {
  const theme = useTheme();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  
  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [courses]);
  
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.8;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
        
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setTimeout(checkScrollButtons, 400);
    }
  };
  
  return (
    <Box 
      sx={{ 
        mb: 4, 
        position: 'relative',
        '&:hover': {
          '& .scroll-buttons': {
            opacity: 1,
          }
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        position: 'relative'
      }}>
        <Typography 
          variant="h5" 
          component="h2" 
          fontWeight={700}
          sx={{ 
            color: theme.palette.primary.main,
            position: 'relative',
            pl: 2,
            fontSize: { xs: '1.2rem', md: '1.4rem' },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 4,
              height: '80%',
              background: theme.palette.primary.main,
              borderRadius: 2
            }
          }}
        >
          {title}
        </Typography>
        
        <Box 
          className="scroll-buttons"
          sx={{ 
            ml: 'auto', 
            display: 'flex', 
            opacity: isHovered ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
          }}
        >
          <IconButton 
            onClick={() => scroll('left')} 
            disabled={!canScrollLeft}
            size="small"
            sx={{ 
              color: canScrollLeft ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.3),
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <IconButton 
            onClick={() => scroll('right')} 
            disabled={!canScrollRight}
            size="small"
            sx={{ 
              ml: 1,
              color: canScrollRight ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.3),
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Box 
        ref={scrollContainerRef}
        sx={{ 
          display: 'flex', 
          overflowX: 'auto',
          pb: 2,
          gap: 2,
          scrollbarWidth: 'none', // Firefox
          '&::-webkit-scrollbar': {
            display: 'none', // Webkit browsers
          },
          msOverflowStyle: 'none', // IE ve Edge için - DÜZELTILDI: kebab-case yerine camelCase kullanın
          position: 'relative',
        }}
        onScroll={checkScrollButtons}
      >
        {courses.map((course, index) => (
          <Box 
            key={course.id} 
            sx={{ 
              minWidth: { xs: '160px', sm: '180px', md: '200px' }, // Sabit küçük genişlikler
              maxWidth: { xs: '160px', sm: '180px', md: '200px' },
              flexShrink: 0
            }}
          >
            <CourseCard
              course={course} 
              onClick={() => onCourseClick(course.id)} 
              index={index}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Animated background with glowing stars effect
const GlowingStarsBackground = () => {
  const theme = useTheme();
  
  return (
    <Box
      className="stars-container"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: -1,
      }}
    >
      {/* Small star particles */}
      {[...Array(70)].map((_, i) => (
        <Box
          key={`star-${i}`}
          className="star"
          sx={{
            position: 'absolute',
            width: Math.random() < 0.7 ? '1px' : '2px',
            height: Math.random() < 0.7 ? '1px' : '2px',
            backgroundColor: i % 5 === 0 ? theme.palette.secondary.main : theme.palette.primary.main,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `twinkle-${i % 3} ${2 + Math.random() * 4}s infinite ease-in-out`,
            opacity: 0.6 + Math.random() * 0.4,
          }}
        />
      ))}
      
      {/* Larger glow stars */}
      {[...Array(20)].map((_, i) => {
        const size = 1 + Math.random() * 2;
        return (
          <Box
            key={`glow-star-${i}`}
            className="glow-star"
            sx={{
              position: 'absolute',
              width: size,
              height: size,
              backgroundColor: i % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
              borderRadius: '50%',
              boxShadow: i % 2 === 0 
                ? `0 0 ${5 + Math.random() * 10}px ${theme.palette.primary.main}`
                : `0 0 ${5 + Math.random() * 10}px ${theme.palette.secondary.main}`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse-${i % 5} ${4 + Math.random() * 6}s infinite alternate`,
            }}
          />
        );
      })}
    </Box>
  );
};

// Main Courses Page Component
export default function CoursesPage() {
  const router = useRouter();
  const theme = useTheme();
  
  // State for courses data and filters
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for course detail modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Categories and difficulties
  const categories = ['Web Development', 'Blockchain', 'Programming', 'Design', 'Marketing', 'Business'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  
  // Fetch courses from API
  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (category) queryParams.append('category', category);
      if (difficulty) queryParams.append('difficulty', difficulty);
      queryParams.append('page', page);
      
      // Mock data for development
      const mockData = {
        courses: [
          {
            id: 1,
            title: 'Introduction to Blockchain',
            description: 'Learn the basics of blockchain technology and how it works.',
            category: 'Blockchain',
            difficulty: 'Beginner',
            thumbnailURL: '/placeholder-course1.jpg',
            instructorName: 'John Doe',
            instructorAvatar: '/avatar1.jpg',
            videoCount: 12,
            duration: '4h 20m',
            rating: 4.8,
            featured: true
          },
          {
            id: 2,
            title: 'Smart Contract Development',
            description: 'Build decentralized applications using smart contracts.',
            category: 'Blockchain',
            difficulty: 'Intermediate',
            thumbnailURL: '/placeholder-course2.jpg',
            instructorName: 'Jane Smith',
            instructorAvatar: '/avatar2.jpg',
            videoCount: 18,
            duration: '6h 45m',
            rating: 4.9,
            featured: true
          },
          {
            id: 3,
            title: 'Web3 Frontend Development',
            description: 'Create modern web interfaces for blockchain applications.',
            category: 'Web Development',
            difficulty: 'Intermediate',
            thumbnailURL: '/placeholder-course3.jpg',
            instructorName: 'David Johnson',
            instructorAvatar: '/avatar3.jpg',
            videoCount: 15,
            duration: '5h 30m',
            rating: 4.7,
            featured: true
          },
          {
            id: 4,
            title: 'Cryptocurrency Trading Basics',
            description: 'Learn the fundamentals of trading cryptocurrencies.',
            category: 'Business',
            difficulty: 'Beginner',
            thumbnailURL: '/placeholder-course4.jpg',
            instructorName: 'Sarah Williams',
            instructorAvatar: '/avatar4.jpg',
            videoCount: 10,
            duration: '3h 15m',
            rating: 4.6
          },
          {
            id: 5,
            title: 'NFT Creation and Marketing',
            description: 'Design, mint, and sell your own NFT collections.',
            category: 'Design',
            difficulty: 'Intermediate',
            thumbnailURL: '/placeholder-course5.jpg',
            instructorName: 'Michael Brown',
            instructorAvatar: '/avatar5.jpg',
            videoCount: 14,
            duration: '4h 50m',
            rating: 4.5,
            featured: true
          },
          {
            id: 6,
            title: 'Blockchain Security',
            description: 'Understand security best practices for blockchain applications.',
            category: 'Blockchain',
            difficulty: 'Advanced',
            thumbnailURL: '/placeholder-course6.jpg',
            instructorName: 'Emily Davis',
            instructorAvatar: '/avatar6.jpg',
            videoCount: 16,
            duration: '5h 40m',
            rating: 4.9
          },
          {
            id: 7,
            title: 'JavaScript for Web3',
            description: 'Master JavaScript for blockchain development.',
            category: 'Programming',
            difficulty: 'Intermediate',
            thumbnailURL: '/placeholder-course7.jpg',
            instructorName: 'Alex Johnson',
            instructorAvatar: '/avatar7.jpg',
            videoCount: 20,
            duration: '7h 15m',
            rating: 4.7
          },
          {
            id: 8,
            title: 'DeFi Fundamentals',
            description: 'Explore the world of Decentralized Finance.',
            category: 'Blockchain',
            difficulty: 'Intermediate',
            thumbnailURL: '/placeholder-course8.jpg',
            instructorName: 'Jessica Chen',
            instructorAvatar: '/avatar8.jpg',
            videoCount: 14,
            duration: '5h 20m',
            rating: 4.8,
            featured: true
          },
          {
            id: 9,
            title: 'React for Web3 Applications',
            description: 'Build modern user interfaces for blockchain applications using React.',
            category: 'Web Development',
            difficulty: 'Intermediate',
            thumbnailURL: '/placeholder-course9.jpg',
            instructorName: 'Robert Wilson',
            instructorAvatar: '/avatar9.jpg',
            videoCount: 16,
            duration: '6h 10m',
            rating: 4.6
          }
        ],
        totalPages: 3
      };
      
      // Filter mock data based on filters
      let filteredCourses = [...mockData.courses];
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredCourses = filteredCourses.filter(course => 
          course.title.toLowerCase().includes(query) || 
          course.description.toLowerCase().includes(query)
        );
      }
      
      if (category) {
        filteredCourses = filteredCourses.filter(course => course.category === category);
      }
      
      if (difficulty) {
        filteredCourses = filteredCourses.filter(course => course.difficulty === difficulty);
      }
      
      // Set courses and total pages
      setCourses(filteredCourses);
      setTotalPages(Math.ceil(filteredCourses.length / 12)); // 12 courses per page
      setError('');
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setError('Failed to load courses. Please try again later.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch courses when filters or page changes
  useEffect(() => {
    fetchCourses();
  }, [page, searchQuery, category, difficulty]);
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(1);
  };
  
  const handleDifficultyChange = (event) => {
    setDifficulty(event.target.value);
    setPage(1);
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setDifficulty('');
    setPage(1);
  };
  
  const handleCourseClick = (courseId) => {
    // Find the course by ID
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setModalOpen(true);
    }
  };
  
  const handleModalClose = () => {
    setModalOpen(false);
  };
  
  const handleEnrollCourse = (courseId) => {
    // Close the modal
    setModalOpen(false);
    // Navigate to course detail page
    router.push(`/courses/${courseId}`);
  };
  
  // Get featured courses
  const getFeaturedCourses = () => {
    return courses.filter(course => course.featured);
  };
  
  // Group courses by category
  const getCoursesByCategory = (categoryName) => {
    return courses.filter(course => course.category === categoryName);
  };

  // Calculate courses for current page
  const coursesPerPage = 12; // 4x3 grid
  const startIndex = (page - 1) * coursesPerPage;
  const displayedCourses = courses.slice(startIndex, startIndex + coursesPerPage);
  
  // Define animations
  const animations = `
    @keyframes border-rotate {
      0% { background-position: 0% 50%; }
      100% { background-position: 100% 50%; }
    }
    
    @keyframes twinkle-0 {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    
    @keyframes twinkle-1 {
      0%, 100% { opacity: 0.6; }
      30% { opacity: 0.2; }
      60% { opacity: 1; }
    }
    
    @keyframes twinkle-2 {
      0%, 100% { opacity: 0.3; }
      40% { opacity: 0.8; }
      80% { opacity: 0.1; }
    }
    
    @keyframes pulse-0 {
      0% { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(1.2); opacity: 1; }
    }
    
    @keyframes pulse-1 {
      0% { transform: scale(0.9); opacity: 0.5; }
      100% { transform: scale(1.1); opacity: 0.9; }
    }
    
    @keyframes pulse-2 {
      0% { transform: scale(1.1); opacity: 0.4; }
      100% { transform: scale(0.9); opacity: 0.8; }
    }
    
    @keyframes pulse-3 {
      0% { transform: scale(0.8); opacity: 0.6; }
      100% { transform: scale(1.2); opacity: 1; }
    }
    
    @keyframes pulse-4 {
      0% { transform: scale(1.2); opacity: 0.3; }
      100% { transform: scale(0.8); opacity: 0.7; }
    }
  `;
  
  return (
    <Box sx={{ py: 4, position: 'relative', minHeight: '100vh' }}>
      {/* Add animations styles */}
      <style>{animations}</style>
      
      {/* Animated background */}
      <GlowingStarsBackground />
      
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(300deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              mb: 1.5,
              fontSize: { xs: '2rem', md: '2.75rem' },
              animation: 'gradient 4s ease infinite',
              '@keyframes gradient': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' }
              }
            }}
          >
            Explore Courses
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              mb: 4,
              fontSize: '1rem'
            }}
          >
            Discover our wide range of educational content and learn at your own pace
          </Typography>
        </Box>
        
        {/* Search and Filters */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 4,
            borderRadius: 2
          }}
        >
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2
          }}>
            <TextField
              fullWidth
              placeholder="Search for courses..."
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton 
                      edge="end" 
                      onClick={() => setSearchQuery('')}
                      size="small"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
              sx={{ flex: '1 1 auto' }}
            />
            
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              width: { xs: '100%', sm: 'auto' } 
            }}>
              <Button
                variant={showFilters ? "contained" : "outlined"}
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                size="small"
                sx={{ 
                  flex: { xs: '1 1 auto', sm: '0 0 auto' },
                }}
              >
                {showFilters ? "Hide Filters" : "Filters"}
              </Button>
              
              {(searchQuery || category || difficulty) && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearFilters}
                  size="small"
                  sx={{ 
                    flex: { xs: '1 1 auto', sm: '0 0 auto' },
                  }}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Box>
          
          {/* Expandable filter section */}
          {showFilters && (
            <Box 
              sx={{ 
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
              }}
            >
              <FormControl 
                fullWidth 
                variant="outlined"
                size="small"
                sx={{ flex: '1 1 auto' }}
              >
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl 
                fullWidth 
                variant="outlined"
                size="small"
                sx={{ flex: '1 1 auto' }}
              >
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={difficulty}
                  label="Difficulty"
                  onChange={handleDifficultyChange}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  {difficulties.map((diff) => (
                    <MenuItem key={diff} value={diff}>{diff}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Paper>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}
        
        {/* Course List */}
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flexDirection: 'column',
            minHeight: 300
          }}>
            <CircularProgress size={40} />
            <Typography sx={{ mt: 2, color: 'text.secondary' }}>
              Loading courses...
            </Typography>
          </Box>
        ) : courses.length > 0 ? (
          <>
            {/* Featured Courses - Horizontal Scrollable */}
            {!searchQuery && !category && !difficulty && getFeaturedCourses().length > 0 && (
              <ScrollableSection 
                title="Featured Courses" 
                courses={getFeaturedCourses()} 
                onCourseClick={handleCourseClick}
              />
            )}
            
            {/* Display category sections */}
            {!searchQuery && !category && !difficulty ? (
              <>
                {categories.map((categoryName) => {
                  const categoryCourses = getCoursesByCategory(categoryName);
                  if (categoryCourses.length === 0) return null;
                  
                  return (
                    <ScrollableSection
                      key={categoryName}
                      title={categoryName} 
                      courses={categoryCourses} 
                      onCourseClick={handleCourseClick}
                    />
                  );
                })}
              </>
            ) : (
              <>
                {/* Filtered results */}
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      mb: 0.5
                    }}
                  >
                    Search Results
                  </Typography>
                  <Typography color="text.secondary">
                    Found {courses.length} {courses.length === 1 ? 'course' : 'courses'}
                  </Typography>
                </Box>
                
                <Grid container spacing={2.5}>
                  {displayedCourses.map((course, index) => (
                    <Grid item xs={6} sm={4} md={3} key={course.id}>
                      <CourseCard 
                        course={course} 
                        onClick={() => handleCourseClick(course.id)}
                        index={index}
                      />
                    </Grid>
                  ))}
                </Grid>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="medium"
                      siblingCount={1}
                    />
                  </Box>
                )}
              </>
            )}
          </>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            my: 6, 
            py: 4,
          }}>
            <BookmarkIcon 
              sx={{ 
                fontSize: 48, 
                color: alpha(theme.palette.primary.main, 0.5),
                mb: 2
              }} 
            />
            <Typography variant="h6" paragraph>
              No courses found matching your criteria
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search or filters
            </Typography>
            <Button
              variant="contained"
              onClick={handleClearFilters}
              color="primary"
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Container>
      
      {/* Course Detail Modal */}
      <CourseDetailModal 
        open={modalOpen}
        onClose={handleModalClose}
        course={selectedCourse}
        onEnroll={handleEnrollCourse}
      />
    </Box>
  );
}