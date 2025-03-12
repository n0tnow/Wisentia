'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardActions,
  Menu,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  alpha,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Category as CategoryIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  Upload as UploadIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  VideoLibrary as VideoIcon,
  TextFields as TextIcon,
  Games as InteractiveIcon,
  ExpandMore as ExpandMoreIcon,
  AddCircle as AddCircleIcon,
  PlayArrow as PlayArrowIcon,
  Star as StarIcon,
  Money as MoneyIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  Article as ArticleIcon,
  DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';

// Mock education levels
const educationLevels = [
  { value: 1, label: 'Primary' },
  { value: 2, label: 'Secondary' },
  { value: 3, label: 'High School' },
  { value: 4, label: 'University' },
  { value: 5, label: 'Professional' }
];

// Mock difficulty levels
const difficultyLevels = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Elementary' },
  { value: 3, label: 'Intermediate' },
  { value: 4, label: 'Advanced' },
  { value: 5, label: 'Expert' }
];

// Mock categories
const mockCategories = [
  { id: 1, name: 'Programming', description: 'Programming languages and algorithms', educationLevel: null, iconUrl: '/icons/programming.png', courseCount: 25, active: true },
  { id: 2, name: 'Mathematics', description: 'Basic and advanced mathematics topics', educationLevel: null, iconUrl: '/icons/math.png', courseCount: 18, active: true },
  { id: 3, name: 'Science', description: 'Physics, chemistry and biology', educationLevel: null, iconUrl: '/icons/science.png', courseCount: 15, active: true },
  { id: 4, name: 'Language Learning', description: 'Foreign language education', educationLevel: null, iconUrl: '/icons/language.png', courseCount: 12, active: true },
  { id: 5, name: 'Business', description: 'Business and management education', educationLevel: null, iconUrl: '/icons/business.png', courseCount: 10, active: true }
];

// Mock courses
const mockCourses = [
  { 
    id: 1, 
    title: 'Python Fundamentals', 
    description: 'Learn the basics of Python programming language',
    categoryId: 1,
    educationLevel: 3,
    difficultyLevel: 1,
    durationMinutes: 480,
    points: 100,
    price: 0,
    isPremium: false,
    thumbnail: '/thumbnails/python-basics.jpg',
    published: true,
    enrolledStudents: 1250,
    rating: 4.8,
    completionRate: 68,
    contentCount: 12,
    questCount: 3,
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-06-22T14:15:00Z'
  },
  { 
    id: 2, 
    title: 'Advanced Python', 
    description: 'Object-oriented programming and advanced Python concepts',
    categoryId: 1,
    educationLevel: 4,
    difficultyLevel: 3,
    durationMinutes: 720,
    points: 200,
    price: 150,
    isPremium: true,
    thumbnail: '/thumbnails/advanced-python.jpg',
    published: true,
    enrolledStudents: 850,
    rating: 4.7,
    completionRate: 52,
    contentCount: 18,
    questCount: 5,
    createdAt: '2023-02-20T14:45:00Z',
    updatedAt: '2023-07-15T08:30:00Z'
  },
  { 
    id: 3, 
    title: 'Calculus 101', 
    description: 'Introduction to calculus and derivatives',
    categoryId: 2,
    educationLevel: 4,
    difficultyLevel: 2,
    durationMinutes: 540,
    points: 150,
    price: 0,
    isPremium: false,
    thumbnail: '/thumbnails/calculus.jpg',
    published: true,
    enrolledStudents: 610,
    rating: 4.5,
    completionRate: 45,
    contentCount: 15,
    questCount: 4,
    createdAt: '2023-03-10T11:15:00Z',
    updatedAt: '2023-08-05T16:20:00Z'
  },
  { 
    id: 4, 
    title: 'English for Beginners', 
    description: 'Basic English grammar and vocabulary',
    categoryId: 4,
    educationLevel: 2,
    difficultyLevel: 1,
    durationMinutes: 800,
    points: 120,
    price: 0,
    isPremium: false,
    thumbnail: '/thumbnails/english-beginners.jpg',
    published: true,
    enrolledStudents: 2480,
    rating: 4.9,
    completionRate: 75,
    contentCount: 20,
    questCount: 6,
    createdAt: '2023-04-05T09:20:00Z',
    updatedAt: '2023-07-28T13:10:00Z'
  },
  { 
    id: 5, 
    title: 'Web Development', 
    description: 'HTML, CSS and JavaScript fundamentals',
    categoryId: 1,
    educationLevel: 3,
    difficultyLevel: 2,
    durationMinutes: 600,
    points: 180,
    price: 100,
    isPremium: true,
    thumbnail: '/thumbnails/web-dev.jpg',
    published: true,
    enrolledStudents: 1750,
    rating: 4.6,
    completionRate: 58,
    contentCount: 16,
    questCount: 4,
    createdAt: '2023-05-18T15:30:00Z',
    updatedAt: '2023-08-12T10:45:00Z'
  },
  { 
    id: 6, 
    title: 'Business Strategy', 
    description: 'Strategic planning in the modern business world',
    categoryId: 5,
    educationLevel: 5,
    difficultyLevel: 4,
    durationMinutes: 720,
    points: 220,
    price: 200,
    isPremium: true,
    thumbnail: '/thumbnails/business-strategy.jpg',
    published: false,
    enrolledStudents: 0,
    rating: 0,
    completionRate: 0,
    contentCount: 14,
    questCount: 2,
    createdAt: '2023-06-22T13:45:00Z',
    updatedAt: '2023-06-22T13:45:00Z'
  },
  { 
    id: 7, 
    title: 'General Physics', 
    description: 'Mechanics, electricity and magnetism',
    categoryId: 3,
    educationLevel: 3,
    difficultyLevel: 3,
    durationMinutes: 540,
    points: 160,
    price: 0,
    isPremium: false,
    thumbnail: '/thumbnails/physics.jpg',
    published: true,
    enrolledStudents: 920,
    rating: 4.4,
    completionRate: 42,
    contentCount: 18,
    questCount: 5,
    createdAt: '2023-07-14T10:10:00Z',
    updatedAt: '2023-09-02T15:30:00Z'
  },
  { 
    id: 8, 
    title: 'Piano for Beginners', 
    description: 'Learn to play the piano from scratch',
    categoryId: 5,
    educationLevel: 2,
    difficultyLevel: 2,
    durationMinutes: 480,
    points: 130,
    price: 120,
    isPremium: true,
    thumbnail: '/thumbnails/piano.jpg',
    published: true,
    enrolledStudents: 480,
    rating: 4.7,
    completionRate: 63,
    contentCount: 12,
    questCount: 3,
    createdAt: '2023-08-30T16:20:00Z',
    updatedAt: '2023-09-15T11:05:00Z'
  }
];

