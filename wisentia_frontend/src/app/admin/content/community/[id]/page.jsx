// src/app/admin/content/community/[id]/page.jsx
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
  Button,
  Chip,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Fade,
  useTheme,
  alpha,
  Tooltip,
  useMediaQuery,
  Stack,
  Grid,
  Divider,
  Container,
  Breadcrumbs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Collapse,
  CardContent
} from '@mui/material';

// MUI icons
import {
  Forum as ForumIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as ViewIcon,
  CheckCircle as ActivateIcon,
  Cancel as DeactivateIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  ThumbUp as LikeIcon,
  Today as DateIcon,
  Person as PersonIcon,
  ErrorOutline as WarningIcon,
  AdminPanelSettings as AdminIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ReportProblem as ReportIcon,
  Settings as SettingsIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleString('en-US', options);
};

export default function CommunityPostDetailPage({ params }) {
  const { id } = params;
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI states
  const [expandedComments, setExpandedComments] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/admin/community/posts/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post details');
        }

        const data = await response.json();
        
        // Mock data for development (remove in production)
        const mockData = {
          PostID: id,
          Title: "Introduction to Blockchain Technology",
          Content: "Blockchain is a decentralized, distributed ledger technology that records transactions across many computers. It ensures that once recorded, data cannot be altered retroactively without the alteration of all subsequent blocks and the consensus of the network.\n\nThe blockchain was invented by a person (or group of people) using the name Satoshi Nakamoto in 2008 to serve as the public transaction ledger of the cryptocurrency bitcoin. The invention of the blockchain for bitcoin made it the first digital currency to solve the double-spending problem without the need of a trusted authority or central server.\n\nThe bitcoin design has inspired other applications, and blockchains that are readable by the public are widely used by cryptocurrencies. Blockchain is considered a type of payment rail. Private blockchains have been proposed for business use.",
          CreationDate: "2023-09-15T10:30:00",
          Category: "Blockchain",
          PointsCost: 0,
          Likes: 24,
          Views: 178,
          UserID: 101,
          Username: "blockchain_expert",
          ProfileImage: "https://randomuser.me/api/portraits/men/1.jpg",
          isLiked: false,
          IsActive: true,
          comments: [
            {
              CommentID: 1,
              Content: "This is a great introduction! I would love to see a more in-depth explanation of how consensus mechanisms work in different blockchain implementations.",
              CreationDate: "2023-09-15T14:22:00",
              Likes: 7,
              ParentCommentID: null,
              UserID: 202,
              Username: "crypto_enthusiast",
              ProfileImage: "https://randomuser.me/api/portraits/women/22.jpg",
              isLiked: true,
              IsActive: true
            },
            {
              CommentID: 2,
              Content: "I'm still confused about how mining works. Can you explain that in simpler terms?",
              CreationDate: "2023-09-16T08:45:00",
              Likes: 3,
              ParentCommentID: null,
              UserID: 303,
              Username: "blockchain_beginner",
              ProfileImage: "https://randomuser.me/api/portraits/men/33.jpg",
              isLiked: false,
              IsActive: true
            },
            {
              CommentID: 3,
              Content: "Mining is essentially a process where powerful computers solve complex mathematical problems. When they solve these problems, they validate transactions and add them to the blockchain. Miners are rewarded with cryptocurrency for their work.",
              CreationDate: "2023-09-16T09:30:00",
              Likes: 8,
              ParentCommentID: 2,
              UserID: 101,
              Username: "blockchain_expert",
              ProfileImage: "https://randomuser.me/api/portraits/men/1.jpg",
              isLiked: false,
              IsActive: true
            },
            {
              CommentID: 4,
              Content: "Thanks for the explanation! That makes it much clearer.",
              CreationDate: "2023-09-16T10:15:00",
              Likes: 2,
              ParentCommentID: 3,
              UserID: 303,
              Username: "blockchain_beginner",
              ProfileImage: "https://randomuser.me/api/portraits/men/33.jpg",
              isLiked: false,
              IsActive: true
            },
            {
              CommentID: 5,
              Content: "I think blockchain technology is overrated and has limited practical applications.",
              CreationDate: "2023-09-17T13:10:00",
              Likes: 0,
              ParentCommentID: null,
              UserID: 404,
              Username: "tech_skeptic",
              ProfileImage: "https://randomuser.me/api/portraits/women/44.jpg",
              isLiked: false,
              IsActive: false
            }
          ]
        };
        
        setPost(data || mockData);
      } catch (err) {
        console.error('Error fetching post details:', err);
        setError(err.message);
        
        // Fallback to mock data for development
        setPost({
          PostID: id,
          Title: "Introduction to Blockchain Technology",
          Content: "Blockchain is a decentralized, distributed ledger technology that records transactions across many computers. It ensures that once recorded, data cannot be altered retroactively without the alteration of all subsequent blocks and the consensus of the network.",
          CreationDate: "2023-09-15T10:30:00",
          Category: "Blockchain",
          PointsCost: 0,
          Likes: 24,
          Views: 178,
          UserID: 101,
          Username: "blockchain_expert",
          ProfileImage: "https://randomuser.me/api/portraits/men/1.jpg",
          isLiked: false,
          IsActive: true,
          comments: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchPostDetail();
    }
  }, [id, user, router]);

  const handleToggleCommentActive = async (commentId, isActive) => {
    try {
      const response = await fetch(`/api/admin/community/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          isActive: !isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment status');
      }

      // Update comment in state
      const updatedComments = post.comments.map(comment => 
        comment.CommentID === commentId 
          ? { ...comment, IsActive: !isActive } 
          : comment
      );
      
      setPost({
        ...post,
        comments: updatedComments
      });
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleTogglePostActive = async () => {
    if (!post) return;
    
    try {
      const response = await fetch('/api/admin/community', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.PostID,
          isActive: !post.IsActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post status');
      }

      // Update post in state
      setPost({
        ...post,
        IsActive: !post.IsActive
      });
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const openDeleteCommentDialog = (comment) => {
    setCommentToDelete(comment);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/community/comments/${commentToDelete.CommentID}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Remove comment from state
      const updatedComments = post.comments.filter(
        comment => comment.CommentID !== commentToDelete.CommentID
      );
      
      setPost({
        ...post,
        comments: updatedComments
      });
      
      // Close dialog
      closeDeleteDialog();
    } catch (err) {
      alert(`Error: ${err.message}`);
      closeDeleteDialog();
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/admin/community/posts/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      alert('Post deleted successfully');
      router.push('/admin/content/community');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleBackToList = () => {
    router.push('/admin/content/community');
  };
  
  const toggleCommentExpansion = (commentId) => {
    setExpandedComments({
      ...expandedComments,
      [commentId]: !expandedComments[commentId]
    });
  };
  
  // Organize comments into threads
  const organizeComments = (comments) => {
    if (!comments) return [];
    
    const commentMap = {};
    const rootComments = [];
    
    // First pass: map all comments by ID
    comments.forEach(comment => {
      comment.replies = [];
      commentMap[comment.CommentID] = comment;
    });
    
    // Second pass: organize into threads
    comments.forEach(comment => {
      if (comment.ParentCommentID) {
        // This is a reply, add it to parent's replies
        const parent = commentMap[comment.ParentCommentID];
        if (parent) {
          parent.replies.push(comment);
        } else {
          // If parent not found (could be deleted or error), treat as root
          rootComments.push(comment);
        }
      } else {
        // This is a root comment
        rootComments.push(comment);
      }
    });
    
    return rootComments;
  };
  
  // Comment component for rendering comment thread
  const CommentItem = ({ comment, level = 0, showReplies = true }) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedComments[comment.CommentID];
    
    return (
      <Box sx={{ ml: level > 0 ? (level * 3) : 0 }}>
        <Paper 
          elevation={1}
          sx={{ 
            p: 2, 
            mb: 2, 
            borderRadius: 2,
            borderLeft: '3px solid',
            borderLeftColor: comment.IsActive ? theme.palette.primary.main : theme.palette.error.main,
            opacity: comment.IsActive ? 1 : 0.7,
            transition: 'all 0.2s ease'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              src={comment.ProfileImage} 
              alt={comment.Username}
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2">{comment.Username}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.CreationDate)}
              </Typography>
            </Box>
            
            <Box>
              <Tooltip title={comment.IsActive ? "Deactivate Comment" : "Activate Comment"}>
                <Switch
                  size="small"
                  checked={comment.IsActive}
                  onChange={() => handleToggleCommentActive(comment.CommentID, comment.IsActive)}
                  color={comment.IsActive ? "success" : "error"}
                />
              </Tooltip>
              <Tooltip title="Delete Comment">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => openDeleteCommentDialog(comment)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Typography variant="body2" sx={{ 
            whiteSpace: 'pre-line',
            opacity: comment.IsActive ? 1 : 0.8
          }}>
            {comment.Content}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <LikeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="caption">{comment.Likes} likes</Typography>
            </Box>
            {hasReplies && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': { color: theme.palette.primary.main }
                }}
                onClick={() => toggleCommentExpansion(comment.CommentID)}
              >
                <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">
                  {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </Typography>
                {hasReplies && (
                  isExpanded ? <ExpandLessIcon fontSize="small" sx={{ ml: 0.5 }} /> : <ExpandMoreIcon fontSize="small" sx={{ ml: 0.5 }} />
                )}
              </Box>
            )}
          </Box>
        </Paper>
        
        {showReplies && hasReplies && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box>
              {comment.replies.map(reply => (
                <CommentItem 
                  key={reply.CommentID} 
                  comment={reply} 
                  level={level + 1}
                  showReplies={true}
                />
              ))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8
          }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 3 }}>
              Loading post details...
            </Typography>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8
            }}
          >
            <Alert 
              severity="error" 
              variant="filled"
              sx={{ mb: 3, width: '100%', maxWidth: 500 }}
            >
              {error}
            </Alert>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleBackToList}
              startIcon={<ArrowBackIcon />}
            >
              Back to Community
            </Button>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  // If no post data available
  if (!post) {
    return (
      <MainLayout>
        <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Post not found
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBackToList}
              startIcon={<ArrowBackIcon />}
              sx={{ mt: 2 }}
            >
              Back to Community
            </Button>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  const organizedComments = organizeComments(post.comments);

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Typography 
            color="inherit" 
            sx={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              '&:hover': { color: theme.palette.primary.main }
            }}
            onClick={() => router.push('/admin/dashboard')}
          >
            Dashboard
          </Typography>
          <Typography 
            color="inherit" 
            sx={{ 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              '&:hover': { color: theme.palette.primary.main }
            }}
            onClick={() => router.push('/admin/content/community')}
          >
            Community
          </Typography>
          <Typography 
            color="text.primary"
            sx={{
              maxWidth: '300px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {post.Title}
          </Typography>
        </Breadcrumbs>
        
        {/* Post Detail */}
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                borderTop: '4px solid',
                borderTopColor: post.IsActive ? theme.palette.success.main : theme.palette.error.main
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Chip 
                  label={post.Category} 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  label={post.IsActive ? 'Active' : 'Inactive'} 
                  color={post.IsActive ? 'success' : 'error'}
                />
              </Box>
              
              <Typography variant="h4" component="h1" gutterBottom>
                {post.Title}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={post.ProfileImage} 
                    alt={post.Username}
                    sx={{ width: 40, height: 40, mr: 1.5 }}
                  />
                  <Box>
                    <Typography variant="subtitle1">{post.Username}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <DateIcon sx={{ fontSize: 12, mr: 0.5 }} />
                      {formatDate(post.CreationDate)}
                    </Typography>
                  </Box>
                </Box>
                
                {post.PointsCost > 0 && (
                  <Chip 
                    label={`${post.PointsCost} Points Cost`} 
                    color="secondary" 
                    variant="outlined"
                    sx={{ ml: 'auto' }}
                  />
                )}
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {post.Content}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LikeIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">{post.Likes} likes</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CommentIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {post.comments ? post.comments.length : 0} comments
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ViewIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">{post.Views} views</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={5}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color={post.IsActive ? 'error' : 'success'}
                      size="small"
                      startIcon={post.IsActive ? <DeactivateIcon /> : <ActivateIcon />}
                      onClick={handleTogglePostActive}
                    >
                      {post.IsActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleDeletePost}
                    >
                      Delete
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Comments Section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CommentIcon sx={{ mr: 1 }} />
                Comments ({post.comments ? post.comments.length : 0})
              </Typography>
              
              {post.comments && post.comments.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {organizedComments.map(comment => (
                    <CommentItem 
                      key={comment.CommentID} 
                      comment={comment} 
                    />
                  ))}
                </Box>
              ) : (
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 3, 
                    mt: 2, 
                    borderRadius: 2,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.background.paper, 0.6)
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No comments yet
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Actions Card */}
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Admin Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBackToList}
                  sx={{ mb: 2 }}
                >
                  Back to Community
                </Button>
                
                <Button
                  fullWidth
                  variant="contained"
                  color={post.IsActive ? 'error' : 'success'}
                  startIcon={post.IsActive ? <DeactivateIcon /> : <ActivateIcon />}
                  onClick={handleTogglePostActive}
                  sx={{ mb: 2 }}
                >
                  {post.IsActive ? 'Deactivate Post' : 'Activate Post'}
                </Button>
                
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeletePost}
                >
                  Delete Post
                </Button>
              </Paper>
              
              {/* Post Stats Card */}
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Post Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Views</Typography>
                    <Typography variant="h5">{post.Views}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Likes</Typography>
                    <Typography variant="h5">{post.Likes}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Comments</Typography>
                    <Typography variant="h5">{post.comments ? post.comments.length : 0}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Points Cost</Typography>
                    <Typography variant="h5">{post.PointsCost}</Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Author Info Card */}
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Author Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={post.ProfileImage} 
                    alt={post.Username}
                    sx={{ width: 50, height: 50, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">{post.Username}</Typography>
                    <Typography variant="body2" color="text.secondary">User ID: {post.UserID}</Typography>
                  </Box>
                </Box>
                
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<PersonIcon />}
                  onClick={() => router.push(`/admin/users/${post.UserID}`)}
                >
                  View User Profile
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
      
      {/* Delete Comment Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="error" sx={{ mr: 1 }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
          {commentToDelete && (
            <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
              <Typography variant="caption" color="text.secondary">
                {commentToDelete.Username} wrote:
              </Typography>
              <Typography variant="body2">
                {commentToDelete.Content}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteDialog} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteComment} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}