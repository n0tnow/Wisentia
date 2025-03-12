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
  Switch,
  FormControlLabel
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
  Image as ImageIcon
} from '@mui/icons-material';

// Mock education levels
const educationLevels = [
  { value: 1, label: 'Primary' },
  { value: 2, label: 'Secondary' },
  { value: 3, label: 'High School' },
  { value: 4, label: 'University' },
  { value: 5, label: 'Professional' }
];

// Mock categories data
const mockCategories = [
  { id: 1, name: 'Programming', description: 'Programming languages and algorithms', educationLevel: null, iconUrl: '/icons/programming.png', courseCount: 25, active: true },
  { id: 2, name: 'Mathematics', description: 'Basic and advanced mathematics topics', educationLevel: null, iconUrl: '/icons/math.png', courseCount: 18, active: true },
  { id: 3, name: 'Science', description: 'Physics, chemistry and biology', educationLevel: null, iconUrl: '/icons/science.png', courseCount: 15, active: true },
  { id: 4, name: 'Language Learning', description: 'Foreign language education', educationLevel: null, iconUrl: '/icons/language.png', courseCount: 12, active: true },
  { id: 5, name: 'Business', description: 'Business and management education', educationLevel: null, iconUrl: '/icons/business.png', courseCount: 10, active: true },
  { id: 6, name: 'Music', description: 'Music theory and instrument education', educationLevel: null, iconUrl: '/icons/music.png', courseCount: 8, active: true },
  { id: 7, name: 'Art', description: 'Drawing, painting and other art forms', educationLevel: null, iconUrl: '/icons/art.png', courseCount: 7, active: false },
  { id: 8, name: 'History', description: 'World and regional history', educationLevel: null, iconUrl: '/icons/history.png', courseCount: 5, active: true },
  { id: 9, name: 'Philosophy', description: 'Philosophical concepts and critical thinking', educationLevel: 4, iconUrl: '/icons/philosophy.png', courseCount: 4, active: true },
  { id: 10, name: 'Physical Education', description: 'Sports and physical health', educationLevel: 2, iconUrl: '/icons/sports.png', courseCount: 3, active: false },
];

