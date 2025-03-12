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
  Stack,
  Radio,
  RadioGroup,
  FormLabel,
  Checkbox
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
  ExpandMore as ExpandMoreIcon,
  AddCircle as AddCircleIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  Article as ArticleIcon,
  DragIndicator as DragIndicatorIcon,
  CheckCircle as CheckCircleIcon,
  Help as HelpIcon,
  QuestionAnswer as QuestionAnswerIcon,
  TaskAlt as TaskAltIcon,
  Extension as ExtensionIcon,
  Timer as TimerIcon
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

// Mock quests
const mockQuests = [
  { 
    id: 1, 
    title: 'Python Coding Challenge', 
    description: 'Solve algorithmic problems using Python',
    categoryId: 1,
    educationLevel: 3,
    difficultyLevel: 2,
    points: 100,
    timeLimitMinutes: 45,
    isActive: true,
    startDate: '2023-10-01T00:00:00Z',
    endDate: '2023-12-31T23:59:59Z',
    createdAt: '2023-09-15T10:30:00Z',
    questionCount: 5,
    completedCount: 245,
    attemptedCount: 312,
    successRate: 78.5,
    averageCompletionTime: 38,
    thumbnail: '/thumbnails/python-challenge.jpg'
  },
  { 
    id: 2, 
    title: 'Math Problem Set', 
    description: 'Practice algebra and calculus problems',
    categoryId: 2,
    educationLevel: 4,
    difficultyLevel: 3,
    points: 150,
    timeLimitMinutes: 60,
    isActive: true,
    startDate: '2023-09-15T00:00:00Z',
    endDate: '2023-12-15T23:59:59Z',
    createdAt: '2023-09-01T14:45:00Z',
    questionCount: 8,
    completedCount: 187,
    attemptedCount: 253,
    successRate: 73.9,
    averageCompletionTime: 52,
    thumbnail: '/thumbnails/math-problems.jpg'
  },
  { 
    id: 3, 
    title: 'English Grammar Test', 
    description: 'Test your knowledge of English grammar rules',
    categoryId: 4,
    educationLevel: 2,
    difficultyLevel: 1,
    points: 80,
    timeLimitMinutes: 30,
    isActive: true,
    startDate: '2023-10-15T00:00:00Z',
    endDate: '2024-01-15T23:59:59Z',
    createdAt: '2023-10-01T09:20:00Z',
    questionCount: 10,
    completedCount: 412,
    attemptedCount: 480,
    successRate: 85.8,
    averageCompletionTime: 27,
    thumbnail: '/thumbnails/english-grammar.jpg'
  },
  { 
    id: 4, 
    title: 'Web Development Challenge', 
    description: 'Create responsive layouts with HTML and CSS',
    categoryId: 1,
    educationLevel: 3,
    difficultyLevel: 2,
    points: 120,
    timeLimitMinutes: 90,
    isActive: true,
    startDate: '2023-09-01T00:00:00Z',
    endDate: '2023-11-30T23:59:59Z',
    createdAt: '2023-08-15T15:30:00Z',
    questionCount: 6,
    completedCount: 156,
    attemptedCount: 245,
    successRate: 63.7,
    averageCompletionTime: 78,
    thumbnail: '/thumbnails/web-dev-challenge.jpg'
  },
  { 
    id: 5, 
    title: 'Business Strategy Quiz', 
    description: 'Test your understanding of business strategy concepts',
    categoryId: 5,
    educationLevel: 5,
    difficultyLevel: 4,
    points: 200,
    timeLimitMinutes: 45,
    isActive: false,
    startDate: '2023-11-01T00:00:00Z',
    endDate: '2024-02-28T23:59:59Z',
    createdAt: '2023-10-15T13:45:00Z',
    questionCount: 12,
    completedCount: 0,
    attemptedCount: 0,
    successRate: 0,
    averageCompletionTime: 0,
    thumbnail: '/thumbnails/business-strategy.jpg'
  },
  { 
    id: 6, 
    title: 'Physics Fundamentals', 
    description: 'Test your knowledge of physics principles',
    categoryId: 3,
    educationLevel: 3,
    difficultyLevel: 3,
    points: 160,
    timeLimitMinutes: 60,
    isActive: true,
    startDate: '2023-09-15T00:00:00Z',
    endDate: '2023-12-15T23:59:59Z',
    createdAt: '2023-09-01T10:10:00Z',
    questionCount: 8,
    completedCount: 124,
    attemptedCount: 198,
    successRate: 62.6,
    averageCompletionTime: 55,
    thumbnail: '/thumbnails/physics.jpg'
  },
  { 
    id: 7, 
    title: 'Music Theory Test', 
    description: 'Test your understanding of music theory',
    categoryId: 5,
    educationLevel: 2,
    difficultyLevel: 2,
    points: 100,
    timeLimitMinutes: 30,
    isActive: true,
    startDate: '2023-10-01T00:00:00Z',
    endDate: '2024-01-31T23:59:59Z',
    createdAt: '2023-09-15T16:20:00Z',
    questionCount: 10,
    completedCount: 86,
    attemptedCount: 110,
    successRate: 78.2,
    averageCompletionTime: 28,
    thumbnail: '/thumbnails/music-theory.jpg'
  }
];

