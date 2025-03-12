'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  IconButton,
  LinearProgress,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  useTheme,
  alpha
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  PhotoCamera as PhotoCameraIcon,
  BarChart as ChartIcon,
  History as HistoryIcon,
  Notifications as NotificationIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/app/auth/ProtectedRoute';
import api from '@/services/api';
import Link from 'next/link';

export default function ProfilePage() {
  const theme = useTheme();
  const { user, updateUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState({
    personal: false,
    contact: false,
    education: false,
    preferences: false
  });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    education_level: '',
    bio: '',
    phone: '',
    location: '',
    occupation: ''
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const educationLevels = [
    { value: 1, label: 'Primary' },
    { value: 2, label: 'Secondary' },
    { value: 3, label: 'High School' },
    { value: 4, label: 'University' },
    { value: 5, label: 'Professional' },
  ];

  // Fetch user data
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // In a real app, you would fetch this data from your API
        // const response = await api.get('/users/profile');
        // const userDetails = response.data;
        
        // For now, we'll use mock data based on the user context
        const userDetails = {
          id: user.id || 1,
          username: user.Username || '',
          email: user.Email || '',
          first_name: user.FirstName || '',
          last_name: user.LastName || '',
          education_level: user.EducationLevel || '',
          bio: 'Software developer passionate about learning and technology. Interested in web development, AI, and data science.',
          joined_date: '2023-09-01',
          points: user.Points || 0,
          phone: '+90 555 123 4567',
          location: 'Istanbul, Turkey',
          occupation: 'Software Developer',
          profile_image: null,
          courses: [
            { id: 1, title: 'Introduction to Programming', category: 'Computer Science', progress: 75 },
            { id: 2, title: 'Advanced Mathematics', category: 'Mathematics', progress: 30 },
            { id: 3, title: 'Machine Learning Basics', category: 'Data Science', progress: 100, completed: true }
          ],
          quests: [
            { id: 1, title: 'Python Challenge', category: 'Programming', completed: true, score: 92 },
            { id: 2, title: 'Data Analysis Quest', category: 'Data Science', completed: false }
          ],
          achievements: [
            { id: 1, title: 'First Course Completed', date: '2023-10-15', points: 50 },
            { id: 2, title: '5-Day Streak', date: '2023-10-20', points: 20 }
          ],
          skills: {
            programming: 80,
            mathematics: 65,
            data_science: 45,
            problem_solving: 70
          },
          notification_preferences: {
            email_notifications: true,
            course_updates: true,
            quest_reminders: true
          }
        };
        
        setUserData(userDetails);
        
        // Initialize form with user data
        setFormData({
          username: userDetails.username,
          email: userDetails.email,
          first_name: userDetails.first_name,
          last_name: userDetails.last_name,
          education_level: userDetails.education_level,
          bio: userDetails.bio,
          phone: userDetails.phone,
          location: userDetails.location,
          occupation: userDetails.occupation
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setNotification({
          open: true,
          message: 'Failed to load profile data',
          severity: 'error'
        });
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleEdit = (section) => {
    // If canceling edit, reset form data
    if (editMode[section] && userData) {
      const resetFields = {
        personal: ['first_name', 'last_name', 'username', 'bio', 'occupation'],
        contact: ['email', 'phone', 'location'],
        education: ['education_level'],
        preferences: []
      };
      
      const fieldsToReset = resetFields[section];
      const updatedFormData = { ...formData };
      
      fieldsToReset.forEach(field => {
        updatedFormData[field] = userData[field];
      });
      
      setFormData(updatedFormData);
    }
    
    setEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSaveChanges = async (section) => {
    try {
      // Create an object with only the fields from this section
      const fieldGroups = {
        personal: ['first_name', 'last_name', 'username', 'bio', 'occupation'],
        contact: ['email', 'phone', 'location'],
        education: ['education_level'],
        preferences: []
      };
      
      const fieldsToUpdate = fieldGroups[section];
      const updateData = {};
      
      fieldsToUpdate.forEach(field => {
        updateData[field] = formData[field];
      });
      
      // In a real app, you would send this data to your API
      // await api.put('/users/profile', updateData);
      
      // For demonstration, we'll update the local state
      if (updateUser && (section === 'personal' || section === 'contact' || section === 'education')) {
        // Map form data to user object structure in your database
        const userUpdate = {
          Username: formData.username,
          Email: formData.email,
          FirstName: formData.first_name,
          LastName: formData.last_name,
          EducationLevel: formData.education_level
        };
        
        // Make the API call through your Auth context
        await updateUser(userUpdate);
      }
      
      // Update local userData state
      setUserData(prev => ({
        ...prev,
        ...updateData
      }));
      
      // Exit edit mode
      setEditMode(prev => ({
        ...prev,
        [section]: false
      }));
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // In a real app, you would upload the file to your server
      // const formData = new FormData();
      // formData.append('profile_image', file);
      // await api.post('/users/profile/image', formData);
      
      // For demonstration, we'll simulate a delay and update the local state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a temporary URL for the file
      const imageUrl = URL.createObjectURL(file);
      
      setUserData(prev => ({
        ...prev,
        profile_image: imageUrl
      }));
      
      setNotification({
        open: true,
        message: 'Profile picture updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setNotification({
        open: true,
        message: 'Failed to upload profile image',
        severity: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const getEducationLevelName = (level) => {
    const educationLevel = educationLevels.find(el => el.value === Number(level));
    return educationLevel ? educationLevel.label : 'Unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ProtectedRoute>
      <Box sx={{ py: 4, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
        <Container maxWidth="lg">
          {/* Success/Error Notification */}
          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseNotification} 
              severity={notification.severity} 
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
          
          {/* Profile Header */}
          <Paper 
            elevation={1} 
            sx={{ 
              mb: 4, 
              borderRadius: 4, 
              overflow: 'hidden',
              backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
            }}
          >
            <Box sx={{ p: 4, color: 'white' }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={userData.profile_image}
                      alt={`${userData.first_name} ${userData.last_name}`}
                      sx={{ 
                        width: 150, 
                        height: 150,
                        border: '4px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'white',
                        '&:hover': { bgcolor: 'white' }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? 
                        <CircularProgress size={24} /> : 
                        <PhotoCameraIcon />
                      }
                    </IconButton>
                    <input
                      type="file"
                      hidden
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {userData.first_name} {userData.last_name}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                    @{userData.username}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    {userData.bio}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      icon={<SchoolIcon />} 
                      label={getEducationLevelName(userData.education_level)}
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)', 
                        color: 'white',
                        '& .MuiChip-icon': { color: 'white' }
                      }}
                    />
                    <Chip 
                      icon={<WorkIcon />} 
                      label={userData.occupation}
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)', 
                        color: 'white',
                        '& .MuiChip-icon': { color: 'white' }
                      }}
                    />
                    <Chip 
                      icon={<LocationIcon />} 
                      label={userData.location}
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)', 
                        color: 'white',
                        '& .MuiChip-icon': { color: 'white' }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" fontWeight="bold">
                      {userData.points}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      Total Points
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      sx={{ mt: 2 }}
                      component={Link}
                      href="/dashboard"
                    >
                      View Dashboard
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          
          {/* Main Content */}
          <Grid container spacing={4}>
            {/* Left Column - User Information */}
            <Grid item xs={12} md={8}>
              {/* Personal Information Section */}
              <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Personal Information
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={editMode.personal ? <CancelIcon /> : <EditIcon />}
                    color={editMode.personal ? "error" : "primary"}
                    onClick={() => handleToggleEdit('personal')}
                  >
                    {editMode.personal ? 'Cancel' : 'Edit'}
                  </Button>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {editMode.personal ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Occupation"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        variant="outlined"
                        multiline
                        rows={3}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          onClick={() => handleSaveChanges('personal')}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        First Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {userData.first_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Last Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {userData.last_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Username
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        @{userData.username}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Joined Date
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(userData.joined_date)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Occupation
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {userData.occupation}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Bio
                      </Typography>
                      <Typography variant="body1">
                        {userData.bio}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Paper>
              
              {/* Contact Information Section */}
              <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Contact Information
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={editMode.contact ? <CancelIcon /> : <EditIcon />}
                    color={editMode.contact ? "error" : "primary"}
                    onClick={() => handleToggleEdit('contact')}
                  >
                    {editMode.contact ? 'Cancel' : 'Edit'}
                  </Button>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {editMode.contact ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          onClick={() => handleSaveChanges('contact')}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {userData.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {userData.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {userData.location}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Paper>
              
              {/* Education Section */}
              <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Education
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={editMode.education ? <CancelIcon /> : <EditIcon />}
                    color={editMode.education ? "error" : "primary"}
                    onClick={() => handleToggleEdit('education')}
                  >
                    {editMode.education ? 'Cancel' : 'Edit'}
                  </Button>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {editMode.education ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="Education Level"
                        name="education_level"
                        value={formData.education_level}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                      >
                        {educationLevels.map((level) => (
                          <MenuItem key={level.value} value={level.value}>
                            {level.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          onClick={() => handleSaveChanges('education')}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Education Level
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {getEducationLevelName(userData.education_level)}
                    </Typography>
                  </Box>
                )}
              </Paper>
              
              {/* Skills Section */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ChartIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Skills
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  {Object.entries(userData.skills).map(([skill, level]) => (
                    <Grid item xs={12} key={skill}>
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                            {skill.replace('_', ' ')}
                          </Typography>
                          <Typography variant="body2">
                            {level}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={level} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            
            {/* Right Column - Learning Progress */}
            <Grid item xs={12} md={4}>
              {/* Notification Preferences */}
              <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Notification Preferences
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={editMode.preferences ? <CancelIcon /> : <EditIcon />}
                    color={editMode.preferences ? "error" : "primary"}
                    onClick={() => handleToggleEdit('preferences')}
                  >
                    {editMode.preferences ? 'Cancel' : 'Edit'}
                  </Button>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {editMode.preferences ? (
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userData.notification_preferences.email_notifications}
                          onChange={(e) => setUserData({
                            ...userData,
                            notification_preferences: {
                              ...userData.notification_preferences,
                              email_notifications: e.target.checked
                            }
                          })}
                          color="primary"
                        />
                      }
                      label="Email Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userData.notification_preferences.course_updates}
                          onChange={(e) => setUserData({
                            ...userData,
                            notification_preferences: {
                              ...userData.notification_preferences,
                              course_updates: e.target.checked
                            }
                          })}
                          color="primary"
                        />
                      }
                      label="Course Updates"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userData.notification_preferences.quest_reminders}
                          onChange={(e) => setUserData({
                            ...userData,
                            notification_preferences: {
                              ...userData.notification_preferences,
                              quest_reminders: e.target.checked
                            }
                          })}
                          color="primary"
                        />
                      }
                      label="Quest Reminders"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={() => handleSaveChanges('preferences')}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="body1">Email Notifications</Typography>
                      <Chip 
                        label={userData.notification_preferences.email_notifications ? "Enabled" : "Disabled"}
                        color={userData.notification_preferences.email_notifications ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="body1">Course Updates</Typography>
                      <Chip 
                        label={userData.notification_preferences.course_updates ? "Enabled" : "Disabled"}
                        color={userData.notification_preferences.course_updates ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography variant="body1">Quest Reminders</Typography>
                      <Chip 
                        label={userData.notification_preferences.quest_reminders ? "Enabled" : "Disabled"}
                        color={userData.notification_preferences.quest_reminders ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                  </Box>
                )}
              </Paper>
              
              {/* My Courses */}
              <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      My Courses
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    component={Link}
                    href="/courses"
                  >
                    View All
                  </Button>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {userData.courses.length > 0 ? (
                  <Box>
                    {userData.courses.map((course, index) => (
                      <Box key={course.id}>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {course.title}
                            </Typography>
                            {course.completed && (
                              <Chip 
                                icon={<CheckIcon />}
                                label="Completed" 
                                size="small"
                                color="success"
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {course.category}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Progress
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {course.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={course.progress} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                            }}
                          />
                        </Box>
                        {index < userData.courses.length - 1 && <Divider sx={{ my: 1 }} />}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" align="center">
                    You haven't enrolled in any courses yet.
                  </Typography>
                )}
              </Paper>
              
              {/* My Quests */}
              <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <QuestIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      My Quests
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    component={Link}
                    href="/quests"
                  >
                    View All
                  </Button>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {userData.quests.length > 0 ? (
                  <Box>
                    {userData.quests.map((quest, index) => (
                      <Box key={quest.id}>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {quest.title}
                            </Typography>
                            {quest.completed ? (
                              <Chip 
                                label={`Score: ${quest.score}%`}
                                size="small"
                                color={quest.score >= 80 ? "success" : quest.score >= 60 ? "warning" : "error"}
                              />
                            ) : (
                              <Chip 
                                label="In Progress"
                                size="small"
                                color="warning"
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {quest.category}
                          </Typography>
                        </Box>
                        {index < userData.quests.length - 1 && <Divider sx={{ my: 1 }} />}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" align="center">
                    You haven't started any quests yet.
                  </Typography>
                )}
              </Paper>
              
              {/* Recent Achievements */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HistoryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Recent Achievements
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {userData.achievements.length > 0 ? (
                  <Box>
                    {userData.achievements.map((achievement, index) => (
                      <Box key={achievement.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {achievement.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(achievement.date)}
                            </Typography>
                          </Box>
                          <Chip 
                            label={`+${achievement.points} pts`}
                            size="small"
                            color="primary"
                          />
                        </Box>
                        {index < userData.achievements.length - 1 && <Divider sx={{ my: 1 }} />}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" align="center">
                    You haven't earned any achievements yet.
                  </Typography>
                )}
              </Paper>
              
              {/* Account Actions */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={logout}
                >
                  Logout
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}