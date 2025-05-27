"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';

// MUI components
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Tooltip,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  useMediaQuery
} from '@mui/material';

// MUI icons
import {
  EmojiEvents as QuestIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  AssignmentTurnedIn as TaskIcon,
  Stars as DifficultyIcon,
  Timer as TimerIcon,
  Campaign as RewardIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  SmartToy as AIIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

export default function QuestDetailPage(props) {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get questId from params
  const questId = props.params.questId;
  
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Admin check
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  // Fetch quest details
  useEffect(() => {
    const fetchQuestDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/quests/${questId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quest details');
        }
        
        const data = await response.json();
        console.log("Quest data:", data); // Debug log
        setQuest(data);
        
        // Prepare edit data with all possible data formats
        // Handle inconsistent casing between different API responses
        setEditData({
          title: data.Title || data.title || '',
          description: data.Description || data.description || '',
          difficultyLevel: data.DifficultyLevel || data.difficultyLevel || 'intermediate',
          requiredPoints: data.RequiredPoints || data.requiredPoints || 0,
          rewardPoints: data.RewardPoints || data.rewardPoints || 0,
          // Explicitly convert numeric/boolean/string values to boolean for consistency
          isActive: Boolean(data.IsActive === 1 || data.IsActive === true || 
                         data.isActive === 1 || data.isActive === true || false),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (questId) {
      fetchQuestDetails();
    }
  }, [questId]);

  // Save quest updates
  const handleSaveQuest = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      
      // Prepare data format expected by the backend
      const updateData = {
        title: editData.title,
        description: editData.description,
        difficultyLevel: editData.difficultyLevel,
        requiredPoints: parseInt(editData.requiredPoints),
        rewardPoints: parseInt(editData.rewardPoints),
        isActive: editData.isActive
      };
      
      console.log("Sending update:", updateData); // Debug log
      
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quest');
      }
      
      const updatedData = await response.json();
      setQuest(updatedData);
      setEditMode(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete quest
  const handleDeleteQuest = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete quest');
      }
      
      router.push('/admin/content/quests');
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
      setDeleteDialog(false);
    }
  };
  
  // Create NFT for quest
  const handleCreateNFT = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      
      // Prepare NFT data from the quest
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/admin/quests/${questId}/nft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to prepare NFT data');
      }
      
      const nftData = await response.json();
      
      // Redirect to NFT creation page with pre-filled data
      if (nftData.nftData) {
        // If quest already has an NFT
        if (nftData.nftId) {
          router.push(`/admin/content/nfts/${nftData.nftId}`);
        } else {
          // Create new NFT with pre-filled data
          router.push(`/admin/content/nfts/create?${new URLSearchParams({
            title: nftData.nftData.title,
            description: nftData.nftData.description,
            nftTypeId: nftData.nftData.nftTypeId,
            tradeValue: nftData.nftData.tradeValue,
            rarity: nftData.nftData.rarity,
            questId: nftData.questId,
            redirectUrl: `/admin/content/quests/${questId}`
          }).toString()}`);
        }
      }
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <Alert severity="error" sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<BackIcon />} 
            onClick={() => router.push('/admin/content/quests')}
          >
            Back to Quests List
          </Button>
        </Box>
      </MainLayout>
    );
  }

  // No quest found
  if (!quest) {
    return (
      <MainLayout>
        <Alert severity="warning" sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
          Quest not found
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<BackIcon />} 
            onClick={() => router.push('/admin/content/quests')}
          >
            Back to Quests List
          </Button>
        </Box>
      </MainLayout>
    );
  }

  // Handle isActive status deterministically by checking all possible representations
  const isActiveStatus = Boolean(
    quest.IsActive === 1 || 
    quest.IsActive === true || 
    quest.isActive === 1 || 
    quest.isActive === true
  );
  
  // Format quest data to handle different API response formats
  const questData = {
    id: quest.QuestID || quest.questId || quest.id || questId,
    title: quest.Title || quest.title || "Untitled Quest",
    description: quest.Description || quest.description || "",
    difficultyLevel: quest.DifficultyLevel || quest.difficultyLevel || "intermediate",
    requiredPoints: quest.RequiredPoints || quest.requiredPoints || 0,
    rewardPoints: quest.RewardPoints || quest.rewardPoints || 0,
    isActive: isActiveStatus,
    isAIGenerated: Boolean(
      quest.IsAIGenerated === 1 || 
      quest.IsAIGenerated === true || 
      quest.isAIGenerated === 1 || 
      quest.isAIGenerated === true
    ),
    creationDate: quest.CreationDate || quest.creationDate || new Date().toISOString(),
    conditions: quest.conditions || quest.Conditions || [],
  };

  // Debug logging for active status
  console.log("Raw isActive value:", quest.IsActive, quest.isActive);
  console.log("Formatted isActive:", questData.isActive);
  console.log("Edit data isActive:", editData.isActive);

  return (
    <MainLayout>
      <Box sx={{ 
        maxWidth: 1200, 
        mx: 'auto', 
        p: { xs: 2, md: 3 },
        position: 'relative',
        minHeight: '80vh',
      }}>
        {/* Header and Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: { xs: '100%', sm: 'auto' } 
          }}>
            <IconButton 
              onClick={() => router.push('/admin/content/quests')}
              sx={{ 
                mr: 1, 
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.2)
                }
              }}
            >
              <BackIcon />
            </IconButton>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              Quest Details
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            width: { xs: '100%', sm: 'auto' } 
          }}>
            {editMode ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveQuest}
                  disabled={saving}
                  fullWidth={isMobile}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditMode(false)}
                  disabled={saving}
                  fullWidth={isMobile}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                  fullWidth={isMobile}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialog(true)}
                  fullWidth={isMobile}
                >
                  Delete
                </Button>
                
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCreateNFT}
                  disabled={saving}
                  fullWidth={isMobile}
                >
                  {questData.rewardNFTID ? 'View NFT Reward' : 'Create NFT Reward'}
                </Button>
              </>
            )}
          </Box>
        </Box>
        
        {/* Error Message */}
        {saveError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSaveError(null)}>
            {saveError}
          </Alert>
        )}
        
        {/* Tabs */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          mb: 3,
          overflowX: 'auto' 
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="quest details tabs"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : "standard"}
          >
            <Tab label="General Information" id="tab-0" />
            <Tab label="Conditions" id="tab-1" />
            <Tab label="User Progress" id="tab-2" />
          </Tabs>
        </Box>
        
        {/* Tab Content Container with Fixed Height */}
        <Box sx={{ 
          minHeight: '600px', // Fixed minimum height to prevent layout shifts
          position: 'relative'
        }}>
          {/* General Information Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: { xs: 2, md: 3 }, 
                  borderRadius: 2,
                  height: '100%',
                  borderLeft: '5px solid',
                  borderColor: questData.isActive ? 'success.main' : 'error.main',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Title */}
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Quest Title"
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    variant="outlined"
                    margin="normal"
                  />
                ) : (
                  <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    gutterBottom 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      wordBreak: 'break-word'
                    }}
                  >
                    <QuestIcon sx={{ mr: 1, color: 'secondary.main', flexShrink: 0 }} />
                    {questData.title}
                  </Typography>
                )}
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1, 
                  mt: 2, 
                  mb: 3 
                }}>
                  <Chip 
                    icon={<DifficultyIcon />}
                    label={`Difficulty: ${questData.difficultyLevel}`}
                    color={
                      questData.difficultyLevel === 'beginner' ? 'success' :
                      questData.difficultyLevel === 'intermediate' ? 'warning' :
                      'error'
                    }
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                  />
                  
                  <Chip 
                    icon={<TimerIcon />}
                    label={`Required: ${questData.requiredPoints} pts`}
                    color="primary"
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                  />
                  
                  <Chip 
                    icon={<RewardIcon />}
                    label={`Reward: ${questData.rewardPoints} pts`}
                    color="secondary"
                    size={isMobile ? "small" : "medium"}
                  />
                  
                  <Chip 
                    icon={questData.isActive ? <ActiveIcon /> : <InactiveIcon />}
                    label={questData.isActive ? 'Active' : 'Inactive'}
                    color={questData.isActive ? 'success' : 'error'}
                    size={isMobile ? "small" : "medium"}
                  />
                  
                  {questData.isAIGenerated && (
                    <Tooltip title="Created with Artificial Intelligence">
                      <Chip 
                        icon={<AIIcon />}
                        label="AI Generated"
                        color="info"
                        size={isMobile ? "small" : "medium"}
                      />
                    </Tooltip>
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Description */}
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Quest Description"
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    variant="outlined"
                    multiline
                    rows={6}
                    margin="normal"
                  />
                ) : (
                  <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ 
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-word' 
                    }}
                  >
                    {questData.description}
                  </Typography>
                )}
                
                <Divider sx={{ my: 3 }} />
                
                {/* Conditions Summary */}
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TaskIcon sx={{ mr: 1 }} />
                  Completion Conditions
                </Typography>
                
                <List disablePadding>
                  {questData.conditions && questData.conditions.length > 0 ? (
                    questData.conditions.map((condition, index) => (
                      <ListItem 
                        key={index}
                        sx={{ 
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: alpha(theme.palette.divider, 0.1)
                        }}
                      >
                        <ListItemIcon>
                          <TaskIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            condition.displayText || 
                            condition.targetTitle || 
                            condition.description || 
                            `${condition.conditionType || condition.ConditionType || 'Unknown'} - ID: ${condition.targetId || condition.TargetID || 'N/A'}`
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Type: {condition.conditionType || condition.ConditionType || 'Not specified'}
                              </Typography>
                              {(condition.targetValue || condition.TargetValue) && (
                                <Typography variant="body2" color="text.secondary">
                                  Target Value: {condition.targetValue || condition.TargetValue}
                                </Typography>
                              )}
                              {(condition.courseTitle || condition.CourseTitle) && (
                                <Typography variant="body2" color="text.secondary">
                                  Course: {condition.courseTitle || condition.CourseTitle}
                                </Typography>
                              )}
                            </Box>
                          }
                          primaryTypographyProps={{
                            sx: {
                              wordBreak: 'break-word',
                              fontWeight: 'medium'
                            }
                          }}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No conditions specified for this quest.
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              {/* Settings Panel */}
              <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quest Settings
                </Typography>
                
                {editMode ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Difficulty Level"
                      select
                      SelectProps={{ native: true }}
                      value={editData.difficultyLevel}
                      onChange={(e) => setEditData({...editData, difficultyLevel: e.target.value})}
                      variant="outlined"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </TextField>
                    
                    <TextField
                      fullWidth
                      label="Required Points"
                      type="number"
                      value={editData.requiredPoints}
                      onChange={(e) => setEditData({...editData, requiredPoints: Number(e.target.value)})}
                      variant="outlined"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Reward Points"
                      type="number"
                      value={editData.rewardPoints}
                      onChange={(e) => setEditData({...editData, rewardPoints: Number(e.target.value)})}
                      variant="outlined"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editData.isActive}
                          onChange={(e) => setEditData({...editData, isActive: e.target.checked})}
                          color="success"
                        />
                      }
                      label={editData.isActive ? "Active" : "Inactive"}
                    />
                  </Box>
                ) : (
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <DifficultyIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Difficulty Level" 
                        secondary={questData.difficultyLevel}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <TimerIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Required Points" 
                        secondary={questData.requiredPoints}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <RewardIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Reward Points" 
                        secondary={questData.rewardPoints}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        {questData.isActive ? 
                          <ActiveIcon color="success" /> : 
                          <InactiveIcon color="error" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary="Status" 
                        secondary={questData.isActive ? "Active" : "Inactive"}
                      />
                    </ListItem>
                  </List>
                )}
              </Paper>
              
              {/* Meta Information */}
              <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Meta Information
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Creation Date" 
                      secondary={new Date(questData.creationDate).toLocaleString()}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <QuestIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Quest ID" 
                      secondary={questData.id}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      {questData.isAIGenerated ? 
                        <AIIcon color="info" fontSize="small" /> : 
                        <EditIcon color="primary" fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Creation Method" 
                      secondary={questData.isAIGenerated ? "AI Generated" : "Manually Created"}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* Conditions Tab */}
        {tabValue === 1 && (
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quest Conditions
            </Typography>
            
            {(questData.conditions && questData.conditions.length > 0) ? (
              <Grid container spacing={3}>
                {questData.conditions.map((condition, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ wordBreak: 'break-word' }}>
                          {condition.displayText || condition.targetTitle || condition.description || `Condition ${index + 1}`}
                        </Typography>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Condition Type:</strong> {condition.conditionType || condition.ConditionType || 'Not specified'}
                        </Typography>
                        
                        {(condition.targetValue || condition.TargetValue) && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Target Value:</strong> {condition.targetValue || condition.TargetValue}
                          </Typography>
                        )}
                        
                        {(condition.targetId || condition.TargetID) && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Target ID:</strong> {condition.targetId || condition.TargetID}
                          </Typography>
                        )}
                        
                        {(condition.targetTitle || condition.TargetTitle) && (
                          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ wordBreak: 'break-word' }}>
                            <strong>Target:</strong> {condition.targetTitle || condition.TargetTitle}
                          </Typography>
                        )}
                        
                        {(condition.courseTitle || condition.CourseTitle) && (
                          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ wordBreak: 'break-word' }}>
                            <strong>Course:</strong> {condition.courseTitle || condition.CourseTitle}
                          </Typography>
                        )}
                        
                        {(condition.targetDescription || condition.TargetDescription) && (
                          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ wordBreak: 'break-word' }}>
                            <strong>Description:</strong> {condition.targetDescription || condition.TargetDescription}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">No conditions specified for this quest.</Alert>
            )}
          </Paper>
        )}
        
        {/* User Progress Tab */}
        {tabValue === 2 && (
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Progress
            </Typography>
            
            {/* This section requires a backend API */}
            <Alert severity="info">
              User progress information for this quest is not available yet.
            </Alert>
          </Paper>
        )}
        </Box>
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog}
          onClose={() => setDeleteDialog(false)}
        >
          <DialogTitle>Delete Quest</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the quest "{questData.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteQuest} 
              color="error" 
              variant="contained"
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}