// Mock questions
const mockQuestions = [
  {
    id: 1,
    questId: 1,
    questionText: 'What is the output of the following Python code?\n\n```python\ndef func(x):\n    if x <= 1:\n        return 1\n    return x * func(x-1)\n\nprint(func(4))\n```',
    difficultyLevel: 2,
    points: 20,
    explanation: 'This is a recursive function that calculates the factorial of a number. For input 4, it returns 4! = 4 × 3 × 2 × 1 = 24.',
    options: [
      { id: 1, optionText: '4', isCorrect: false, sequence: 1 },
      { id: 2, optionText: '8', isCorrect: false, sequence: 2 },
      { id: 3, optionText: '24', isCorrect: true, sequence: 3 },
      { id: 4, optionText: '64', isCorrect: false, sequence: 4 }
    ]
  },
  {
    id: 2,
    questId: 1,
    questionText: 'Which of the following is NOT a valid Python data type?',
    difficultyLevel: 1,
    points: 15,
    explanation: 'Python has built-in data types including int, float, str, list, tuple, dict, and set, but "array" is not a built-in data type (though it exists as a module).',
    options: [
      { id: 5, optionText: 'int', isCorrect: false, sequence: 1 },
      { id: 6, optionText: 'tuple', isCorrect: false, sequence: 2 },
      { id: 7, optionText: 'array', isCorrect: true, sequence: 3 },
      { id: 8, optionText: 'dict', isCorrect: false, sequence: 4 }
    ]
  },
  {
    id: 3,
    questId: 1,
    questionText: 'What is the time complexity of searching an element in a binary search tree in the worst case?',
    difficultyLevel: 3,
    points: 25,
    explanation: 'In the worst case (a skewed tree), the binary search tree becomes like a linked list, and the search operation takes O(n) time where n is the number of nodes.',
    options: [
      { id: 9, optionText: 'O(1)', isCorrect: false, sequence: 1 },
      { id: 10, optionText: 'O(log n)', isCorrect: false, sequence: 2 },
      { id: 11, optionText: 'O(n)', isCorrect: true, sequence: 3 },
      { id: 12, optionText: 'O(n²)', isCorrect: false, sequence: 4 }
    ]
  },
  {
    id: 4,
    questId: 2,
    questionText: 'Solve for x: 3x² + 6x - 9 = 0',
    difficultyLevel: 2,
    points: 20,
    explanation: 'Using the quadratic formula: x = (-6 ± √(36+108))/6 = (-6 ± √144)/6 = (-6 ± 12)/6 = 1 or -3',
    options: [
      { id: 13, optionText: 'x = 1 or x = -3', isCorrect: true, sequence: 1 },
      { id: 14, optionText: 'x = 2 or x = -1.5', isCorrect: false, sequence: 2 },
      { id: 15, optionText: 'x = 3 or x = -1', isCorrect: false, sequence: 3 },
      { id: 16, optionText: 'x = 0.5 or x = -6', isCorrect: false, sequence: 4 }
    ]
  },
  {
    id: 5,
    questId: 2,
    questionText: 'What is the derivative of f(x) = sin(x²)?',
    difficultyLevel: 3,
    points: 25,
    explanation: 'Using the chain rule: f\'(x) = (d/dx)[sin(x²)] = cos(x²) · (d/dx)[x²] = cos(x²) · 2x = 2x·cos(x²)',
    options: [
      { id: 17, optionText: 'cos(x²)', isCorrect: false, sequence: 1 },
      { id: 18, optionText: '2x·cos(x²)', isCorrect: true, sequence: 2 },
      { id: 19, optionText: '2·sin(x²)', isCorrect: false, sequence: 3 },
      { id: 20, optionText: 'x²·cos(x²)', isCorrect: false, sequence: 4 }
    ]
  }
];

