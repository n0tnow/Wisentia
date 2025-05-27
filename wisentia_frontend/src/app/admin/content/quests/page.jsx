// src/app/admin/content/quests/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

// MUI components
import {
  Box,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery,
  Stack,
  Divider,
  Container,
  Grid
} from '@mui/material';

// MUI icons
import {
  EmojiEvents as QuestIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as ActivateIcon,
  Cancel as DeactivateIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  SmartToy as AIIcon,
  Close as CloseIcon,
  FilterAltOff as FilterAltOffIcon
} from '@mui/icons-material';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function QuestsManagementPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [quests, setQuests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [aiGeneratedFilter, setAiGeneratedFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchQuests = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Filtreler ve arama için query parametreleri
        const queryParams = new URLSearchParams({
          page: page + 1, // API is 1-indexed
          pageSize: pageSize,
          include_inactive: 'true' // Always include inactive quests in admin panel
        });
        
        if (searchTerm) {
          queryParams.append('search', searchTerm);
        }
        
        if (difficultyFilter) {
          queryParams.append('difficulty', difficultyFilter);
        }
        
        if (statusFilter === 'active') {
          queryParams.append('active', 'true');
        } else if (statusFilter === 'inactive') {
          queryParams.append('active', 'false');
        }
        
        if (aiGeneratedFilter === 'true') {
          queryParams.append('aiGenerated', 'true');
        } else if (aiGeneratedFilter === 'false') {
          queryParams.append('aiGenerated', 'false');
        }
        
        console.log(`Fetching quests with params: ${queryParams.toString()}`);
        
        // Use the regular quests API directly since we know it works
        const response = await fetch(`/api/quests?${queryParams.toString()}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Quests API response:', data);
        
        // Process the response 
        const processedData = processFetchedQuests(data);
        setQuests(processedData);
        
        // Set total count for pagination
        setTotalCount(
          data.totalCount || 
          (data.quests && data.quests.length) || 
          (Array.isArray(data) ? data.length : 0)
        );
      } catch (error) {
        console.error('Error loading quests:', error);
        setError('Failed to load quests. Please try again.');
        toast.error('Failed to load quests');
        setQuests([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchQuests();
    }
  }, [user, router, page, pageSize, searchTerm, difficultyFilter, aiGeneratedFilter, statusFilter, refreshTrigger]);

  // Process quests to handle both camelCase and PascalCase property names (backend inconsistency)
  const processFetchedQuests = (data) => {
    // Extract the actual quests array from the response
    let questsData;
    
    if (data.quests && Array.isArray(data.quests)) {
      questsData = data.quests;
    } else if (Array.isArray(data)) {
      questsData = data;
    } else if (data.items && Array.isArray(data.items)) {
      questsData = data.items;
    } else {
      console.warn('Unexpected API response format', data);
      questsData = [];
    }
    
    // Normalize the data
    return questsData.map(quest => {
      // Normalize ID fields
      const id = quest.QuestID || quest.questId || quest.id;
      
      // Normalize boolean values - convert from number (0/1) to boolean if needed
      const isActive = typeof quest.IsActive === 'number' 
        ? Boolean(quest.IsActive) 
        : (typeof quest.isActive === 'number' ? Boolean(quest.isActive) : Boolean(quest.IsActive || quest.isActive || true));
      
      const isAIGenerated = typeof quest.IsAIGenerated === 'number'
        ? Boolean(quest.IsAIGenerated)
        : (typeof quest.isAIGenerated === 'number' ? Boolean(quest.isAIGenerated) : Boolean(quest.IsAIGenerated || quest.isAIGenerated || false));
      
      console.log(`Quest ${id}: Raw active status:`, quest.IsActive, quest.isActive, "Normalized:", isActive);
      
      // Return a normalized quest object with consistent property names
      return {
        id,
        QuestID: id,
        Title: quest.Title || quest.title || '',
        Description: quest.Description || quest.description || '',
        DifficultyLevel: quest.DifficultyLevel || quest.difficultyLevel || quest.difficulty || 'intermediate',
        Category: quest.Category || quest.category || 'General',
        IsActive: isActive,
        isActive: isActive,
        IsAIGenerated: isAIGenerated,
        isAIGenerated: isAIGenerated,
        RequiredPoints: quest.RequiredPoints || quest.requiredPoints || 0,
        RewardPoints: quest.RewardPoints || quest.rewardPoints || 0,
        CreationDate: quest.CreationDate || quest.creationDate || new Date().toISOString(),
        ...quest // Include original properties just in case
      };
    });
  };

  const handleCreateQuest = () => {
    router.push('/admin/content/quests/create');
  };
  
  const handleGenerateQuest = () => {
    router.push('/admin/generate-quest');
  };

  const handleToggleActive = async (questId) => {
    // İlgili görevi bul
    const questToUpdate = quests.find(q => q.QuestID === questId || q.id === questId);
    
    if (!questToUpdate) {
      toast.error('Güncellenmek istenen görev bulunamadı');
      return;
    }
    
    // API'ye gönderilecek güncellenmiş veri
    const updatedData = {
      ...questToUpdate,
      IsActive: !questToUpdate.IsActive,
      isActive: !questToUpdate.IsActive
    };
    
    try {
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Görev durumu güncellenemedi');
      }
      
      // Refresh data instead of manual state update
      setRefreshTrigger(prev => prev + 1);
      toast.success('Görev durumu başarıyla güncellendi');
    } catch (error) {
      console.error('Görev durumu güncellenirken hata:', error);
      toast.error(error.message || 'Görev durumu güncellenirken bir hata oluştu');
    }
  };

  const handleViewQuest = (id) => {
    router.push(`/admin/content/quests/${id}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when search changes
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('');
    setAiGeneratedFilter('');
    setStatusFilter('');
    setPage(0);
  };

  const handleDeleteQuest = async (questId) => {
    try {
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Görev silinemedi');
      }
      
      // Refresh data instead of manual state update
      setRefreshTrigger(prev => prev + 1);
      toast.success('Görev başarıyla silindi');
    } catch (error) {
      console.error('Görev silinirken hata:', error);
      toast.error(error.message || 'Görev silinirken bir hata oluştu');
    }
  };

  // Render loading state
  if (loading && quests.length === 0) {
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
            Loading quests...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  // Render mobile quest card
  const MobileQuestCard = ({ quest }) => (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative'
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          {quest.Title || quest.title}
        </Typography>
        
        <Chip 
          size="small" 
          label={quest.IsActive || quest.isActive ? "Active" : "Inactive"}
          color={quest.IsActive || quest.isActive ? "success" : "default"}
          sx={{ fontWeight: 500 }}
        />
      </Box>
      
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          mb: 2, 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}
      >
        {quest.Description || quest.description}
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip 
          size="small" 
          label={quest.DifficultyLevel || quest.difficultyLevel || 'Unknown'} 
          color={
            (quest.DifficultyLevel === 'easy' || quest.difficultyLevel === 'easy') ? 'success' :
            (quest.DifficultyLevel === 'medium' || quest.difficultyLevel === 'medium') ? 'warning' :
            (quest.DifficultyLevel === 'hard' || quest.difficultyLevel === 'hard') ? 'error' : 'default'
          }
          variant="outlined"
        />
        
        {(quest.IsAIGenerated || quest.isAIGenerated) && (
          <Chip 
            size="small" 
            label="AI Generated"
            color="info"
            variant="outlined"
          />
        )}
        
        <Chip 
          size="small" 
          icon={<EmojiEventsIcon />}
          label={`${quest.RewardPoints || quest.rewardPoints || 0} XP`}
          variant="outlined"
        />
      </Box>
      
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button 
          size="small"
          startIcon={<ViewIcon />}
          onClick={() => handleViewQuest(quest.QuestID || quest.questId || quest.id)}
        >
          View
        </Button>
        
        <Button 
          size="small"
          startIcon={quest.IsActive || quest.isActive ? <DeactivateIcon /> : <ActivateIcon />}
          color={quest.IsActive || quest.isActive ? "error" : "success"}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleActive(quest.QuestID || quest.questId || quest.id);
          }}
        >
          {quest.IsActive || quest.isActive ? "Deactivate" : "Activate"}
        </Button>
        
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            setQuestToDelete(quest.QuestID || quest.questId || quest.id);
            setDeleteDialogOpen(true);
          }}
        >
          Delete
        </Button>
      </Stack>
    </Paper>
  );

  // Filters section to display above content area
  const FiltersSection = () => (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              label="Difficulty"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Source</InputLabel>
            <Select
              value={aiGeneratedFilter}
              onChange={(e) => setAiGeneratedFilter(e.target.value)}
              label="Source"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">AI Generated</MenuItem>
              <MenuItem value="false">Manual</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            startIcon={<FilterAltOffIcon />} 
            onClick={handleClearFilters}
            disabled={!searchTerm && !difficultyFilter && !aiGeneratedFilter && !statusFilter}
            variant="outlined"
            color="secondary"
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ mt: 6, mb: 6, px: { xs: 2, sm: 3, md: 4 } }}>
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
                  fontSize: { xs: '1.7rem', sm: '2rem', md: '2.125rem' },
                  mb: 1,
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    width: '40%',
                    height: '4px',
                    bottom: '-8px',
                    left: 0,
                    backgroundColor: theme.palette.secondary.main,
                    borderRadius: '2px'
                  }
                }}
              >
                Quest Management
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>
                Manage challenges and missions for platform users
              </Typography>
            </Box>
          </Fade>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AIIcon />}
                onClick={handleGenerateQuest}
                sx={{ 
                  px: 2,
                  py: 1,
                  borderRadius: '30px',
                  fontWeight: 'medium',
                  width: { xs: '100%', sm: 'auto' },
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }
                }}
              >
                Generate with AI
              </Button>
            </Zoom>
            <Zoom in={true} style={{ transitionDelay: '300ms' }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={handleCreateQuest}
                sx={{ 
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.2 },
                  borderRadius: '30px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  width: { xs: '100%', sm: 'auto' },
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                  }
                }}
              >
                Create Quest
              </Button>
            </Zoom>
          </Stack>
        </Box>

        {/* Error Alert */}
        {error && (
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
            sx={{ mb: 3, borderRadius: '8px' }}
          >
            {error}
          </Alert>
        )}

        {/* Filters Section */}
        <FiltersSection />

        {/* Quests Table or Mobile Cards */}
        {!isMobile ? (
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <TableContainer 
              sx={{ 
                width: '100%', 
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.3),
                  }
                }
              }}
            >
              <Table>
                <TableHead sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Difficulty</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Points</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>AI Generated</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quests.length > 0 ? (
                    quests.map((quest) => (
                      <TableRow 
                        key={quest.QuestID || quest.id} 
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.05)
                          } 
                        }}
                        onClick={() => handleViewQuest(quest.QuestID || quest.id)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {quest.Title || quest.title || 'Untitled Quest'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={quest.DifficultyLevel || quest.difficultyLevel || 'Unknown'} 
                            color={
                              (quest.DifficultyLevel === 'easy' || quest.difficultyLevel === 'easy') ? 'success' :
                              (quest.DifficultyLevel === 'medium' || quest.difficultyLevel === 'medium') ? 'warning' :
                              (quest.DifficultyLevel === 'hard' || quest.difficultyLevel === 'hard') ? 'error' : 'default'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={quest.IsAIGenerated || quest.isAIGenerated ? 'AI Generated' : 'Manual'}
                            color={quest.IsAIGenerated || quest.isAIGenerated ? 'info' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{quest.RequiredPoints || quest.requiredPoints || 0}</TableCell>
                        <TableCell>{quest.RewardPoints || quest.rewardPoints || 0}</TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={quest.IsActive || quest.isActive ? "Active" : "Inactive"}
                            color={quest.IsActive || quest.isActive ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewQuest(quest.QuestID || quest.id);
                                }}
                                sx={{ mr: 1 }}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={quest.IsActive || quest.isActive ? "Deactivate" : "Activate"}>
                              <IconButton 
                                size="small"
                                color={quest.IsActive || quest.isActive ? "error" : "success"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleActive(quest.QuestID || quest.id);
                                }}
                              >
                                {quest.IsActive || quest.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuestToDelete(quest.QuestID || quest.id);
                                  setDeleteDialogOpen(true);
                                }}
                                sx={{ ml: 1 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                          No quests found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                          {searchTerm || difficultyFilter || aiGeneratedFilter || statusFilter 
                            ? 'Try clearing filters or creating a new quest'
                            : 'Start by creating a new quest manually or generate with AI'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<AIIcon />}
                            onClick={handleGenerateQuest}
                            sx={{ borderRadius: '30px' }}
                          >
                            Generate with AI
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<AddIcon />}
                            onClick={handleCreateQuest}
                            sx={{ borderRadius: '30px' }}
                          >
                            Create Quest
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            {quests.length > 0 && (
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={pageSize}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 20, 50]}
              />
            )}
          </Paper>
        ) : (
          /* Mobile view */
          <Box>
            {quests.length > 0 ? (
              <>
                {quests.map((quest) => (
                  <MobileQuestCard key={quest.QuestID} quest={quest} />
                ))}
                
                {/* Pagination for mobile */}
                <TablePagination
                  component="div"
                  count={totalCount}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={pageSize}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 20]}
                  sx={{ 
                    mt: 2,
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                      display: { xs: 'none', sm: 'block' }
                    }
                  }}
                />
              </>
            ) : (
              <Paper
                elevation={2}
                sx={{ 
                  p: 3, 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No quests found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                  {searchTerm || difficultyFilter || aiGeneratedFilter || statusFilter 
                    ? 'Try clearing filters or creating a new quest'
                    : 'Start by creating a new quest manually or generate with AI'}
                </Typography>
                <Stack spacing={2} sx={{ width: '100%' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateQuest}
                    fullWidth
                    sx={{ borderRadius: '30px' }}
                  >
                    Create Quest
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<AIIcon />}
                    onClick={handleGenerateQuest}
                    fullWidth
                    sx={{ borderRadius: '30px' }}
                  >
                    Generate with AI
                  </Button>
                </Stack>
              </Paper>
            )}
          </Box>
        )}
      </Container>
    </MainLayout>
  );
}