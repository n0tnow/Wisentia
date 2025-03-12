'use client';
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Pagination,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon, 
  EmojiEvents as QuestIcon,
  AccessTime as TimeIcon,
  Stars as PointsIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function QuestsPage() {
  const { isAuthenticated } = useAuth();
  const [quests, setQuests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category_id: '',
    education_level: '',
    is_active: 'true',
    search: ''
  });
  const [page, setPage] = useState(1);
  const questsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, fetch from API
        // For now, use placeholder data
        const categoriesData = [
          { CategoryID: 1, Name: 'Computer Science' },
          { CategoryID: 2, Name: 'Mathematics' },
          { CategoryID: 3, Name: 'Physics' }
        ];
        
        const questsData = [
          { QuestID: 1, Title: 'Programming Challenge', Description: 'Solve programming problems.', CategoryID: 1, CategoryName: 'Computer Science', DifficultyLevel: 2, Points: 150, TimeLimitMinutes: 30, IsActive: true },
          { QuestID: 2, Title: 'Math Quest', Description: 'Test your mathematical skills.', CategoryID: 2, CategoryName: 'Mathematics', DifficultyLevel: 3, Points: 200, TimeLimitMinutes: 45, IsActive: true },
          { QuestID: 3, Title: 'Physics Experiment', Description: 'Apply physics principles.', CategoryID: 3, CategoryName: 'Physics', DifficultyLevel: 4, Points: 250, TimeLimitMinutes: 60, IsActive: true },
          { QuestID: 4, Title: 'Coding Basics', Description: 'Review programming fundamentals.', CategoryID: 1, CategoryName: 'Computer Science', DifficultyLevel: 1, Points: 100, TimeLimitMinutes: 20, IsActive: true },
          { QuestID: 5, Title: 'Algorithm Challenge', Description: 'Design efficient algorithms.', CategoryID: 1, CategoryName: 'Computer Science', DifficultyLevel: 3, Points: 200, TimeLimitMinutes: 40, IsActive: true },
          { QuestID: 6, Title: 'Calculus Problems', Description: 'Solve calculus exercises.', CategoryID: 2, CategoryName: 'Mathematics', DifficultyLevel: 4, Points: 250, TimeLimitMinutes: 50, IsActive: true }
        ];
        
        setCategories(categoriesData);
        setQuests(questsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const filteredQuests = quests.filter(quest => {
    // Filter by active status
    if (filters.is_active === 'true' && !quest.IsActive) {
      return false;
    }
    
    // Filter by category
    if (filters.category_id && quest.CategoryID.toString() !== filters.category_id) {
      return false;
    }
    
    // Filter by education level
    if (filters.education_level && quest.EducationLevel && quest.EducationLevel.toString() !== filters.education_level) {
      return false;
    }
    
    // Filter by search term
    if (filters.search && !quest.Title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Pagination
  const pageCount = Math.ceil(filteredQuests.length / questsPerPage);
  const displayedQuests = filteredQuests.slice(
    (page - 1) * questsPerPage,
    page * questsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDifficultyLabel = (level) => {
    const levels = {
      1: 'Beginner',
      2: 'Elementary',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    return levels[level] || 'Unknown';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Quests
      </Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                name="category_id"
                value={filters.category_id}
                label="Category"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.CategoryID} value={category.CategoryID.toString()}>
                    {category.Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="education-level-filter-label">Education Level</InputLabel>
              <Select
                labelId="education-level-filter-label"
                name="education_level"
                value={filters.education_level}
                label="Education Level"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="1">Primary</MenuItem>
                <MenuItem value="2">Secondary</MenuItem>
                <MenuItem value="3">High School</MenuItem>
                <MenuItem value="4">University</MenuItem>
                <MenuItem value="5">Professional</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              size="small"
              name="search"
              label="Search Quests"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Quest List */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : displayedQuests.length > 0 ? (
        <>
          <Grid container spacing={4}>
            {displayedQuests.map((quest) => (
              <Grid item key={quest.QuestID} xs={12} sm={6}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {quest.Title}
                      </Typography>
                      <Chip 
                        label={getDifficultyLabel(quest.DifficultyLevel)} 
                        color="secondary" 
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {quest.Description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Chip 
                        icon={<TimeIcon />} 
                        label={`${quest.TimeLimitMinutes} min`} 
                        variant="outlined" 
                        size="small"
                      />
                      <Chip 
                        icon={<PointsIcon />} 
                        label={`${quest.Points} points`} 
                        variant="outlined" 
                        color="primary"
                        size="small"
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body2" color="text.secondary">
                      Category: {quest.CategoryName}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      component={Link} 
                      href={`/quests/${quest.QuestID}`}
                    >
                      View Details
                    </Button>
                    {isAuthenticated && (
                      <Button 
                        size="small" 
                        color="primary"
                        variant="contained"
                        component={Link} 
                        href={`/quests/${quest.QuestID}`}
                        sx={{ ml: 'auto' }}
                      >
                        Take Quest
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={pageCount} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No quests found matching your criteria</Typography>
          <Button 
            variant="text" 
            color="primary" 
            onClick={() => setFilters({ category_id: '', education_level: '', is_active: 'true', search: '' })}
            sx={{ mt: 2 }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Container>
  );
}