// TabPanel component for detail drawer
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`quest-tabpanel-${index}`}
      aria-labelledby={`quest-tab-${index}`}
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

// Quest detail drawer
const QuestDetailDrawer = ({ open, quest, questions, onClose, onAddQuestion, onEditQuestion, onDeleteQuestion }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  if (!quest) return null;
  
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
  
  // Filter questions by quest ID
  const questQuestions = questions.filter(question => question.questId === quest.id);
  
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
          Quest Details
        </Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>
      
      {/* Quest header */}
      <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Box
              component="img"
              src={quest.thumbnail || '/thumbnails/default-quest.jpg'}
              alt={quest.title}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: 1
              }}
              onError={(e) => {
                e.target.src = '/thumbnails/default-quest.jpg';
              }}
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={getCategoryName(quest.categoryId)}
                color="primary"
                size="small"
              />
              <Chip
                label={quest.isActive ? 'Active' : 'Inactive'}
                color={quest.isActive ? 'success' : 'default'}
                size="small"
              />
              <Chip
                label={`${quest.points} points`}
                color="secondary"
                size="small"
              />
            </Box>
            <Typography variant="h5" component="h2" fontWeight="bold">
              {quest.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ my: 1 }}>
              {quest.description}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {quest.timeLimitMinutes} min
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <QuestionAnswerIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {quest.questionCount} questions
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ExtensionIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {getDifficultyLevelName(quest.difficultyLevel)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SchoolIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {getEducationLevelName(quest.educationLevel)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="quest tabs">
          <Tab label="Overview" id="quest-tab-0" aria-controls="quest-tabpanel-0" />
          <Tab label="Questions" id="quest-tab-1" aria-controls="quest-tabpanel-1" />
          <Tab label="Statistics" id="quest-tab-2" aria-controls="quest-tabpanel-2" />
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
                    Quest Info
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1">
                          {getCategoryName(quest.categoryId)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Education Level
                        </Typography>
                        <Typography variant="body1">
                          {getEducationLevelName(quest.educationLevel)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Difficulty
                        </Typography>
                        <Typography variant="body1">
                          {getDifficultyLevelName(quest.difficultyLevel)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Time Limit
                        </Typography>
                        <Typography variant="body1">
                          {quest.timeLimitMinutes} minutes
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Points
                        </Typography>
                        <Typography variant="body1">
                          {quest.points}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Typography variant="body1">
                          {quest.isActive ? 'Active' : 'Inactive'}
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
                    Dates & Progress
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Start Date
                        </Typography>
                        <Typography variant="body1">
                          {new Date(quest.startDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          End Date
                        </Typography>
                        <Typography variant="body1">
                          {new Date(quest.endDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body1">
                          {new Date(quest.createdAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Questions
                        </Typography>
                        <Typography variant="body1">
                          {quest.questionCount}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Attempts
                        </Typography>
                        <Typography variant="body1">
                          {quest.attemptedCount}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Completions
                        </Typography>
                        <Typography variant="body1">
                          {quest.completedCount}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Questions Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Quest Questions
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => onAddQuestion(quest.id)}
            >
              Add Question
            </Button>
          </Box>
          
          {questQuestions.length > 0 ? (
            <Box>
              {questQuestions.map((question, index) => (
                <Accordion key={question.id} defaultExpanded={index === 0}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`question-${question.id}-content`}
                    id={`question-${question.id}-header`}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.primary.main, 
                        color: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mr: 2
                      }}>
                        {index + 1}
                      </Box>
                      <Typography sx={{ flexGrow: 1 }}>
                        {question.questionText.length > 60 
                          ? `${question.questionText.substring(0, 60)}...` 
                          : question.questionText
                        }
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <Chip
                          size="small"
                          label={`${question.points} pts`}
                          color="primary"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          size="small"
                          label={getDifficultyLevelName(question.difficultyLevel)}
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {question.questionText}
                      </Typography>
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Answer Options:
                    </Typography>
                    <Box sx={{ ml: 2 }}>
                      {question.options.map((option) => (
                        <Box 
                          key={option.id} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: option.isCorrect 
                              ? alpha(theme.palette.success.light, 0.1) 
                              : 'transparent'
                          }}
                        >
                          <Box sx={{ 
                            minWidth: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            bgcolor: option.isCorrect 
                              ? theme.palette.success.main 
                              : alpha(theme.palette.grey[500], 0.2), 
                            color: option.isCorrect ? 'white' : 'text.primary', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mr: 2
                          }}>
                            {option.sequence}
                          </Box>
                          <Typography 
                            sx={{ 
                              flexGrow: 1,
                              fontWeight: option.isCorrect ? 'bold' : 'normal',
                              color: option.isCorrect ? 'success.main' : 'text.primary'
                            }}
                          >
                            {option.optionText}
                          </Typography>
                          {option.isCorrect && (
                            <CheckCircleIcon color="success" />
                          )}
                        </Box>
                      ))}
                    </Box>
                    
                    {question.explanation && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.light, 0.1), borderRadius: 1 }}>
                        <Typography variant="subtitle1" color="info.main" gutterBottom>
                          Explanation:
                        </Typography>
                        <Typography variant="body2">
                          {question.explanation}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<EditIcon />}
                        onClick={() => onEditQuestion(question)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        onClick={() => onDeleteQuestion(question)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No questions have been added to this quest yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddCircleIcon />}
                onClick={() => onAddQuestion(quest.id)}
                sx={{ mt: 2 }}
              >
                Add First Question
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
                    Attempts
                  </Typography>
                  <Typography variant="h3" align="center" sx={{ my: 2 }}>
                    {quest.attemptedCount.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Completions
                  </Typography>
                  <Typography variant="h3" align="center" sx={{ my: 2 }}>
                    {quest.completedCount.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Success Rate
                  </Typography>
                  <Box sx={{ position: 'relative', my: 2 }}>
                    <Typography 
                      variant="h3" 
                      align="center"
                      sx={{ position: 'relative', zIndex: 1 }}
                    >
                      {quest.successRate.toFixed(1)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={quest.successRate} 
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
                    Avg Completion Time
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
                    <Typography variant="h3">
                      {quest.averageCompletionTime}
                    </Typography>
                    <Typography variant="body1" sx={{ ml: 1, mt: 1 }}>
                      min
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Additional statistics could be added here */}
          </Grid>
        </TabPanel>
      </Box>
    </Drawer>
  );
};

export default function QuestsManagement() {
  const theme = useTheme();
  const [quests, setQuests] = useState(mockQuests);
  const [questions, setQuestions] = useState(mockQuestions);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [educationLevelFilter, setEducationLevelFilter] = useState('');
  const [difficultyLevelFilter, setDifficultyLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [deleteQuestionDialogOpen, setDeleteQuestionDialogOpen] = useState(false);
  const [questToEdit, setQuestToEdit] = useState(null);
  const [questToDelete, setQuestToDelete] = useState(null);
  const [questionToEdit, setQuestionToEdit] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [selectedQuestId, setSelectedQuestId] = useState(null);
  
  // Menu states
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [targetQuestId, setTargetQuestId] = useState(null);
  
  // Quest detail drawer
  const [questDetailOpen, setQuestDetailOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  
  // Form states for quest dialog
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    educationLevel: '',
    difficultyLevel: '',
    points: '',
    timeLimitMinutes: '',
    isActive: true,
    startDate: '',
    endDate: '',
    thumbnail: ''
  });
  
  // Form states for question dialog
  const [questionFormData, setQuestionFormData] = useState({
    questionText: '',
    difficultyLevel: '',
    points: '',
    explanation: '',
    options: [
      { optionText: '', isCorrect: false, sequence: 1 },
      { optionText: '', isCorrect: false, sequence: 2 },
      { optionText: '', isCorrect: false, sequence: 3 },
      { optionText: '', isCorrect: false, sequence: 4 }
    ]
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
  
  // Filter handlers
  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };
  
  const handleEducationLevelFilterChange = (event) => {
    setEducationLevelFilter(event.target.value);
    setPage(0);
  };
  
  const handleDifficultyLevelFilterChange = (event) => {
    setDifficultyLevelFilter(event.target.value);
    setPage(0);
  };
  
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  // Refresh quests
  const handleRefreshQuests = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  // Dialog handlers for quests
  const handleOpenAddDialog = () => {
    setFormData({
      title: '',
      description: '',
      categoryId: '',
      educationLevel: '',
      difficultyLevel: '',
      points: '',
      timeLimitMinutes: '',
      isActive: true,
      startDate: formatDate(new Date()),
      endDate: formatDate(new Date(Date.now() + 30*24*60*60*1000)), // 30 days from now
      thumbnail: ''
    });
    setAddDialogOpen(true);
  };
  
  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };
  
  const handleOpenEditDialog = (quest) => {
    setQuestToEdit(quest);
    setFormData({
      title: quest.title,
      description: quest.description,
      categoryId: quest.categoryId.toString(),
      educationLevel: quest.educationLevel.toString(),
      difficultyLevel: quest.difficultyLevel.toString(),
      points: quest.points.toString(),
      timeLimitMinutes: quest.timeLimitMinutes.toString(),
      isActive: quest.isActive,
      startDate: formatDate(new Date(quest.startDate)),
      endDate: formatDate(new Date(quest.endDate)),
      thumbnail: quest.thumbnail || ''
    });
    setEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setQuestToEdit(null);
  };
  
  const handleOpenDeleteDialog = (quest) => {
    setQuestToDelete(quest);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setQuestToDelete(null);
  };
  
  // Dialog handlers for questions
  const handleOpenQuestionDialog = (questId, question = null) => {
    setSelectedQuestId(questId);
    if (question) {
      setQuestionToEdit(question);
      setQuestionFormData({
        questionText: question.questionText,
        difficultyLevel: question.difficultyLevel.toString(),
        points: question.points.toString(),
        explanation: question.explanation || '',
        options: question.options.map(option => ({
          id: option.id,
          optionText: option.optionText,
          isCorrect: option.isCorrect,
          sequence: option.sequence
        }))
      });
    } else {
      setQuestionToEdit(null);
      setQuestionFormData({
        questionText: '',
        difficultyLevel: '2',
        points: '10',
        explanation: '',
        options: [
          { optionText: '', isCorrect: false, sequence: 1 },
          { optionText: '', isCorrect: false, sequence: 2 },
          { optionText: '', isCorrect: false, sequence: 3 },
          { optionText: '', isCorrect: false, sequence: 4 }
        ]
      });
    }
    setQuestionDialogOpen(true);
  };
  
  const handleCloseQuestionDialog = () => {
    setQuestionDialogOpen(false);
    setQuestionToEdit(null);
    setSelectedQuestId(null);
  };
  
  const handleOpenDeleteQuestionDialog = (question) => {
    setQuestionToDelete(question);
    setDeleteQuestionDialogOpen(true);
  };
  
  const handleCloseDeleteQuestionDialog = () => {
    setDeleteQuestionDialogOpen(false);
    setQuestionToDelete(null);
  };
  
  // Menu handlers
  const handleOpenMenu = (event, questId) => {
    setMenuAnchorEl(event.currentTarget);
    setTargetQuestId(questId);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setTargetQuestId(null);
  };
  
  // Quest detail drawer handlers
  const handleOpenQuestDetail = (quest) => {
    setSelectedQuest(quest);
    setQuestDetailOpen(true);
  };
  
  const handleCloseQuestDetail = () => {
    setQuestDetailOpen(false);
    setSelectedQuest(null);
  };
  
  // Form data change handler for quest
  const handleFormChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'isActive' ? checked : value
    }));
  };
  
  // Form data change handler for question
  const handleQuestionFormChange = (event) => {
    const { name, value } = event.target;
    setQuestionFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Options change handler
  const handleOptionChange = (index, field, value) => {
    setQuestionFormData(prevData => {
      const updatedOptions = [...prevData.options];
      updatedOptions[index] = {
        ...updatedOptions[index],
        [field]: value
      };
      
      // If making this option correct, make others incorrect
      if (field === 'isCorrect' && value === true) {
        updatedOptions.forEach((option, i) => {
          if (i !== index) {
            updatedOptions[i] = { ...updatedOptions[i], isCorrect: false };
          }
        });
      }
      
      return {
        ...prevData,
        options: updatedOptions
      };
    });
  };
  
  // Helper to format date for input
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Save quest
  const handleSaveQuest = () => {
    if (addDialogOpen) {
      // Add new quest
      const newQuest = {
        id: Math.max(...quests.map(q => q.id)) + 1,
        title: formData.title,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        educationLevel: parseInt(formData.educationLevel),
        difficultyLevel: parseInt(formData.difficultyLevel),
        points: parseInt(formData.points),
        timeLimitMinutes: parseInt(formData.timeLimitMinutes),
        isActive: formData.isActive,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        thumbnail: formData.thumbnail,
        createdAt: new Date().toISOString(),
        questionCount: 0,
        completedCount: 0,
        attemptedCount: 0,
        successRate: 0,
        averageCompletionTime: 0
      };
      setQuests([...quests, newQuest]);
      handleCloseAddDialog();
    } else if (editDialogOpen && questToEdit) {
      // Update existing quest
      const updatedQuests = quests.map(quest => 
        quest.id === questToEdit.id 
          ? {
              ...quest,
              title: formData.title,
              description: formData.description,
              categoryId: parseInt(formData.categoryId),
              educationLevel: parseInt(formData.educationLevel),
              difficultyLevel: parseInt(formData.difficultyLevel),
              points: parseInt(formData.points),
              timeLimitMinutes: parseInt(formData.timeLimitMinutes),
              isActive: formData.isActive,
              startDate: new Date(formData.startDate).toISOString(),
              endDate: new Date(formData.endDate).toISOString(),
              thumbnail: formData.thumbnail
            }
          : quest
      );
      setQuests(updatedQuests);
      handleCloseEditDialog();
    }
  };
  
  // Delete quest
  const handleDeleteQuest = () => {
    if (questToDelete) {
      const filteredQuests = quests.filter(
        quest => quest.id !== questToDelete.id
      );
      setQuests(filteredQuests);
      
      // Also delete all questions for this quest
      const filteredQuestions = questions.filter(
        question => question.questId !== questToDelete.id
      );
      setQuestions(filteredQuestions);
      
      handleCloseDeleteDialog();
    }
  };
  
  // Save question
  const handleSaveQuestion = () => {
    if (questionToEdit) {
      // Update existing question
      const updatedQuestions = questions.map(question => 
        question.id === questionToEdit.id 
          ? {
              ...question,
              questionText: questionFormData.questionText,
              difficultyLevel: parseInt(questionFormData.difficultyLevel),
              points: parseInt(questionFormData.points),
              explanation: questionFormData.explanation,
              options: questionFormData.options.map((option, index) => ({
                id: option.id || questionToEdit.options[index].id,
                optionText: option.optionText,
                isCorrect: option.isCorrect,
                sequence: option.sequence
              }))
            }
          : question
      );
      setQuestions(updatedQuestions);
    } else {
      // Add new question
      const newQuestion = {
        id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1,
        questId: selectedQuestId,
        questionText: questionFormData.questionText,
        difficultyLevel: parseInt(questionFormData.difficultyLevel),
        points: parseInt(questionFormData.points),
        explanation: questionFormData.explanation,
        options: questionFormData.options.map((option, index) => ({
          id: Math.max(...questions.flatMap(q => q.options).map(o => o.id)) + index + 1,
          optionText: option.optionText,
          isCorrect: option.isCorrect,
          sequence: option.sequence
        }))
      };
      setQuestions([...questions, newQuestion]);
      
      // Update question count on the quest
      const updatedQuests = quests.map(quest => 
        quest.id === selectedQuestId 
          ? { ...quest, questionCount: quest.questionCount + 1 }
          : quest
      );
      setQuests(updatedQuests);
    }
    handleCloseQuestionDialog();
  };
  
  // Delete question
  const handleDeleteQuestion = () => {
    if (questionToDelete) {
      const filteredQuestions = questions.filter(
        question => question.id !== questionToDelete.id
      );
      setQuestions(filteredQuestions);
      
      // Update question count on the quest
      const updatedQuests = quests.map(quest => 
        quest.id === questionToDelete.questId 
          ? { ...quest, questionCount: quest.questionCount - 1 }
          : quest
      );
      setQuests(updatedQuests);
      
      handleCloseDeleteQuestionDialog();
    }
  };
  
  // Toggle quest active status
  const handleToggleActive = (questId) => {
    const updatedQuests = quests.map(quest => 
      quest.id === questId 
        ? { ...quest, isActive: !quest.isActive } 
        : quest
    );
    setQuests(updatedQuests);
    handleCloseMenu();
  };
  
  // View mode toggle
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  // Filter and sort quests
  const filteredQuests = quests.filter(quest => {
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || quest.categoryId === parseInt(categoryFilter);
    const matchesEducationLevel = educationLevelFilter === '' || quest.educationLevel === parseInt(educationLevelFilter);
    const matchesDifficultyLevel = difficultyLevelFilter === '' || quest.difficultyLevel === parseInt(difficultyLevelFilter);
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && quest.isActive) || 
                         (statusFilter === 'inactive' && !quest.isActive);
    
    return matchesSearch && matchesCategory && matchesEducationLevel && matchesDifficultyLevel && matchesStatus;
  });
  
  // Paginated quests
  const paginatedQuests = filteredQuests.slice(
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
          Quests Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            New Quest
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshQuests}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Filters and Search */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search Quests"
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
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficultyLevelFilter}
              label="Difficulty"
              onChange={handleDifficultyLevelFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              {difficultyLevels.map((level) => (
                <MenuItem key={level.value} value={level.value.toString()}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
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
                <QuestIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Total: {filteredQuests.length} quests
          </Typography>
        </Box>
      </Paper>
      
      {/* Quests List View */}
      {viewMode === 'list' && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="quests table">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Education</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell align="center">Questions</TableCell>
                  <TableCell align="center">Time Limit</TableCell>
                  <TableCell align="center">Points</TableCell>
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
                ) : paginatedQuests.length > 0 ? (
                  paginatedQuests.map((quest) => (
                    <TableRow 
                      key={quest.id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor: !quest.isActive ? alpha(theme.palette.action.disabledBackground, 0.3) : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={quest.thumbnail}
                            alt={quest.title}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          >
                            <QuestIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {quest.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(quest.endDate) < new Date() ? 'Ended' : 'Ends'}: {new Date(quest.endDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{getCategoryName(quest.categoryId)}</TableCell>
                      <TableCell>{getEducationLevelName(quest.educationLevel)}</TableCell>
                      <TableCell>{getDifficultyLevelName(quest.difficultyLevel)}</TableCell>
                      <TableCell align="center">{quest.questionCount}</TableCell>
                      <TableCell align="center">{quest.timeLimitMinutes} min</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={quest.points} 
                          color="primary" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={quest.isActive ? 'Active' : 'Inactive'} 
                          color={quest.isActive ? 'success' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenQuestDetail(quest)}
                          sx={{ mr: 0.5 }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, quest.id)}
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
                        No quests found.
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
            count={filteredQuests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows per page:"
          />
        </Paper>
      )}
      
      {/* Quests Grid View */}
      {viewMode === 'grid' && (
        <Box>
          <Grid container spacing={3}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : paginatedQuests.length > 0 ? (
              paginatedQuests.map((quest) => (
                <Grid item key={quest.id} xs={12} sm={6} md={4} lg={3}>
                  <Card 
                    elevation={1}
                    sx={{ 
                      height: '100%', 
                      opacity: quest.isActive ? 1 : 0.7,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {!quest.isActive && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          zIndex: 1,
                        }}
                      >
                        <Chip 
                          label="Inactive" 
                          size="small" 
                          color="default" 
                        />
                      </Box>
                    )}
                    <CardActionArea 
                      sx={{ flexGrow: 1 }}
                      onClick={() => handleOpenQuestDetail(quest)}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={quest.thumbnail || '/thumbnails/default-quest.jpg'}
                        alt={quest.title}
                        onError={(e) => {
                          e.target.src = '/thumbnails/default-quest.jpg';
                        }}
                      />
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" component="div" gutterBottom>
                            {quest.title}
                          </Typography>
                          <Chip 
                            label={`${quest.points} pts`}
                            size="small" 
                            color="primary" 
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {quest.description.length > 80 
                            ? `${quest.description.substring(0, 80)}...` 
                            : quest.description
                          }
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Chip 
                            label={getCategoryName(quest.categoryId)} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {quest.timeLimitMinutes} min
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <QuestionAnswerIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {quest.questionCount} questions
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenEditDialog(quest)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          color={quest.isActive ? 'default' : 'success'}
                          onClick={() => handleToggleActive(quest.id)}
                        >
                          {quest.isActive ? (
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
                  No quests found.
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination
              rowsPerPageOptions={[8, 16, 32]}
              component="div"
              count={filteredQuests.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Items per page:"
            />
          </Box>
        </Box>
      )}
      
      {/* Add/Edit Quest Dialog */}
      <Dialog 
        open={addDialogOpen || editDialogOpen} 
        onClose={addDialogOpen ? handleCloseAddDialog : handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{addDialogOpen ? 'Add New Quest' : 'Edit Quest'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                label="Quest Title"
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
                id="timeLimitMinutes"
                label="Time Limit (minutes)"
                name="timeLimitMinutes"
                value={formData.timeLimitMinutes}
                onChange={handleFormChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="thumbnail"
                label="Thumbnail URL"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleFormChange}
                placeholder="/thumbnails/quest.jpg"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="startDate"
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleFormChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="endDate"
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleFormChange}
                InputLabelProps={{
                  shrink: true,
                }}
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
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      name="isActive"
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={addDialogOpen ? handleCloseAddDialog : handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveQuest} 
            variant="contained" 
            disabled={!formData.title || !formData.categoryId || !formData.educationLevel || !formData.difficultyLevel || !formData.points || !formData.timeLimitMinutes}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Quest Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Quest</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {questToDelete && (
              <>
                Are you sure you want to delete the quest <strong>{questToDelete.title}</strong>?
                <Box component="div" sx={{ mt: 2 }}>
                  This will also delete all questions associated with this quest.
                </Box>
                {questToDelete.attemptedCount > 0 && (
                  <Box component="div" sx={{ mt: 2, color: theme.palette.error.main }}>
                    Warning: This quest has been attempted by {questToDelete.attemptedCount} users.
                  </Box>
                )}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteQuest} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add/Edit Question Dialog */}
      <Dialog 
        open={questionDialogOpen} 
        onClose={handleCloseQuestionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{questionToEdit ? 'Edit Question' : 'Add New Question'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="questionText"
                label="Question Text"
                name="questionText"
                value={questionFormData.questionText}
                onChange={handleQuestionFormChange}
                multiline
                rows={4}
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  required
                  name="difficultyLevel"
                  value={questionFormData.difficultyLevel}
                  label="Difficulty Level"
                  onChange={handleQuestionFormChange}
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
                id="points"
                label="Points"
                name="points"
                value={questionFormData.points}
                onChange={handleQuestionFormChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Answer Options
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Please select one correct answer and provide text for all options.
              </Typography>
              
              {questionFormData.options.map((option, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    bgcolor: option.isCorrect 
                      ? alpha(theme.palette.success.light, 0.1) 
                      : 'transparent',
                    border: '1px solid',
                    borderColor: option.isCorrect 
                      ? theme.palette.success.main 
                      : theme.palette.divider
                  }}
                >
                  <FormControlLabel
                    control={
                      <Radio
                        checked={option.isCorrect}
                        onChange={() => handleOptionChange(index, 'isCorrect', true)}
                        color="success"
                      />
                    }
                    label={`Option ${index + 1}`}
                    sx={{ minWidth: 120 }}
                  />
                  <TextField
                    required
                    fullWidth
                    value={option.optionText}
                    onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                    placeholder={`Enter option ${index + 1} text`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              ))}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="explanation"
                label="Explanation (Optional)"
                name="explanation"
                value={questionFormData.explanation}
                onChange={handleQuestionFormChange}
                multiline
                rows={3}
                placeholder="Provide an explanation of the correct answer that will be shown after the user answers the question."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQuestionDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveQuestion} 
            variant="contained" 
            disabled={
              !questionFormData.questionText || 
              !questionFormData.points || 
              !questionFormData.options.some(o => o.isCorrect) ||
              questionFormData.options.some(o => !o.optionText)
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Question Dialog */}
      <Dialog
        open={deleteQuestionDialogOpen}
        onClose={handleCloseDeleteQuestionDialog}
      >
        <DialogTitle>Delete Question</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {questionToDelete && (
              <>
                Are you sure you want to delete this question?
                <Box component="div" sx={{ mt: 2, fontStyle: 'italic' }}>
                  "{questionToDelete.questionText.length > 100 
                    ? `${questionToDelete.questionText.substring(0, 100)}...` 
                    : questionToDelete.questionText}"
                </Box>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteQuestionDialog}>Cancel</Button>
          <Button onClick={handleDeleteQuestion} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Quest Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          const quest = quests.find(q => q.id === targetQuestId);
          handleOpenQuestDetail(quest);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const quest = quests.find(q => q.id === targetQuestId);
          handleOpenEditDialog(quest);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleToggleActive(targetQuestId);
        }}>
          <ListItemIcon>
            {quests.find(q => q.id === targetQuestId)?.isActive ? (
              <CloseIcon fontSize="small" />
            ) : (
              <CheckCircleIcon fontSize="small" color="success" />
            )}
          </ListItemIcon>
          <ListItemText>
            {quests.find(q => q.id === targetQuestId)?.isActive ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          const quest = quests.find(q => q.id === targetQuestId);
          handleOpenDeleteDialog(quest);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: theme.palette.error.main }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Quest Detail Drawer */}
      <QuestDetailDrawer
        open={questDetailOpen}
        quest={selectedQuest}
        questions={questions}
        onClose={handleCloseQuestDetail}
        onAddQuestion={(questId) => {
          handleOpenQuestionDialog(questId);
          handleCloseQuestDetail();
        }}
        onEditQuestion={(question) => {
          handleOpenQuestionDialog(question.questId, question);
          handleCloseQuestDetail();
        }}
        onDeleteQuestion={(question) => {
          handleOpenDeleteQuestionDialog(question);
          handleCloseQuestDetail();
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

