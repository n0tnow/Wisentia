"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Box, Button, Card, CardContent, Container, Divider, FormControl, 
  Grid, IconButton, InputLabel, MenuItem, Paper, Select, Stack, 
  TextField, Typography, Alert, Chip, FormHelperText, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminCourseSelector from '@/components/admin/AdminCourseSelector';
import AdminQuizSelector from '@/components/admin/AdminQuizSelector';
import AdminVideoSelector from '@/components/admin/AdminVideoSelector';
import AdminTopicSelector from '@/components/admin/AdminTopicSelector';
import AdminNFTSelector from '@/components/admin/AdminNFTSelector';
import AIQuestSuggestor from '@/components/admin/AIQuestSuggestor';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const ConditionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  border: `1px solid ${theme.palette.divider}`,
}));

export default function CreateQuestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Quest form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficultyLevel: 'intermediate',
    requiredPoints: 0,
    rewardPoints: 50,
    rewardNftId: null,
    isActive: true,
    conditions: []
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/courses/categories');
        const data = await response.json();
        
        if (response.ok && data.categories) {
          setCategories(data.categories);
        } else {
          console.error('Failed to load categories:', data);
          // Set fallback categories
          setCategories([
            { Category: 'Programming', CourseCount: 0 },
            { Category: 'Web Development', CourseCount: 0 },
            { Category: 'Data Science', CourseCount: 0 },
            { Category: 'General Learning', CourseCount: 0 }
          ]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        // Set fallback categories
        setCategories([
          { Category: 'Programming', CourseCount: 0 },
          { Category: 'Web Development', CourseCount: 0 },
          { Category: 'Data Science', CourseCount: 0 },
          { Category: 'General Learning', CourseCount: 0 }
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    loadCategories();
  }, []);
  
  // Debug: Watch formData changes
  useEffect(() => {
    console.log('=== FORM DATA CHANGED ===');
    console.log('New form data:', formData);
    console.log('Conditions count:', formData.conditions?.length || 0);
    formData.conditions?.forEach((condition, index) => {
      console.log(`Condition ${index + 1}:`, condition);
    });
  }, [formData]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Add a new condition
  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [
        ...formData.conditions,
        {
          conditionType: 'course_completion',
          targetId: null,
          targetValue: 1,
          description: ''
        }
      ]
    });
  };
  
  // Remove a condition
  const removeCondition = (index) => {
    const updatedConditions = [...formData.conditions];
    updatedConditions.splice(index, 1);
    
    setFormData({
      ...formData,
      conditions: updatedConditions
    });
  };
  
  // Handle condition type change
  const handleConditionTypeChange = (index, value) => {
    const updatedConditions = [...formData.conditions];
    updatedConditions[index].conditionType = value;
    
    // Reset targetId when condition type changes
    updatedConditions[index].targetId = null;
    
    // Set appropriate default targetValue based on condition type
    if (value === 'quiz_score') {
      updatedConditions[index].targetValue = 70; // Default passing score percentage
    } else if (value === 'total_points') {
      updatedConditions[index].targetValue = 100; // Default points required
    } else {
      updatedConditions[index].targetValue = 1; // Default for other types
    }
    
    setFormData({
      ...formData,
      conditions: updatedConditions
    });
  };
  
  // Handle condition target ID change (for courses, quizzes, videos, topics)
  const handleConditionTargetChange = (index, targetId) => {
    const updatedConditions = [...formData.conditions];
    updatedConditions[index].targetId = targetId;
    
    setFormData({
      ...formData,
      conditions: updatedConditions
    });
  };
  
  // Handle condition target value change
  const handleConditionValueChange = (index, value) => {
    const updatedConditions = [...formData.conditions];
    updatedConditions[index].targetValue = value;
    
    setFormData({
      ...formData,
      conditions: updatedConditions
    });
  };
  
  // Handle condition description change
  const handleConditionDescriptionChange = (index, value) => {
    const updatedConditions = [...formData.conditions];
    updatedConditions[index].description = value;
    
    setFormData({
      ...formData,
      conditions: updatedConditions
    });
  };
  
  // Handle NFT reward selection
  const handleNFTSelection = (nftId) => {
    setFormData({
      ...formData,
      rewardNftId: nftId
    });
  };
  
  // Apply AI suggestions to form
  const handleAISuggestionsApply = (suggestedData) => {
    console.log('\n=== CREATE PAGE: APPLYING AI SUGGESTIONS ===');
    console.log('Received suggested data:', suggestedData);
    console.log('Current form data before applying:', formData);
    console.log('Suggested conditions:', suggestedData.conditions);
    
    // Apply the suggested data to form
    setFormData(prevData => {
      const newData = {
        ...prevData,
        ...suggestedData,
        // Ensure conditions are properly set
        conditions: suggestedData.conditions || []
      };
      
      console.log('Setting form data to:', newData);
      return newData;
    });
    
    // Clear any form errors when applying AI suggestions
    setErrors({});
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.conditions.length === 0) {
      newErrors.conditions = 'At least one condition is required';
    } else {
      // Check each condition
      const conditionErrors = [];
      
      formData.conditions.forEach((condition, index) => {
        const condError = {};
        
        if (!condition.conditionType) {
          condError.conditionType = 'Condition type is required';
        }
        
        if (['course_completion', 'quiz_score', 'watch_videos', 'take_quiz', 'start_discussion'].includes(condition.conditionType) && !condition.targetId) {
          condError.targetId = 'Target selection is required';
        }
        
        if (Object.keys(condError).length > 0) {
          conditionErrors[index] = condError;
        }
      });
      
      if (conditionErrors.length > 0) {
        newErrors.conditionErrors = conditionErrors;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let token = '';
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('access_token');
      }
      
      console.log('Submitting quest with form data:', formData);
      
      // Try the admin endpoint first for manual quest creation
      const response = await fetch('/api/admin/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create quest');
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/content/quests');
      }, 2000);
    } catch (err) {
      console.error('Failed to create quest:', err);
      setError(err.message || 'Failed to create quest. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render condition selector based on condition type
  const renderConditionSelector = (condition, index) => {
    const conditionType = condition.conditionType;
    
    console.log(`Rendering condition ${index + 1}:`, condition);
    console.log(`Condition type: ${conditionType}, targetId: ${condition.targetId}`);
    
    switch (conditionType) {
      case 'course_completion':
        return (
          <AdminCourseSelector 
            value={condition.targetId}
            onChange={(courseId) => handleConditionTargetChange(index, courseId)}
            error={errors.conditionErrors?.[index]?.targetId}
            helperText={errors.conditionErrors?.[index]?.targetId || 'Select a course to complete'}
          />
        );
        
      case 'quiz_score':
      case 'take_quiz':
        return (
          <>
            <AdminQuizSelector 
              value={condition.targetId}
              onChange={(quizId) => handleConditionTargetChange(index, quizId)}
              error={errors.conditionErrors?.[index]?.targetId}
              helperText={errors.conditionErrors?.[index]?.targetId || 'Select a quiz'}
            />
            {conditionType === 'quiz_score' && (
              <TextField
                label="Required Score (%)"
                type="number"
                value={condition.targetValue}
                onChange={(e) => handleConditionValueChange(index, parseInt(e.target.value) || 0)}
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                fullWidth
                margin="normal"
              />
            )}
          </>
        );
        
      case 'watch_videos':
        console.log(`Rendering video selector for condition ${index + 1}, targetId: ${condition.targetId}`);
        return (
          <AdminVideoSelector 
            value={condition.targetId}
            onChange={(videoId) => handleConditionTargetChange(index, videoId)}
            error={errors.conditionErrors?.[index]?.targetId}
            helperText={errors.conditionErrors?.[index]?.targetId || 'Select a video to watch'}
          />
        );
        
      case 'start_discussion':
        return (
          <AdminTopicSelector 
            value={condition.targetId}
            onChange={(topicId) => handleConditionTargetChange(index, topicId)}
            error={errors.conditionErrors?.[index]?.targetId}
            helperText={errors.conditionErrors?.[index]?.targetId || 'Select a topic for discussion'}
          />
        );
        
      case 'total_points':
        return (
          <TextField
            label="Required Points"
            type="number"
            value={condition.targetValue}
            onChange={(e) => handleConditionValueChange(index, parseInt(e.target.value) || 0)}
            InputProps={{ inputProps: { min: 0 } }}
            fullWidth
            margin="normal"
          />
        );
        
      default:
        return null;
    }
  };
  
  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Quest
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create a new quest with specific conditions and rewards for users to complete.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              icon={<CheckCircleIcon fontSize="inherit" />}
              sx={{ my: 2 }}
            >
              Quest created successfully! Redirecting...
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <StyledFormControl fullWidth error={!!errors.title}>
                  <TextField
                    label="Quest Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={!!errors.title}
                    helperText={errors.title}
                    required
                  />
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <StyledFormControl fullWidth error={!!errors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Category"
                    disabled={categoriesLoading}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.Category} value={cat.Category}>
                        {cat.Category} ({cat.CourseCount} courses)
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <FormHelperText error>
                      {errors.category}
                    </FormHelperText>
                  )}
                  {categoriesLoading && (
                    <FormHelperText>
                      Loading categories...
                    </FormHelperText>
                  )}
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <StyledFormControl fullWidth>
                  <InputLabel>Difficulty Level</InputLabel>
                  <Select
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleInputChange}
                    label="Difficulty Level"
                  >
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                    <MenuItem value="expert">Expert</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12}>
                <StyledFormControl fullWidth error={!!errors.description}>
                  <TextField
                    label="Quest Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    error={!!errors.description}
                    helperText={errors.description}
                    multiline
                    rows={3}
                    required
                  />
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <StyledFormControl fullWidth>
                  <TextField
                    label="Required Points to Start"
                    name="requiredPoints"
                    type="number"
                    value={formData.requiredPoints}
                    onChange={handleInputChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                  <FormHelperText>
                    Points required for a user to start this quest (0 = no requirement)
                  </FormHelperText>
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <StyledFormControl fullWidth>
                  <TextField
                    label="Reward Points"
                    name="rewardPoints"
                    type="number"
                    value={formData.rewardPoints}
                    onChange={handleInputChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                  <FormHelperText>
                    Points awarded to the user upon quest completion
                  </FormHelperText>
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    NFT Reward
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Select an NFT to award to users upon quest completion
                  </Typography>
                  
                  <AdminNFTSelector
                    value={formData.rewardNftId}
                    onChange={handleNFTSelection}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6">
                      Quest Conditions
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={addCondition}
                      >
                        Add Condition
                      </Button>
                      <AIQuestSuggestor 
                        onSuggestionsApply={handleAISuggestionsApply}
                        currentFormData={formData}
                      />
                    </Stack>
                  </Stack>
                  
                  {errors.conditions && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.conditions}
                    </Alert>
                  )}
                  
                  {formData.conditions.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Add at least one condition that users must complete to finish this quest.
                    </Alert>
                  )}
                  
                  {formData.conditions.map((condition, index) => (
                    <ConditionCard key={index}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Condition {index + 1}
                          </Typography>
                          <IconButton 
                            onClick={() => removeCondition(index)} 
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel>Condition Type</InputLabel>
                              <Select
                                value={condition.conditionType}
                                onChange={(e) => handleConditionTypeChange(index, e.target.value)}
                                label="Condition Type"
                                error={!!errors.conditionErrors?.[index]?.conditionType}
                              >
                                <MenuItem value="course_completion">Complete a Course</MenuItem>
                                <MenuItem value="quiz_score">Achieve Quiz Score</MenuItem>
                                <MenuItem value="take_quiz">Take a Quiz</MenuItem>
                                <MenuItem value="watch_videos">Watch a Video</MenuItem>
                                <MenuItem value="start_discussion">Start a Discussion</MenuItem>
                                <MenuItem value="total_points">Earn Total Points</MenuItem>
                              </Select>
                              {errors.conditionErrors?.[index]?.conditionType && (
                                <FormHelperText error>
                                  {errors.conditionErrors[index].conditionType}
                                </FormHelperText>
                              )}
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            {renderConditionSelector(condition, index)}
                          </Grid>
                          
                          <Grid item xs={12}>
                            <TextField
                              label="Condition Description (Optional)"
                              value={condition.description}
                              onChange={(e) => handleConditionDescriptionChange(index, e.target.value)}
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </ConditionCard>
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/admin/content/quests')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || success}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                  >
                    {loading ? 'Creating...' : 'Create Quest'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </MainLayout>
  );
} 