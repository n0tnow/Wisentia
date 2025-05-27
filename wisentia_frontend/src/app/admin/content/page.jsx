// src/app/admin/content/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

// MUI components
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';

// MUI icons
import {
  School as CourseIcon,
  Assignment as QuestIcon,
  TokenOutlined as NFTIcon,
  Forum as ForumIcon,
  Quiz as QuizIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as ActivateIcon,
  Cancel as DeactivateIcon,
  Refresh as RefreshIcon,
  Comment as CommentIcon,
  ThumbUp as LikeIcon,
  Flag as ReportIcon,
  Person as PersonIcon
} from '@mui/icons-material';

export default function ContentManagementPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const contentTypeParam = searchParams.get('type');
  
  const [contentType, setContentType] = useState(contentTypeParam || 'courses');
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0); // MUI uses 0-based page index
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Set content type from URL if available
    if (contentTypeParam && ['courses', 'quizzes', 'quests', 'nfts', 'community'].includes(contentTypeParam)) {
      setContentType(contentTypeParam);
    }
  }, [contentTypeParam]);

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchContent = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          type: contentType,
          page: page + 1, // Backend uses 1-based page index
          pageSize,
        });

        const response = await fetch(`/api/admin/content?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }

        const data = await response.json();
        setItems(data.items || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchContent();
    }
  }, [user, router, contentType, page, pageSize]);

  const handleTabChange = (event, newValue) => {
    setContentType(newValue);
    setPage(0);
    
    // Update URL to reflect selected tab
    router.push(`/admin/content?type=${newValue}`);
  };

  const handleCreateCourse = () => {
    router.push('/admin/courses/create');
  };

  const handleCreateQuiz = () => {
    router.push('/admin/content/quizzes/create');
  };

  const handleCreateQuest = () => {
    router.push('/admin/quests/create');
  };

  const handleCreateNFT = () => {
    router.push('/admin/nfts/create');
  };
  
  const handleCreateCommunityPost = () => {
    router.push('/admin/community/create');
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      let endpoint = '';
      switch (contentType) {
        case 'courses':
          endpoint = `/api/courses/${id}`;
          break;
        case 'quizzes':
          endpoint = `/api/admin/quizzes/${id}`;
          break;
        case 'quests':
          endpoint = `/api/quests/${id}`;
          break;
        case 'nfts':
          endpoint = `/api/nfts/${id}`;
          break;
        case 'community':
          endpoint = `/api/community/${id}`;
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      // İçerik listesini güncelle
      setItems(items.map(item => {
        if (
          (contentType === 'courses' && item.CourseID === id) ||
          (contentType === 'quizzes' && item.QuizID === id) ||
          (contentType === 'quests' && item.QuestID === id) ||
          (contentType === 'nfts' && item.NFTID === id) ||
          (contentType === 'community' && item.PostID === id)
        ) {
          return { ...item, IsActive: !isActive };
        }
        return item;
      }));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleViewItem = (id) => {
    switch (contentType) {
      case 'courses':
        router.push(`/courses/${id}`);
        break;
      case 'quizzes':
        router.push(`/admin/content/quizzes/view/${id}`);
        break;
      case 'quests':
        router.push(`/quests/${id}`);
        break;
      case 'nfts':
        router.push(`/nfts/${id}`);
        break;
      case 'community':
        router.push(`/community/${id}`);
        break;
      default:
        break;
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Render loading state
  if (loading && items.length === 0) {
    return (
      <MainLayout>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh',
            width: '100%',
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading content...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  // Render error state
  if (error) {
    return (
      <MainLayout>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
          <Alert 
            severity="error" 
            variant="filled"
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => {
                  setError(null);
                  setPage(0);
                  setLoading(true);
                }}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
        {/* Page Header */}
        <Box sx={{ 
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}>
          <Fade in={true} timeout={800}>
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                fontWeight="700"
                sx={{ 
                  mb: 1,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Content Management
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage platform courses, quests, NFTs and community content
              </Typography>
            </Box>
          </Fade>
          <Box>
            {contentType === 'courses' && (
              <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateCourse}
                  sx={{ 
                    px: 3,
                    py: 1.2,
                    borderRadius: 2,
                    boxShadow: 3,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Create Course
                </Button>
              </Zoom>
            )}
            {contentType === 'quizzes' && (
              <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<AddIcon />}
                  onClick={handleCreateQuiz}
                  sx={{ 
                    px: 3,
                    py: 1.2,
                    borderRadius: 2,
                    boxShadow: 3,
                    background: `linear-gradient(45deg, ${theme.palette.warning.main} 30%, ${theme.palette.warning.dark} 90%)`,
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Create Quiz
                </Button>
              </Zoom>
            )}
            {contentType === 'quests' && (
              <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateQuest}
                  sx={{ 
                    px: 3,
                    py: 1.2,
                    borderRadius: 2,
                    boxShadow: 3,
                    background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.dark} 90%)`,
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Create Quest
                </Button>
              </Zoom>
            )}
            {contentType === 'nfts' && (
              <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNFT}
                  sx={{ 
                    px: 3,
                    py: 1.2,
                    borderRadius: 2,
                    boxShadow: 3,
                    background: `linear-gradient(45deg, ${theme.palette.info.main} 30%, ${theme.palette.info.dark} 90%)`,
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Create NFT
                </Button>
              </Zoom>
            )}
            {contentType === 'community' && (
              <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={handleCreateCommunityPost}
                  sx={{ 
                    px: 3,
                    py: 1.2,
                    borderRadius: 2,
                    boxShadow: 3,
                    background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Create Post
                </Button>
              </Zoom>
            )}
          </Box>
        </Box>

        {/* Content Type Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={contentType}
            onChange={handleTabChange}
            aria-label="content type tabs"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minWidth: 100,
                fontWeight: 'medium',
                textTransform: 'none',
                fontSize: '1rem'
              }
            }}
          >
            <Tab 
              icon={<CourseIcon />} 
              iconPosition="start" 
              label="Courses" 
              value="courses" 
              sx={{ borderRadius: '8px 8px 0 0' }}
            />
            <Tab 
              icon={<QuizIcon />} 
              iconPosition="start" 
              label="Quizzes" 
              value="quizzes" 
              sx={{ borderRadius: '8px 8px 0 0' }}
            />
            <Tab 
              icon={<QuestIcon />} 
              iconPosition="start" 
              label="Quests" 
              value="quests" 
              sx={{ borderRadius: '8px 8px 0 0' }}
            />
            <Tab 
              icon={<NFTIcon />} 
              iconPosition="start" 
              label="NFTs" 
              value="nfts" 
              sx={{ borderRadius: '8px 8px 0 0' }}
            />
            <Tab 
              icon={<ForumIcon />} 
              iconPosition="start" 
              label="Community" 
              value="community" 
              sx={{ borderRadius: '8px 8px 0 0' }}
            />
          </Tabs>
        </Box>

        {/* Content Tables */}
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          {/* Courses Table */}
          {contentType === 'courses' && (
            <Fade in={true} timeout={500}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Difficulty</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Enrolled</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length > 0 ? (
                      items.map((course) => (
                        <TableRow 
                          key={course.CourseID}
                          hover
                          sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                src={course.ThumbnailURL} 
                                variant="rounded"
                                alt={course.Title}
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  mr: 2,
                                  bgcolor: course.ThumbnailURL ? undefined : theme.palette.primary.main
                                }}
                              >
                                {!course.ThumbnailURL && course.Title ? course.Title[0] : 'C'}
                              </Avatar>
                              <Typography 
                                variant="body1" 
                                fontWeight="medium"
                                sx={{ '&:hover': { color: theme.palette.primary.main }, cursor: 'pointer' }}
                                onClick={() => handleViewItem(course.CourseID)}
                              >
                                {course.Title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{course.Category}</TableCell>
                          <TableCell>
                            <Chip 
                              label={course.Difficulty} 
                              size="small"
                              color={
                                course.Difficulty === 'Beginner' ? 'success' :
                                course.Difficulty === 'Intermediate' ? 'warning' :
                                'error'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(course.CreationDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={course.IsActive ? 'Active' : 'Inactive'} 
                              color={course.IsActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={course.EnrolledUsers || 0} 
                              variant="outlined" 
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewItem(course.CourseID)}
                                sx={{ mr: 1 }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={course.IsActive ? "Deactivate" : "Activate"}>
                              <IconButton 
                                size="small"
                                color={course.IsActive ? "error" : "success"}
                                onClick={() => handleToggleActive(course.CourseID, course.IsActive)}
                              >
                                {course.IsActive ? <DeactivateIcon /> : <ActivateIcon />}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="h6" color="text.secondary">
                            No courses found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Start by creating a new course
                          </Typography>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleCreateCourse}
                            sx={{ mt: 2 }}
                          >
                            Create Course
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Fade>
          )}

          {/* Quizzes Table */}
          {contentType === 'quizzes' && (
            <Fade in={true} timeout={500}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Course</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Questions</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Passing Score</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Attempts</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length > 0 ? (
                      items.map((quiz) => (
                        <TableRow 
                          key={quiz.QuizID}
                          hover
                          sx={{ '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.05) } }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  mr: 2,
                                  bgcolor: theme.palette.warning.main
                                }}
                              >
                                <QuizIcon />
                              </Avatar>
                              <Typography 
                                variant="body1" 
                                fontWeight="medium"
                                sx={{ '&:hover': { color: theme.palette.warning.main }, cursor: 'pointer' }}
                                onClick={() => handleViewItem(quiz.QuizID)}
                              >
                                {quiz.Title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {quiz.CourseTitle || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={quiz.QuestionCount || 0} 
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {quiz.PassingScore}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(quiz.CreationDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={quiz.IsActive ? 'Active' : 'Inactive'} 
                              color={quiz.IsActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={quiz.AttemptCount || 0} 
                              variant="outlined" 
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="warning"
                                onClick={() => handleViewItem(quiz.QuizID)}
                                sx={{ mr: 1 }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={quiz.IsActive ? "Deactivate" : "Activate"}>
                              <IconButton 
                                size="small"
                                color={quiz.IsActive ? "error" : "success"}
                                onClick={() => handleToggleActive(quiz.QuizID, quiz.IsActive)}
                              >
                                {quiz.IsActive ? <DeactivateIcon /> : <ActivateIcon />}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Typography variant="h6" color="text.secondary">
                            No quizzes found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Start by creating a new quiz
                          </Typography>
                          <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<AddIcon />}
                            onClick={handleCreateQuiz}
                            sx={{ mt: 2 }}
                          >
                            Create Quiz
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Fade>
          )}

          {/* Quests Table */}
          {contentType === 'quests' && (
            <Fade in={true} timeout={500}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Difficulty</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Points</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>AI Generated</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length > 0 ? (
                      items.map((quest) => (
                        <TableRow 
                          key={quest.QuestID}
                          hover
                          sx={{ '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05) } }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  mr: 2,
                                  bgcolor: quest.IsAIGenerated ? theme.palette.info.light : theme.palette.secondary.main
                                }}
                              >
                                {quest.Title ? quest.Title[0] : 'Q'}
                              </Avatar>
                              <Typography 
                                variant="body1" 
                                fontWeight="medium"
                                sx={{ '&:hover': { color: theme.palette.secondary.main }, cursor: 'pointer' }}
                                onClick={() => handleViewItem(quest.QuestID)}
                              >
                                {quest.Title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={quest.DifficultyLevel} 
                              size="small"
                              color={
                                quest.DifficultyLevel === 'beginner' ? 'success' :
                                quest.DifficultyLevel === 'intermediate' ? 'warning' :
                                'error'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                Required:
                              </Typography>
                              <Chip 
                                label={quest.RequiredPoints} 
                                size="small" 
                                variant="outlined" 
                                color="primary"
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                                Reward:
                              </Typography>
                              <Chip 
                                label={quest.RewardPoints} 
                                size="small" 
                                color="primary"
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            {new Date(quest.CreationDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={quest.IsActive ? 'Active' : 'Inactive'} 
                              color={quest.IsActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={quest.IsAIGenerated ? 'AI' : 'Manual'} 
                              color={quest.IsAIGenerated ? 'info' : 'default'}
                              size="small"
                              variant={quest.IsAIGenerated ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="secondary"
                                onClick={() => handleViewItem(quest.QuestID)}
                                sx={{ mr: 1 }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={quest.IsActive ? "Deactivate" : "Activate"}>
                              <IconButton 
                                size="small"
                                color={quest.IsActive ? "error" : "success"}
                                onClick={() => handleToggleActive(quest.QuestID, quest.IsActive)}
                              >
                                {quest.IsActive ? <DeactivateIcon /> : <ActivateIcon />}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="h6" color="text.secondary">
                            No quests found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Start by creating a new quest
                          </Typography>
                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<AddIcon />}
                            onClick={handleCreateQuest}
                            sx={{ mt: 2 }}
                          >
                            Create Quest
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Fade>
          )}

          {/* NFTs Table */}
          {contentType === 'nfts' && (
            <Fade in={true} timeout={500}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Subscription</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Owned</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length > 0 ? (
                      items.map((nft) => (
                        <TableRow 
                          key={nft.NFTID}
                          hover
                          sx={{ '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.05) } }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  mr: 2,
                                  bgcolor: theme.palette.info.main,
                                  background: 'linear-gradient(135deg, #4527a0 0%, #7b1fa2 100%)',
                                }}
                              >
                                <NFTIcon />
                              </Avatar>
                              <Typography 
                                variant="body1" 
                                fontWeight="medium"
                                sx={{ '&:hover': { color: theme.palette.info.main }, cursor: 'pointer' }}
                                onClick={() => handleViewItem(nft.NFTID)}
                              >
                                {nft.Title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={nft.NFTType} 
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {nft.TradeValue} WEDU
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {nft.SubscriptionDays ? (
                              <Chip 
                                label={`${nft.SubscriptionDays} days`} 
                                size="small"
                                color="success"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                N/A
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={nft.IsActive ? 'Active' : 'Inactive'} 
                              color={nft.IsActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={nft.OwnedCount || 0} 
                              variant="outlined" 
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="info"
                                onClick={() => handleViewItem(nft.NFTID)}
                                sx={{ mr: 1 }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={nft.IsActive ? "Deactivate" : "Activate"}>
                              <IconButton 
                                size="small"
                                color={nft.IsActive ? "error" : "success"}
                                onClick={() => handleToggleActive(nft.NFTID, nft.IsActive)}
                              >
                                {nft.IsActive ? <DeactivateIcon /> : <ActivateIcon />}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="h6" color="text.secondary">
                            No NFTs found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Start by creating a new NFT
                          </Typography>
                          <Button
                            variant="outlined"
                            color="info"
                            startIcon={<AddIcon />}
                            onClick={handleCreateNFT}
                            sx={{ mt: 2 }}
                          >
                            Create NFT
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Fade>
          )}
          
          {/* Community Content Table */}
          {contentType === 'community' && (
            <Fade in={true} timeout={500}>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Engagement</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length > 0 ? (
                      items.map((post) => (
                        <TableRow 
                          key={post.PostID}
                          hover
                          sx={{ '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.05) } }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 40, 
                                  height: 40, 
                                  mr: 2,
                                  bgcolor: theme.palette.success.light,
                                }}
                              >
                                <ForumIcon />
                              </Avatar>
                              <Typography 
                                variant="body1" 
                                fontWeight="medium"
                                sx={{ '&:hover': { color: theme.palette.success.main }, cursor: 'pointer' }}
                                onClick={() => handleViewItem(post.PostID)}
                              >
                                {post.Title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  mr: 1,
                                  fontSize: '0.8rem'
                                }}
                              >
                                {post.Username ? post.Username[0] : 'U'}
                              </Avatar>
                              <Typography variant="body2">
                                {post.Username}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={post.Category} 
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(post.CreationDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={post.IsActive ? 'Active' : 'Inactive'} 
                              color={post.IsActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip 
                                icon={<CommentIcon fontSize="small" />}
                                label={post.CommentCount || 0} 
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                              <Chip 
                                icon={<LikeIcon fontSize="small" />}
                                label={post.LikeCount || 0} 
                                size="small"
                                variant="outlined"
                                color="info"
                              />
                              {post.ReportCount > 0 && (
                                <Chip 
                                  icon={<ReportIcon fontSize="small" />}
                                  label={post.ReportCount} 
                                  size="small"
                                  color="error"
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => handleViewItem(post.PostID)}
                                sx={{ mr: 1 }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={post.IsActive ? "Deactivate" : "Activate"}>
                              <IconButton 
                                size="small"
                                color={post.IsActive ? "error" : "success"}
                                onClick={() => handleToggleActive(post.PostID, post.IsActive)}
                              >
                                {post.IsActive ? <DeactivateIcon /> : <ActivateIcon />}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="h6" color="text.secondary">
                            No community posts found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Start by creating a new community post
                          </Typography>
                          <Button
                            variant="outlined"
                            color="success"
                            startIcon={<AddIcon />}
                            onClick={handleCreateCommunityPost}
                            sx={{ mt: 2 }}
                          >
                            Create Post
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Fade>
          )}

          {/* Pagination */}
          {items.length > 0 && (
            <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={pageSize}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 20, 50]}
              />
            </Box>
          )}
        </Paper>

        {/* Summary Cards (Optional) */}
        {items.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[10]
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mr: 2
                      }}
                    >
                      {contentType === 'courses' ? <CourseIcon /> : 
                       contentType === 'quests' ? <QuestIcon /> : 
                       contentType === 'nfts' ? <NFTIcon /> :
                       <ForumIcon />}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Total {contentType === 'courses' ? 'Courses' : 
                             contentType === 'quests' ? 'Quests' : 
                             contentType === 'nfts' ? 'NFTs' :
                             'Community Posts'}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {totalCount}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {contentType === 'courses' ? 'Manage course content, videos, and quizzes' : 
                     contentType === 'quests' ? 'Create challenges and rewards for users' : 
                     contentType === 'nfts' ? 'Manage digital assets and subscription tokens' :
                     'Manage forum posts, discussions and community engagement'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[10]
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        mr: 2
                      }}
                    >
                      <ActivateIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Active {contentType === 'courses' ? 'Courses' : 
                             contentType === 'quests' ? 'Quests' : 
                             contentType === 'nfts' ? 'NFTs' :
                             'Community Posts'}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {items.filter(item => item.IsActive).length}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {contentType === 'courses' ? 'Available courses that users can enroll in' : 
                     contentType === 'quests' ? 'Active quests that users can participate in' : 
                     contentType === 'nfts' ? 'NFTs currently available for acquisition' :
                     'Community content currently visible to users'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[10]
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.main,
                        mr: 2
                      }}
                    >
                      <DeactivateIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      Inactive {contentType === 'courses' ? 'Courses' : 
                               contentType === 'quests' ? 'Quests' : 
                               contentType === 'nfts' ? 'NFTs' :
                               'Community Posts'}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {items.filter(item => !item.IsActive).length}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {contentType === 'courses' ? 'Courses that are currently unavailable to users' : 
                     contentType === 'quests' ? 'Quests that are not active or have ended' : 
                     contentType === 'nfts' ? 'NFTs that are not currently available for acquisition' :
                     'Community posts that have been hidden or deactivated'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </MainLayout>
  );
}