export default function CategoriesManagement() {
  const theme = useTheme();
  const [categories, setCategories] = useState(mockCategories);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [educationLevelFilter, setEducationLevelFilter] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // Menu states
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [targetCategoryId, setTargetCategoryId] = useState(null);
  
  // Form states for category dialog
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    educationLevel: '',
    iconUrl: '',
    active: true
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
  
  // Education level filter handler
  const handleEducationLevelFilterChange = (event) => {
    setEducationLevelFilter(event.target.value);
    setPage(0);
  };
  
  // Refresh categories
  const handleRefreshCategories = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  // Dialog handlers
  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      description: '',
      educationLevel: '',
      iconUrl: '',
      active: true
    });
    setAddDialogOpen(true);
  };
  
  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };
  
  const handleOpenEditDialog = (category) => {
    setCategoryToEdit(category);
    setFormData({
      name: category.name,
      description: category.description,
      educationLevel: category.educationLevel || '',
      iconUrl: category.iconUrl,
      active: category.active
    });
    setEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCategoryToEdit(null);
  };
  
  const handleOpenDeleteDialog = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };
  
  // Menu handlers
  const handleOpenMenu = (event, categoryId) => {
    setMenuAnchorEl(event.currentTarget);
    setTargetCategoryId(categoryId);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setTargetCategoryId(null);
  };
  
  // Form data change handler
  const handleFormChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'active' ? checked : value
    }));
  };
  
  // Save category
  const handleSaveCategory = () => {
    if (addDialogOpen) {
      // Add new category
      const newCategory = {
        id: Math.max(...categories.map(c => c.id)) + 1,
        name: formData.name,
        description: formData.description,
        educationLevel: formData.educationLevel === '' ? null : parseInt(formData.educationLevel),
        iconUrl: formData.iconUrl || '/icons/default.png',
        courseCount: 0,
        active: formData.active
      };
      setCategories([...categories, newCategory]);
      handleCloseAddDialog();
    } else if (editDialogOpen && categoryToEdit) {
      // Update existing category
      const updatedCategories = categories.map(category => 
        category.id === categoryToEdit.id 
          ? {
              ...category,
              name: formData.name,
              description: formData.description,
              educationLevel: formData.educationLevel === '' ? null : parseInt(formData.educationLevel),
              iconUrl: formData.iconUrl,
              active: formData.active
            }
          : category
      );
      setCategories(updatedCategories);
      handleCloseEditDialog();
    }
  };
  
  // Delete category
  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      const filteredCategories = categories.filter(
        category => category.id !== categoryToDelete.id
      );
      setCategories(filteredCategories);
      handleCloseDeleteDialog();
    }
  };
  
  // Toggle category status
  const handleToggleCategoryStatus = (categoryId) => {
    const updatedCategories = categories.map(category => 
      category.id === categoryId 
        ? { ...category, active: !category.active } 
        : category
    );
    setCategories(updatedCategories);
    handleCloseMenu();
  };
  
  // View mode toggle
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  // Filter and sort categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEducationLevel = educationLevelFilter === '' ||
                                  (educationLevelFilter === 'null' && category.educationLevel === null) ||
                                  (category.educationLevel === parseInt(educationLevelFilter));
    
    return matchesSearch && matchesEducationLevel;
  });
  
  // Paginated categories
  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Get education level name
  const getEducationLevelName = (level) => {
    if (level === null) return 'All Levels';
    const educationLevel = educationLevels.find(l => l.value === level);
    return educationLevel ? educationLevel.label : 'Unknown';
  };

  return (
    <Box>
      {/* Page title and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Categories Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            New Category
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshCategories}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Filters and Search */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search Categories"
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
            <InputLabel>Education Level</InputLabel>
            <Select
              value={educationLevelFilter}
              label="Education Level"
              onChange={handleEducationLevelFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="null">All Levels</MenuItem>
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
                <CategoryIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Total: {filteredCategories.length} categories
          </Typography>
        </Box>
      </Paper>
      
      {/* Categories List View */}
      {viewMode === 'list' && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="categories table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Education Level</TableCell>
                  <TableCell align="center">Courses</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : paginatedCategories.length > 0 ? (
                  paginatedCategories.map((category) => (
                    <TableRow 
                      key={category.id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        bgcolor: !category.active ? alpha(theme.palette.action.disabledBackground, 0.3) : 'inherit'
                      }}
                    >
                      <TableCell component="th" scope="row">{category.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={category.iconUrl}
                            alt={category.name}
                            variant="rounded"
                            sx={{ width: 32, height: 32 }}
                          >
                            <CategoryIcon />
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {category.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>{getEducationLevelName(category.educationLevel)}</TableCell>
                      <TableCell align="center">{category.courseCount}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={category.active ? 'Active' : 'Inactive'} 
                          color={category.active ? 'success' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, category.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1">
                        No categories found.
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
            count={filteredCategories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows per page:"
          />
        </Paper>
      )}
      
      {/* Categories Grid View */}
      {viewMode === 'grid' && (
        <Box>
          <Grid container spacing={3}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : paginatedCategories.length > 0 ? (
              paginatedCategories.map((category) => (
                <Grid item key={category.id} xs={12} sm={6} md={4} lg={3}>
                  <Card 
                    elevation={1}
                    sx={{ 
                      height: '100%', 
                      opacity: category.active ? 1 : 0.7,
                      position: 'relative'
                    }}
                  >
                    {!category.active && (
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
                    <CardActionArea sx={{ height: '100%' }}>
                      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          src={category.iconUrl}
                          alt={category.name}
                          variant="rounded"
                          sx={{ width: 80, height: 80 }}
                        >
                          <CategoryIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                      </Box>
                      <CardContent>
                        <Typography variant="h6" component="div" align="center" gutterBottom>
                          {category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                          {category.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                          <Chip 
                            label={getEducationLevelName(category.educationLevel)} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={`${category.courseCount} courses`} 
                            size="small" 
                            color="info" 
                            variant="outlined" 
                          />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenEditDialog(category)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        color={category.active ? 'default' : 'success'}
                        onClick={() => handleToggleCategoryStatus(category.id)}
                      >
                        {category.active ? (
                          <CloseIcon fontSize="small" />
                        ) : (
                          <CheckCircleIcon fontSize="small" />
                        )}
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleOpenDeleteDialog(category)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 4 }}>
                <Typography variant="body1">
                  No categories found.
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination
              rowsPerPageOptions={[8, 16, 32]}
              component="div"
              count={filteredCategories.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Items per page:"
            />
          </Box>
        </Box>
      )}
      
      {/* Add Category Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              autoFocus
            />
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Education Level</InputLabel>
              <Select
                name="educationLevel"
                value={formData.educationLevel}
                label="Education Level"
                onChange={handleFormChange}
              >
                <MenuItem value="">All Levels</MenuItem>
                {educationLevels.map((level) => (
                  <MenuItem key={level.value} value={level.value.toString()}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              id="iconUrl"
              label="Icon URL"
              name="iconUrl"
              value={formData.iconUrl}
              onChange={handleFormChange}
              placeholder="/icons/category.png"
            />
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
              >
                Upload Icon
              </Button>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={handleFormChange}
                    name="active"
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained" 
            disabled={!formData.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Category Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              autoFocus
            />
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Education Level</InputLabel>
              <Select
                name="educationLevel"
                value={formData.educationLevel}
                label="Education Level"
                onChange={handleFormChange}
              >
                <MenuItem value="">All Levels</MenuItem>
                {educationLevels.map((level) => (
                  <MenuItem key={level.value} value={level.value.toString()}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              id="iconUrl"
              label="Icon URL"
              name="iconUrl"
              value={formData.iconUrl}
              onChange={handleFormChange}
              placeholder="/icons/category.png"
            />
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
              >
                Upload Icon
              </Button>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={handleFormChange}
                    name="active"
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained" 
            disabled={!formData.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Category Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {categoryToDelete && (
              <>
                Are you sure you want to delete the category <strong>{categoryToDelete.name}</strong>?
                {categoryToDelete.courseCount > 0 && (
                  <Box component="div" sx={{ mt: 2, color: theme.palette.error.main }}>
                    Warning: This category contains {categoryToDelete.courseCount} courses. Deleting it may affect these courses.
                  </Box>
                )}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteCategory} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Category Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          const category = categories.find(c => c.id === targetCategoryId);
          handleOpenEditDialog(category);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleToggleCategoryStatus(targetCategoryId);
        }}>
          <ListItemIcon>
            {categories.find(c => c.id === targetCategoryId)?.active ? (
              <CloseIcon fontSize="small" />
            ) : (
              <CheckCircleIcon fontSize="small" color="success" />
            )}
          </ListItemIcon>
          <ListItemText>
            {categories.find(c => c.id === targetCategoryId)?.active ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const category = categories.find(c => c.id === targetCategoryId);
          handleOpenDeleteDialog(category);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: theme.palette.error.main }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
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