// Mock content types
const contentTypes = [
  { value: 'video', label: 'Video', icon: <VideoIcon /> },
  { value: 'text', label: 'Text', icon: <TextIcon /> },
  { value: 'interactive', label: 'Interactive', icon: <InteractiveIcon /> }
];

// Mock course contents
const mockContents = [
  { id: 1, courseId: 1, title: 'Introduction to Python', contentType: 'video', contentUrl: 'https://example.com/videos/python-intro.mp4', sequence: 1, durationMinutes: 15 },
  { id: 2, courseId: 1, title: 'Variables and Data Types', contentType: 'video', contentUrl: 'https://example.com/videos/python-variables.mp4', sequence: 2, durationMinutes: 25 },
  { id: 3, courseId: 1, title: 'Conditional Statements', contentType: 'text', contentUrl: null, sequence: 3, durationMinutes: 20 },
  { id: 4, courseId: 1, title: 'Loops', contentType: 'interactive', contentUrl: 'https://example.com/interactive/python-loops.html', sequence: 4, durationMinutes: 30 },
  { id: 5, courseId: 2, title: 'Classes and Objects', contentType: 'video', contentUrl: 'https://example.com/videos/python-classes.mp4', sequence: 1, durationMinutes: 40 },
  { id: 6, courseId: 2, title: 'Inheritance', contentType: 'text', contentUrl: null, sequence: 2, durationMinutes: 30 },
  { id: 7, courseId: 3, title: 'The Concept of Limits', contentType: 'video', contentUrl: 'https://example.com/videos/calculus-limits.mp4', sequence: 1, durationMinutes: 35 },
  { id: 8, courseId: 3, title: 'Differentiation Rules', contentType: 'interactive', contentUrl: 'https://example.com/interactive/calculus-derivatives.html', sequence: 2, durationMinutes: 45 }
];

