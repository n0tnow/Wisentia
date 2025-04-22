// src/app/admin/content/quests/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';

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
  Grid,
  Stack,
  Divider
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
  SmartToy as AIIcon
} from '@mui/icons-material';

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
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          page: page + 1,
          pageSize,
          search: searchTerm,
          difficulty: difficultyFilter,
          aiGenerated: aiGeneratedFilter,
          status: statusFilter
        });

        const response = await fetch(`/api/admin/quests?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quests');
        }

        const data = await response.json();
        setQuests(data.quests || []);
        setTotalCount(data.totalCount || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchQuests();
    }
  }, [user, router, page, pageSize, searchTerm, difficultyFilter, aiGeneratedFilter, statusFilter]);

  const handleCreateQuest = () => {
    router.push('/admin/quest/create');
  };
  
  const handleGenerateQuest = () => {
    router.push('/admin/generate-quest');
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const response = await fetch(`/api/quests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quest');
      }

      // Update quest in list
      setQuests(quests.map(quest => 
        quest.QuestID === id 
          ? { ...quest, IsActive: !isActive } 
          : quest
      ));
    } catch (err) {
      alert(`Error: ${err.message}`);
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
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setDifficultyFilter('');
    setAiGeneratedFilter('');
    setStatusFilter('');
    setPage(0);
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
        borderLeft: quest.IsActive ? '4px solid #4caf50' : '4px solid #f44336',
      }}
    >
      <Grid container spacing={1}>
        <Grid item xs={12} sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                mr: 2,
                bgcolor: quest.IsAIGenerated ? theme.palette.info.light : theme.palette.secondary.main
              }}
            >
              {quest.IsAIGenerated ? <AIIcon fontSize="small" /> : <QuestIcon fontSize="small" />}
            </Avatar>
            <Typography 
              variant="subtitle1" 
              fontWeight="medium"
              sx={{ '&:hover': { color: theme.palette.secondary.main }, cursor: 'pointer' }}
              onClick={() => handleViewQuest(quest.QuestID)}
            >
              {quest.Title}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Difficulty</Typography>
          <Box>
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
          </Box>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Created</Typography>
          <Typography variant="body2">
            {new Date(quest.CreationDate).toLocaleDateString()}
          </Typography>
        </Grid>
        
        <Grid item xs={12} sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Points</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 0.5, gap: 1 }}>
                <Chip 
                  label={`Required: ${quest.RequiredPoints}`} 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                  sx={{ height: 24 }}
                />
                <Chip 
                  label={`Reward: ${quest.RewardPoints}`}
                  size="small" 
                  color="primary"
                  sx={{ height: 24 }}
                />
              </Box>
            </Box>
            <Chip 
              label={quest.IsAIGenerated ? 'AI Generated' : 'Manual'}
              color={quest.IsAIGenerated ? 'info' : 'default'}
              size="small"
              variant={quest.IsAIGenerated ? 'filled' : 'outlined'}
            />
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
        <Tooltip title="View Details">
          <IconButton 
            size="small" 
            color="secondary"
            onClick={() => handleViewQuest(quest.QuestID)}
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
      </Box>
    </Paper>
  );

  return (
    <MainLayout>
      <Box sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
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
                    background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.dark} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Quest Management
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
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
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'medium',
                    width: { xs: '100%', sm: 'auto' }
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
                    borderRadius: 2,
                    boxShadow: 3,
                    background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.dark} 90%)`,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    width: { xs: '100%', sm: 'auto' }
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
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          {/* Filters */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: { xs: 1.5, md: 2 }, 
              mb: 3, 
              borderRadius: 2
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  placeholder="Search quests..."
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={6} sm={4} md={2}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel id="difficulty-filter-label">Difficulty</InputLabel>
                  <Select
                    labelId="difficulty-filter-label"
                    id="difficulty-filter"
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    label="Difficulty"
                  >
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={4} md={2}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel id="ai-filter-label">AI Generated</InputLabel>
                  <Select
                    labelId="ai-filter-label"
                    id="ai-filter"
                    value={aiGeneratedFilter}
                    onChange={(e) => setAiGeneratedFilter(e.target.value)}
                    label="AI Generated"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">AI Generated</MenuItem>
                    <MenuItem value="false">Manually Created</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={4} md={2}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={12} md={2}>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  startIcon={<FilterIcon />}
                  onClick={handleClearFilters}
                  size="medium"
                  fullWidth
                  sx={{ height: '100%', maxHeight: 40 }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Quests Table or Mobile Cards */}
          {!isMobile ? (
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 2, 
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
                                {quest.IsAIGenerated ? <AIIcon fontSize="small" /> : <QuestIcon fontSize="small" />}
                              </Avatar>
                              <Typography 
                                variant="body1" 
                                fontWeight="medium"
                                sx={{ '&:hover': { color: theme.palette.secondary.main }, cursor: 'pointer' }}
                                onClick={() => handleViewQuest(quest.QuestID)}
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
                            <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                              <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                Req:
                              </Typography>
                              <Chip 
                                label={quest.RequiredPoints} 
                                size="small" 
                                variant="outlined" 
                                color="primary"
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>
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
                                onClick={() => handleViewQuest(quest.QuestID)}
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
                            >
                              Generate with AI
                            </Button>
                            <Button
                              variant="contained"
                              color="secondary"
                              startIcon={<AddIcon />}
                              onClick={handleCreateQuest}
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
                    borderRadius: 2, 
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
                    >
                      Create Quest
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<AIIcon />}
                      onClick={handleGenerateQuest}
                      fullWidth
                    >
                      Generate with AI
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
}