// TabPanel component for detail drawer
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
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Course detail drawer
const CourseDetailDrawer = ({ open, course, contents, onClose, onAddContent, onEditContent, onDeleteContent }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  if (!course) return null;
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Get category name
  const getCategoryName = (categoryId) => {
    const category = mockCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  // Get education level name
  const getEducationLevelName = (level) => {
    const educationLevel = educationLevels.find(l => l.value === level);
    return educationLevel ? educationLevel.label : 'Unknown';
  };
  
  // Get difficulty level name
  const getDifficultyLevelName = (level) => {
    const difficultyLevel = difficultyLevels.find(l => l.value === level);
    return difficultyLevel ? difficultyLevel.label : 'Unknown';
  };
  
  // Get content type data
  const getContentTypeData = (type) => {
    const contentType = contentTypes.find(t => t.value === type);
    return contentType || { label: 'Unknown', icon: null };
  };
  
  // Filter contents by course ID
  const courseContents = contents.filter(content => content.courseId === course.id);
  
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600, md: 800 }, p: 0 }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" component="div">
          Course Details
        </Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>
      
      {/* Course header */}
      <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Box
              component="img"
              src={course.thumbnail || '/thumbnails/default-course.jpg'}
              alt={course.title}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: 1
              }}
              onError={(e) => {
                e.target.src = '/thumbnails/default-course.jpg';
              }}
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={getCategoryName(course.categoryId)}
                color="primary"
                size="small"
              />
              <Chip
                label={course.published ? 'Published' : 'Draft'}
                color={course.published ? 'success' : 'default'}
                size="small"
              />
              {course.isPremium && (
                <Chip
                  label="Premium"
                  color="secondary"
                  size="small"
                />
              )}
            </Box>
            <Typography variant="h5" component="h2" fontWeight="bold">
              {course.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ my: 1 }}>
              {course.description}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {Math.floor(course.durationMinutes / 60)}h {course.durationMinutes % 60}m
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StarIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {course.rating > 0 ? course.rating.toFixed(1) : 'No ratings'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SchoolIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {course.enrolledStudents} students
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ArticleIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {course.contentCount} contents
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="course tabs">
          <Tab label="Overview" id="course-tab-0" aria-controls="course-tabpanel-0" />
          <Tab label="Contents" id="course-tab-1" aria-controls="course-tabpanel-1" />
          <Tab label="Statistics" id="course-tab-2" aria-controls="course-tabpanel-2" />
        </Tabs>
      </Box>
      
      <Box sx={{ p: 3 }}>
        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Course Info
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1">
                          {getCategoryName(course.categoryId)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Education Level
                        </Typography>
                        <Typography variant="body1">
                          {getEducationLevelName(course.educationLevel)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Difficulty
                        </Typography>
                        <Typography variant="body1">
                          {getDifficultyLevelName(course.difficultyLevel)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body1">
                          {Math.floor(course.durationMinutes / 60)}h {course.durationMinutes % 60}m
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Points
                        </Typography>
                        <Typography variant="body1">
                          {course.points}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Price
                        </Typography>
                        <Typography variant="body1">
                          {course.price > 0 ? `$${course.price}` : 'Free'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status & Dates
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Typography variant="body1">
                          {course.published ? 'Published' : 'Draft'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Premium
                        </Typography>
                        <Typography variant="body1">
                          {course.isPremium ? 'Yes' : 'No'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body1">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body1">
                          {new Date(course.updatedAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Content Items
                        </Typography>
                        <Typography variant="body1">
                          {course.contentCount}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Quests
                        </Typography>
                        <Typography variant="body1">
                          {course.questCount}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Contents Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Course Contents
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => onAddContent(course.id)}
            >
              Add Content
            </Button>
          </Box>
          
          {courseContents.length > 0 ? (
            <Box>
              {courseContents.map((content, index) => (
                <Accordion key={content.id} defaultExpanded={index === 0}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`content-${content.id}-content`}
                    id={`content-${content.id}-header`}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography sx={{ flexGrow: 1 }}>
                        {content.sequence}. {content.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <Chip
                          size="small"
                          label={getContentTypeData(content.contentType).label}
                          icon={getContentTypeData(content.contentType).icon}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {content.durationMinutes} min
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        {content.contentType === 'video' && (
                          <Typography variant="body2" color="text.secondary">
                            Video URL: {content.contentUrl}
                          </Typography>
                        )}
                        {content.contentType === 'interactive' && (
                          <Typography variant="body2" color="text.secondary">
                            Interactive URL: {content.contentUrl}
                          </Typography>
                        )}
                        {content.contentType === 'text' && (
                          <Typography variant="body2" color="text.secondary">
                            Text content (truncated): Lorem ipsum dolor sit amet...
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => onEditContent(content)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => {/* View/preview content */}}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => onDeleteContent(content)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No content has been added to this course yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddCircleIcon />}
                onClick={() => onAddContent(course.id)}
                sx={{ mt: 2 }}
              >
                Add First Content
              </Button>
            </Box>
          )}
        </TabPanel>
        
        {/* Statistics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Enrolled Students
                  </Typography>
                  <Typography variant="h3" align="center" sx={{ my: 2 }}>
                    {course.enrolledStudents.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Average Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
                    <Typography variant="h3">
                      {course.rating > 0 ? course.rating.toFixed(1) : 'N/A'}
                    </Typography>
                    {course.rating > 0 && (
                      <StarIcon color="warning" sx={{ ml: 1, fontSize: '2rem' }} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Completion Rate
                  </Typography>
                  <Box sx={{ position: 'relative', my: 2 }}>
                    <Typography 
                      variant="h3" 
                      align="center"
                      sx={{ position: 'relative', zIndex: 1 }}
                    >
                      {course.completionRate}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={course.completionRate} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0
                      }} 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue
                  </Typography>
                  <Typography variant="h3" align="center" sx={{ my: 2 }}>
                    ${(course.price * course.enrolledStudents).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Drawer>
  );
};

export default function CoursesManagement() {
  const theme = useTheme();
  const [courses, setCourses] = useState(mockCourses);
  const [contents, setContents] = useState(mockContents);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [educationLevelFilter, setEducationLevelFilter] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [deleteContentDialogOpen, setDeleteContentDialogOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [contentToEdit, setContentToEdit] = useState(null);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  
  // Menu states
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [targetCourseId, setTargetCourseId] = useState(null);
  
  // Course detail drawer
  const [courseDetailOpen, setCourseDetailOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Form states for course dialog
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    educationLevel: '',
    difficultyLevel: '',
    durationMinutes: '',
    points: '',
    price: '',
    isPremium: false,
    thumbnail: '',
    published: false
  });
  
  // Form states for content dialog
  const [contentFormData, setContentFormData] = useState({
    title: '',
    contentType: 'video',
    contentUrl: '',
    sequence: 1,
    durationMinutes: ''
  });
  
  // View states - list or grid view
  const [viewMode, setViewMode] = useState('list');
  
  // Handlers for page and rows per page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Search handler
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  // Category filter handler
  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };
  
  // Education level filter handler
  const handleEducationLevelFilterChange = (event) => {
    setEducationLevelFilter(event.target.value);
    setPage(0);
  };
  
  // Refresh courses
  const handleRefreshCourses = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  // Dialog handlers for courses
  const handleOpenAddDialog = () => {
    setFormData({
      title: '',
      description: '',
      categoryId: '',
      educationLevel: '',
      difficultyLevel: '',
      durationMinutes: '',
      points: '',
      price: '',
      isPremium: false,
      thumbnail: '',
      published: false
    });
    setAddDialogOpen(true);
  };
  
  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };
  
  const handleOpenEditDialog = (course) => {
    setCourseToEdit(course);
    setFormData({
      title: course.title,
      description: course.description,
      categoryId: course.categoryId.toString(),
      educationLevel: course.educationLevel.toString(),
      difficultyLevel: course.difficultyLevel.toString(),
      durationMinutes: course.durationMinutes.toString(),
      points: course.points.toString(),
      price: course.price.toString(),
      isPremium: course.isPremium,
      thumbnail: course.thumbnail || '',
      published: course.published
    });
    setEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCourseToEdit(null);
  };
  
  const handleOpenDeleteDialog = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };
  
  // Dialog handlers for contents
  const handleOpenContentDialog = (courseId, content = null) => {
    setSelectedCourseId(courseId);
    if (content) {
      setContentToEdit(content);
      setContentFormData({
        title: content.title,
        contentType: content.contentType,
        contentUrl: content.contentUrl || '',
        sequence: content.sequence,
        durationMinutes: content.durationMinutes.toString()
      });
    } else {
      // Calculate next sequence number
      const courseContents = contents.filter(c => c.courseId === courseId);
      const nextSequence = courseContents.length > 0 
        ? Math.max(...courseContents.map(c => c.sequence)) + 1 
        : 1;
      
      setContentToEdit(null);
      setContentFormData({
        title: '',
        contentType: 'video',
        contentUrl: '',
        sequence: nextSequence,
        durationMinutes: ''
      });
    }
    setContentDialogOpen(true);
  };
  
  const handleCloseContentDialog = () => {
    setContentDialogOpen(false);
    setContentToEdit(null);
    setSelectedCourseId(null);
  };
  
  const handleOpenDeleteContentDialog = (content) => {
    setContentToDelete(content);
    setDeleteContentDialogOpen(true);
  };
  
  const handleCloseDeleteContentDialog = () => {
    setDeleteContentDialogOpen(false);
    setContentToDelete(null);
  };
  
  // Menu handlers
  const handleOpenMenu = (event, courseId) => {
    setMenuAnchorEl(event.currentTarget);
    setTargetCourseId(courseId);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setTargetCourseId(null);
  };
  
  // Course detail drawer handlers
  const handleOpenCourseDetail = (course) => {
    setSelectedCourse(course);
    setCourseDetailOpen(true);
  };
  
  const handleCloseCourseDetail = () => {
    setCourseDetailOpen(false);
    setSelectedCourse(null);
  };
  
  // Form data change handler for course
  const handleFormChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'isPremium' || name === 'published' ? checked : value
    }));
  };
  
  // Form data change handler for content
  const handleContentFormChange = (event) => {
    const { name, value } = event.target;
    setContentFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Save course
  const handleSaveCourse = () => {
    if (addDialogOpen) {
      // Add new course
      const newCourse = {
        id: Math.max(...courses.map(c => c.id)) + 1,
        title: formData.title,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        educationLevel: parseInt(formData.educationLevel),
        difficultyLevel: parseInt(formData.difficultyLevel),
        durationMinutes: parseInt(formData.durationMinutes),
        points: parseInt(formData.points),
        price: parseInt(formData.price),
        isPremium: formData.isPremium,
        thumbnail: formData.thumbnail,
        published: formData.published,
        enrolledStudents: 0,
        rating: 0,
        completionRate: 0,
        contentCount: 0,
        questCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCourses([...courses, newCourse]);
      handleCloseAddDialog();
    } else if (editDialogOpen && courseToEdit) {
      // Update existing course
      const updatedCourses = courses.map(course => 
        course.id === courseToEdit.id 
          ? {
              ...course,
              title: formData.title,
              description: formData.description,
              categoryId: parseInt(formData.categoryId),
              educationLevel: parseInt(formData.educationLevel),
              difficultyLevel: parseInt(formData.difficultyLevel),
              durationMinutes: parseInt(formData.durationMinutes),
              points: parseInt(formData.points),
              price: parseInt(formData.price),
              isPremium: formData.isPremium,
              thumbnail: formData.thumbnail,
              published: formData.published,
              updatedAt: new Date().toISOString()
            }
          : course
      );
      setCourses(updatedCourses);
      handleCloseEditDialog();
    }
  };
  
  // Delete course
  const handleDeleteCourse = () => {
    if (courseToDelete) {
      const filteredCourses = courses.filter(
        course => course.id !== courseToDelete.id
      );
      setCourses(filteredCourses);
      
      // Also delete all contents for this course
      const filteredContents = contents.filter(
        content => content.courseId !== courseToDelete.id
      );
      setContents(filteredContents);
      
      handleCloseDeleteDialog();
    }
  };
  
  // Save content
  const handleSaveContent = () => {
    if (contentToEdit) {
      // Update existing content
      const updatedContents = contents.map(content => 
        content.id === contentToEdit.id 
          ? {
              ...content,
              title: contentFormData.title,
              contentType: contentFormData.contentType,
              contentUrl: contentFormData.contentUrl,
              sequence: parseInt(contentFormData.sequence),
              durationMinutes: parseInt(contentFormData.durationMinutes)
            }
          : content
      );
      setContents(updatedContents);
    } else {
      // Add new content
      const newContent = {
        id: contents.length > 0 ? Math.max(...contents.map(c => c.id)) + 1 : 1,
        courseId: selectedCourseId,
        title: contentFormData.title,
        contentType: contentFormData.contentType,
        contentUrl: contentFormData.contentUrl,
        sequence: parseInt(contentFormData.sequence),
        durationMinutes: parseInt(contentFormData.durationMinutes)
      };
      setContents([...contents, newContent]);
      
      // Update content count on the course
      const updatedCourses = courses.map(course => 
        course.id === selectedCourseId 
          ? { ...course, contentCount: course.contentCount + 1 }
          : course
      );
      setCourses(updatedCourses);
    }
    handleCloseContentDialog();
  };
  
  // Delete content
  const handleDeleteContent = () => {
    if (contentToDelete) {
      const filteredContents = contents.filter(
        content => content.id !== contentToDelete.id
      );
      setContents(filteredContents);
      
      // Update content count on the course
      const updatedCourses = courses.map(course => 
        course.id === contentToDelete.courseId 
          ? { ...course, contentCount: course.contentCount - 1 }
          : course
      );
      setCourses(updatedCourses);
      
      handleCloseDeleteContentDialog();
    }
  };
  
  // Toggle course published status
  const handleTogglePublished = (courseId) => {
    const updatedCourses = courses.map(course => 
      course.id === courseId 
        ? { ...course, published: !course.published } 
        : course
    );
    setCourses(updatedCourses);
    handleCloseMenu();
  };
  
  // View mode toggle
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  // Filter and sort courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || course.categoryId === parseInt(categoryFilter);
    const matchesEducationLevel = educationLevelFilter === '' || course.educationLevel === parseInt(educationLevelFilter);
    
    return matchesSearch && matchesCategory && matchesEducationLevel;
  });
  
  // Paginated courses
  const paginatedCourses = filteredCourses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Get category name
  const getCategoryName = (categoryId) => {
    const category = mockCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  // Get education level name
  const getEducationLevelName = (level) => {
    const educationLevel = educationLevels.find(l => l.value === level);
    return educationLevel ? educationLevel.label : 'Unknown';
  };
  
  // Get difficulty level name
  const getDifficultyLevelName = (level) => {
    const difficultyLevel = difficultyLevels.find(l => l.value === level);
    return difficultyLevel ? difficultyLevel.label : 'Unknown';
  };

  return (
    <Box>
      {/* Page title and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Courses Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            New Course
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshCourses}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Filters and Search */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search Courses"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={handleCategoryFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              {mockCategories.map((category) => (
                <MenuItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Education Level</InputLabel>
            <Select
              value={educationLevelFilter}
              label="Education Level"
              onChange={handleEducationLevelFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              {educationLevels.map((level) => (
                <MenuItem key={level.value} value={level.value.toString()}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box>
            <Tooltip title="List View">
              <IconButton 
                color={viewMode === 'list' ? 'primary' : 'default'} 
                onClick={() => handleViewModeChange('list')}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Grid View">
              <IconButton 
                color={viewMode === 'grid' ? 'primary' : 'default'} 
                onClick={() => handleViewModeChange('grid')}
              >
                <SchoolIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Total: {filteredCourses.length} courses
          </Typography>
        </Box>
      </Paper>
      
      {/* Courses List View */}
      {viewMode === 'list' && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="courses table">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Education</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell align="center">Duration</TableCell>
                  <TableCell align="center">Price</TableCell>
                  <TableCell align="center">Students</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : paginatedCourses.length > 0 ? (
                  paginatedCourses.map((course) => (
                    <TableRow 
                      key={course.id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor: !course.published ? alpha(theme.palette.action.disabledBackground, 0.3) : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={course.thumbnail}
                            alt={course.title}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          >
                            <SchoolIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {course.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {course.contentCount} contents
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{getCategoryName(course.categoryId)}</TableCell>
                      <TableCell>{getEducationLevelName(course.educationLevel)}</TableCell>
                      <TableCell>{getDifficultyLevelName(course.difficultyLevel)}</TableCell>
                      <TableCell align="center">
                        {Math.floor(course.durationMinutes / 60)}h {course.durationMinutes % 60}m
                      </TableCell>
                      <TableCell align="center">
                        {course.price > 0 ? (
                          <Typography fontWeight="medium" color="primary">
                            ${course.price}
                          </Typography>
                        ) : (
                          <Chip label="Free" size="small" color="success" />
                        )}
                      </TableCell>
                      <TableCell align="center">{course.enrolledStudents}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={course.published ? 'Published' : 'Draft'} 
                          color={course.published ? 'success' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenCourseDetail(course)}
                          sx={{ mr: 0.5 }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, course.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1">
                        No courses found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCourses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows per page:"
          />
        </Paper>
      )}
      
      {/* Courses Grid View */}
      {viewMode === 'grid' && (
        <Box>
          <Grid container spacing={3}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : paginatedCourses.length > 0 ? (
              paginatedCourses.map((course) => (
                <Grid item key={course.id} xs={12} sm={6} md={4} lg={3}>
                  <Card 
                    elevation={1}
                    sx={{ 
                      height: '100%', 
                      opacity: course.published ? 1 : 0.7,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {!course.published && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          zIndex: 1,
                        }}
                      >
                        <Chip 
                          label="Draft" 
                          size="small" 
                          color="default" 
                        />
                      </Box>
                    )}
                    <CardActionArea 
                      sx={{ flexGrow: 1 }}
                      onClick={() => handleOpenCourseDetail(course)}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={course.thumbnail || '/thumbnails/default-course.jpg'}
                        alt={course.title}
                        onError={(e) => {
                          e.target.src = '/thumbnails/default-course.jpg';
                        }}
                      />
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" component="div" gutterBottom>
                            {course.title}
                          </Typography>
                          {course.isPremium && (
                            <Chip 
                              label="Premium" 
                              size="small" 
                              color="secondary" 
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {course.description.length > 100 
                            ? `${course.description.substring(0, 100)}...` 
                            : course.description
                          }
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Chip 
                            label={getCategoryName(course.categoryId)} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {Math.floor(course.durationMinutes / 60)}h {course.durationMinutes % 60}m
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Box>
                        {course.price > 0 ? (
                          <Typography variant="subtitle2" fontWeight="bold" color="primary">
                            ${course.price}
                          </Typography>
                        ) : (
                          <Chip label="Free" size="small" color="success" variant="outlined" />
                        )}
                      </Box>
                      <Box>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenEditDialog(course)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          color={course.published ? 'default' : 'success'}
                          onClick={() => handleTogglePublished(course.id)}
                        >
                          {course.published ? (
                            <CloseIcon fontSize="small" />
                          ) : (
                            <CheckCircleIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 4 }}>
                <Typography variant="body1">
                  No courses found.
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination
              rowsPerPageOptions={[8, 16, 32]}
              component="div"
              count={filteredCourses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Items per page:"
            />
          </Box>
        </Box>
      )}
      
      {/* Add/Edit Course Dialog */}
      <Dialog 
        open={addDialogOpen || editDialogOpen} 
        onClose={addDialogOpen ? handleCloseAddDialog : handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{addDialogOpen ? 'Add New Course' : 'Edit Course'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                label="Course Title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  required
                  name="categoryId"
                  value={formData.categoryId}
                  label="Category"
                  onChange={handleFormChange}
                >
                  {mockCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Education Level</InputLabel>
                <Select
                  required
                  name="educationLevel"
                  value={formData.educationLevel}
                  label="Education Level"
                  onChange={handleFormChange}
                >
                  {educationLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value.toString()}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  required
                  name="difficultyLevel"
                  value={formData.difficultyLevel}
                  label="Difficulty Level"
                  onChange={handleFormChange}
                >
                  {difficultyLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value.toString()}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                id="durationMinutes"
                label="Duration (minutes)"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleFormChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                id="points"
                label="Points"
                name="points"
                value={formData.points}
                onChange={handleFormChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                id="price"
                label="Price"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                InputProps={{
                  inputProps: { min: 0 },
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="thumbnail"
                label="Thumbnail URL"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleFormChange}
                placeholder="/thumbnails/course.jpg"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                >
                  Upload Thumbnail
                </Button>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isPremium}
                        onChange={handleFormChange}
                        name="isPremium"
                        color="secondary"
                      />
                    }
                    label="Premium"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.published}
                        onChange={handleFormChange}
                        name="published"
                        color="primary"
                      />
                    }
                    label="Published"
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={addDialogOpen ? handleCloseAddDialog : handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveCourse} 
            variant="contained" 
            disabled={!formData.title || !formData.categoryId || !formData.educationLevel || !formData.difficultyLevel}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Course Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {courseToDelete && (
              <>
                Are you sure you want to delete the course <strong>{courseToDelete.title}</strong>?
                <Box component="div" sx={{ mt: 2 }}>
                  This will also delete all content items associated with this course.
                </Box>
                {courseToDelete.enrolledStudents > 0 && (
                  <Box component="div" sx={{ mt: 2, color: theme.palette.error.main }}>
                    Warning: This course has {courseToDelete.enrolledStudents} enrolled students.
                  </Box>
                )}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteCourse} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add/Edit Content Dialog */}
      <Dialog 
        open={contentDialogOpen} 
        onClose={handleCloseContentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{contentToEdit ? 'Edit Content' : 'Add New Content'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                label="Content Title"
                name="title"
                value={contentFormData.title}
                onChange={handleContentFormChange}
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Content Type</InputLabel>
                <Select
                  required
                  name="contentType"
                  value={contentFormData.contentType}
                  label="Content Type"
                  onChange={handleContentFormChange}
                >
                  {contentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {type.icon}
                        <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                id="sequence"
                label="Sequence"
                name="sequence"
                value={contentFormData.sequence}
                onChange={handleContentFormChange}
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Grid>
            {contentFormData.contentType !== 'text' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="contentUrl"
                  label={contentFormData.contentType === 'video' ? 'Video URL' : 'Interactive Content URL'}
                  name="contentUrl"
                  value={contentFormData.contentUrl}
                  onChange={handleContentFormChange}
                  placeholder={contentFormData.contentType === 'video' 
                    ? 'https://example.com/videos/content.mp4' 
                    : 'https://example.com/interactive/content.html'
                  }
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                type="number"
                id="durationMinutes"
                label="Duration (minutes)"
                name="durationMinutes"
                value={contentFormData.durationMinutes}
                onChange={handleContentFormChange}
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Grid>
            {contentFormData.contentType === 'video' && (
              <Grid item xs={12}>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                  >
                    Upload Video
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PlayArrowIcon />}
                  >
                    Preview
                  </Button>
                </Box>
              </Grid>
            )}
            {contentFormData.contentType === 'text' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  id="contentText"
                  label="Content Text"
                  name="contentText"
                  placeholder="Enter your text content here..."
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContentDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveContent} 
            variant="contained" 
            disabled={!contentFormData.title || !contentFormData.durationMinutes}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Content Dialog */}
      <Dialog
        open={deleteContentDialogOpen}
        onClose={handleCloseDeleteContentDialog}
      >
        <DialogTitle>Delete Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {contentToDelete && (
              <>
                Are you sure you want to delete the content <strong>{contentToDelete.title}</strong>?
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteContentDialog}>Cancel</Button>
          <Button onClick={handleDeleteContent} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Course Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          const course = courses.find(c => c.id === targetCourseId);
          handleOpenCourseDetail(course);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const course = courses.find(c => c.id === targetCourseId);
          handleOpenEditDialog(course);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleTogglePublished(targetCourseId);
        }}>
          <ListItemIcon>
            {courses.find(c => c.id === targetCourseId)?.published ? (
              <CloseIcon fontSize="small" />
            ) : (
              <CheckCircleIcon fontSize="small" color="success" />
            )}
          </ListItemIcon>
          <ListItemText>
            {courses.find(c => c.id === targetCourseId)?.published ? 'Unpublish' : 'Publish'}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          const course = courses.find(c => c.id === targetCourseId);
          handleOpenDeleteDialog(course);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: theme.palette.error.main }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Course Detail Drawer */}
      <CourseDetailDrawer
        open={courseDetailOpen}
        course={selectedCourse}
        contents={contents}
        onClose={handleCloseCourseDetail}
        onAddContent={(courseId) => {
          handleOpenContentDialog(courseId);
          handleCloseCourseDetail();
        }}
        onEditContent={(content) => {
          handleOpenContentDialog(content.courseId, content);
          handleCloseCourseDetail();
        }}
        onDeleteContent={(content) => {
          handleOpenDeleteContentDialog(content);
          handleCloseCourseDetail();
        }}
      />
    </Box>
  );
}

// This is causing errors in some environments, so replacing with standard component
const MenuIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
};

// This is causing errors in some environments, so replacing with standard component
const CheckCircleIcon = ({ fontSize, color }) => {
  const style = { fontSize: fontSize === 'small' ? 20 : 24, color };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
};