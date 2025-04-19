// src/app/admin/users/page.jsx
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// MUI components
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, TextField,
  Button, IconButton, Chip, Avatar, MenuItem, Select, FormControl,
  InputLabel, Grid, Tooltip, CircularProgress, Alert, Snackbar,
  Divider, useTheme, ToggleButtonGroup, ToggleButton, Checkbox,
  InputAdornment, ListItemIcon, Menu, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Slide, Zoom, Fade, Grow,
  styled, alpha, Stack, Switch
} from '@mui/material';

// MUI Icons
import {
  Visibility as ViewIcon,
  CheckCircle as ActivateIcon,
  Cancel as DeactivateIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Mail as MailIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  PeopleAlt as PeopleAltIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  DoNotDisturb as DoNotDisturbIcon,
  HowToReg as HowToRegIcon,
  VpnKey as VpnKeyIcon,
  DeleteSweep as DeleteSweepIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';

// ================= STYLED COMPONENTS =================
const StyledComponent = styled(Box)(({ theme }) => ({
  transition: 'all 0.3s',
  borderRadius: 12,
}));

const StyledCard = styled(Card)(({ theme, color = 'primary' }) => ({
  height: '100%',
  borderRadius: 16,
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px 0 rgba(0,0,0,0.1)',
  },
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden'
}));

const CardHeaderBox = styled(Box)(({ theme, color = 'primary' }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 8,
  background: theme.palette[color]?.main || theme.palette.primary.main,
}));

const CardIconContainer = styled(Box)(({ theme, color = 'primary' }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 64,
  height: 64,
  borderRadius: 16,
  backgroundColor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.12),
  color: theme.palette[color]?.main || theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: 'all 0.3s',
  borderRadius: 10,
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
  }
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.3s',
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
    }
  }
}));

const UserGridCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: 16,
  transition: 'transform 0.3s, box-shadow 0.3s',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px 0 rgba(0,0,0,0.1)',
  }
}));

const DialogHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  borderRadius: '16px 16px 0 0',
}));

const ExportButton = styled(Button)(({ theme, color = 'primary' }) => ({
  borderRadius: 10,
  padding: theme.spacing(1, 3),
  transition: 'all 0.3s',
  backgroundColor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1),
  color: theme.palette[color]?.main || theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.2)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.15),
    transform: 'translateY(-3px)',
    boxShadow: `0 8px 15px ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.15)}`,
  }
}));

// Main Component
export default function UserManagementPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  // State definitions
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [viewMode, setViewMode] = useState('table');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: null });
  const [newUserDialog, setNewUserDialog] = useState(false);
  const [newUserFormData, setNewUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'regular',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  // Load users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: page + 1,
        pageSize,
      });

      if (search) queryParams.append('search', search);
      if (roleFilter) queryParams.append('role', roleFilter);
      
      console.log(`Fetching users: /api/admin/users?${queryParams.toString()}`);
      
      const response = await fetch(`/api/admin/users?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        
        if (response.status === 401 || response.status === 403) {
          setSnackbar({
            open: true,
            message: 'Session expired. Please log in again.',
            severity: 'error'
          });
          
          setTimeout(() => {
            router.push('/login?redirect=/admin/users');
          }, 2000);
          
          throw new Error('Authentication error');
        }
        
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      setUsers(data.users || []);
      setTotalUsers(data.totalCount || 0);
      setError(null);
      
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.message);
      
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, roleFilter, router]);

  // View user details
  const handleViewUser = (userId) => {
    setSnackbar({
      open: true,
      message: 'Loading user details...',
      severity: 'info'
    });
    router.push(`/admin/users/${userId}`);
  };

  // Toggle user active status
  const handleToggleActive = async (userId, isActive) => {
    try {
      setSnackbar({
        open: true,
        message: 'Processing...',
        severity: 'info'
      });
      
      const response = await fetch(`/api/admin/users/${userId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }

      setUsers(users.map(u => 
        u.UserID === userId ? { ...u, IsActive: !isActive } : u
      ));
      
      setSnackbar({
        open: true,
        message: `User successfully ${!isActive ? 'activated' : 'deactivated'}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Status toggle error:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    }
  };

  // Bulk toggle user active status
  const handleBulkToggleActive = async (makeActive) => {
    if (selectedUsers.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select users first',
        severity: 'warning'
      });
      return;
    }

    try {
      setSnackbar({
        open: true,
        message: 'Updating user status in bulk...',
        severity: 'info'
      });
      
      // In a real app, API call would be made here
      
      const updatedUsers = users.map(user => 
        selectedUsers.includes(user.UserID) 
          ? { ...user, IsActive: makeActive } 
          : user
      );
      
      setUsers(updatedUsers);
      
      setSnackbar({
        open: true,
        message: `${selectedUsers.length} users successfully ${makeActive ? 'activated' : 'deactivated'}`,
        severity: 'success'
      });
      
      setSelectedUsers([]);
      
    } catch (error) {
      console.error('Bulk status update error:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Change user role
  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'regular' : 'admin';
    try {
      setSnackbar({
        open: true,
        message: 'Processing...',
        severity: 'info'
      });
      
      const response = await fetch(`/api/admin/users/${userId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRole: newRole }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Role update failed: ${response.status}`);
      }

      setUsers(users.map(u => 
        u.UserID === userId ? { ...u, UserRole: newRole } : u
      ));
      
      setSnackbar({
        open: true,
        message: `User role successfully changed to '${newRole}'`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Role change error:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    }
  };

  // Search 
  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
    
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setPage(0);
      fetchUsers();
    }, 500);
    setSearchTimeout(timeout);
  };

  // Change page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Change rows per page
  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };
  
  // Change view mode
  const handleChangeViewMode = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  // Selection handlers
  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const filteredUserIds = getFilteredUsers().map(user => user.UserID);
      setSelectedUsers(filteredUserIds);
    } else {
      setSelectedUsers([]);
    }
  };
  
  // Status filter
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  // User menu
  const handleUserMenuOpen = (event, userId) => {
    setMenuAnchorEl(event.currentTarget);
    setActionTarget(userId);
  };
  
  const handleUserMenuClose = () => {
    setMenuAnchorEl(null);
    setActionTarget(null);
  };
  
  // Filter menu
  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };
  
  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };
  
  // Export functions
  const handleExport = (format) => {
    setSnackbar({
      open: true,
      message: `Exporting users as ${format.toUpperCase()}...`,
      severity: 'info'
    });
    
    let content, fileName, contentType;
    
    switch(format) {
      case 'csv':
        const headers = ['ID', 'Username', 'Email', 'Role', 'Join Date', 'Status', 'Points'];
        const csvData = users.map(user => [
          user.UserID,
          user.Username,
          user.Email,
          user.UserRole,
          new Date(user.JoinDate).toLocaleDateString(),
          user.IsActive ? 'Active' : 'Inactive',
          user.TotalPoints || 0
        ]);
        
        content = [
          headers.join(','),
          ...csvData.map(row => row.join(','))
        ].join('\n');
        
        fileName = 'wisentia_users.csv';
        contentType = 'text/csv;charset=utf-8;';
        break;
        
      case 'json':
        content = JSON.stringify(users, null, 2);
        fileName = 'wisentia_users.json';
        contentType = 'application/json;charset=utf-8;';
        break;
        
      default: // excel
        const excelHeaders = ['ID', 'Username', 'Email', 'Role', 'Join Date', 'Status', 'Points'];
        const excelData = users.map(user => [
          user.UserID,
          user.Username,
          user.Email,
          user.UserRole,
          new Date(user.JoinDate).toLocaleDateString(),
          user.IsActive ? 'Active' : 'Inactive',
          user.TotalPoints || 0
        ]);
        
        content = `
        <table>
          <tr>${excelHeaders.map(header => `<th>${header}</th>`).join('')}</tr>
          ${excelData.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </table>
        `;
        
        fileName = 'wisentia_users.xls';
        contentType = 'application/vnd.ms-excel;charset=utf-8;';
    }
    
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbar({
      open: true,
      message: `Users successfully exported as ${format.toUpperCase()}`,
      severity: 'success'
    });
  };
  
  // Delete user
  const handleDeleteUser = (userId) => {
    setConfirmDialog({
      open: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      action: () => {
        // In a real app, API call would be made here
        
        setUsers(users.filter(user => user.UserID !== userId));
        
        setSnackbar({
          open: true,
          message: 'User successfully deleted',
          severity: 'success'
        });
        
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };
  
  // Bulk delete users
  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select users first',
        severity: 'warning'
      });
      return;
    }
    
    setConfirmDialog({
      open: true,
      title: 'Bulk Delete Users',
      message: `Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`,
      action: () => {
        // In a real app, API call would be made here
        
        setUsers(users.filter(user => !selectedUsers.includes(user.UserID)));
        
        setSnackbar({
          open: true,
          message: `${selectedUsers.length} users successfully deleted`,
          severity: 'success'
        });
        
        setSelectedUsers([]);
        
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };
  
  // New user dialog
  const handleNewUserDialogOpen = () => {
    setNewUserFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'regular',
      isActive: true
    });
    setFormErrors({});
    setNewUserDialog(true);
  };
  
  const handleNewUserDialogClose = () => {
    setNewUserDialog(false);
  };
  
  const handleNewUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUserFormData({
      ...newUserFormData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const validateNewUserForm = () => {
    const errors = {};
    
    if (!newUserFormData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!newUserFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUserFormData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!newUserFormData.password) {
      errors.password = 'Password is required';
    } else if (newUserFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (newUserFormData.password !== newUserFormData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleCreateNewUser = async () => {
    if (!validateNewUserForm()) {
      return;
    }
    
    try {
      setSnackbar({
        open: true,
        message: 'Creating new user...',
        severity: 'info'
      });
      
      // In a real app, API call would be made here
      
      const newUser = {
        UserID: Math.floor(Math.random() * 10000),
        Username: newUserFormData.username,
        Email: newUserFormData.email,
        UserRole: newUserFormData.role,
        JoinDate: new Date().toISOString(),
        IsActive: newUserFormData.isActive,
        TotalPoints: 0
      };
      
      setUsers([newUser, ...users]);
      setTotalUsers(totalUsers + 1);
      
      setSnackbar({
        open: true,
        message: 'New user successfully created',
        severity: 'success'
      });
      
      handleNewUserDialogClose();
      
    } catch (error) {
      console.error('New user creation error:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };
  
  // Get filtered users
  const getFilteredUsers = () => {
    let filteredUsers = [...users];
    
    if (statusFilter === 'active') {
      filteredUsers = filteredUsers.filter(user => user.IsActive);
    } else if (statusFilter === 'inactive') {
      filteredUsers = filteredUsers.filter(user => !user.IsActive);
    }
    
    return filteredUsers;
  };

  // Load data when component mounts
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload data when page or page size changes
  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
    
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [page, pageSize, fetchUsers]);

  // Loading state
  if (loading && users.length === 0) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          width: '100%',
          background: theme.palette.background.default
        }}
      >
        <CircularProgress size={70} thickness={5} sx={{ mb: 3 }} />
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
          Loading Users
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please wait...
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: { xs: 2, md: 3 }, 
        width: '100%',
        background: theme.palette.background.default,
        minHeight: '100vh'
      }}
    >
      {/* Error Message */}
      {error && (
        <Grow in={!!error}>
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchUsers}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Grow>
      )}

      {/* Page Title */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: { xs: 'flex-start', md: 'center' }, 
        justifyContent: 'space-between',
        mb: 4,
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 0 }
      }}>
        <Fade in={true} timeout={800}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="bold" 
              sx={{ 
                mb: 1,
                background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              User Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage platform users, roles, and permissions
            </Typography>
          </Box>
        </Fade>
        
        <Zoom in={true} style={{ transitionDelay: '300ms' }}>
          <AnimatedButton
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleNewUserDialogOpen}
            sx={{ 
              px: 3,
              py: 1.5,
              background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
              boxShadow: '0 6px 15px rgba(63, 81, 181, 0.3)'
            }}
          >
            Add New User
          </AnimatedButton>
        </Zoom>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4, width: '100%' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={600}>
            <StyledCard>
              <CardHeaderBox color="primary" />
              <CardContent sx={{ height: '100%', pt: 4, pb: 3, display: 'flex', flexDirection: 'column' }}>
                <CardIconContainer color="primary">
                  <PeopleAltIcon sx={{ fontSize: 32 }} />
                </CardIconContainer>
                
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h3" sx={{ my: 1.5, fontWeight: 'bold' }}>
                  {totalUsers.toLocaleString()}
                </Typography>
                <Chip 
                  color="primary" 
                  label="View All" 
                  size="small" 
                  sx={{ 
                    maxWidth: 'fit-content', 
                    mt: 'auto',
                    fontWeight: 'medium',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('');
                    setStatusFilter('all');
                    setPage(0);
                    fetchUsers();
                  }}
                />
              </CardContent>
            </StyledCard>
          </Grow>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={800}>
            <StyledCard>
              <CardHeaderBox color="success" />
              <CardContent sx={{ height: '100%', pt: 4, pb: 3, display: 'flex', flexDirection: 'column' }}>
                <CardIconContainer color="success">
                  <HowToRegIcon sx={{ fontSize: 32 }} />
                </CardIconContainer>
                
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Active Users
                </Typography>
                <Typography variant="h3" sx={{ my: 1.5, fontWeight: 'bold', color: 'success.main' }}>
                  {users.filter(u => u.IsActive).length.toLocaleString()}
                </Typography>
                <Chip 
                  color="success" 
                  label="Show Active" 
                  size="small" 
                  sx={{ 
                    maxWidth: 'fit-content', 
                    mt: 'auto',
                    fontWeight: 'medium',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => {
                    setStatusFilter('active');
                    setPage(0);
                  }}
                />
              </CardContent>
            </StyledCard>
          </Grow>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={1000}>
            <StyledCard>
              <CardHeaderBox color="secondary" />
              <CardContent sx={{ height: '100%', pt: 4, pb: 3, display: 'flex', flexDirection: 'column' }}>
                <CardIconContainer color="secondary">
                  <AdminIcon sx={{ fontSize: 32 }} />
                </CardIconContainer>
                
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Admin Users
                </Typography>
                <Typography variant="h3" sx={{ my: 1.5, fontWeight: 'bold', color: 'secondary.main' }}>
                  {users.filter(u => u.UserRole === 'admin').length.toLocaleString()}
                </Typography>
                <Chip 
                  color="secondary" 
                  label="Show Admins" 
                  size="small" 
                  sx={{ 
                    maxWidth: 'fit-content', 
                    mt: 'auto',
                    fontWeight: 'medium',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => {
                    setRoleFilter('admin');
                    setPage(0);
                    fetchUsers();
                  }}
                />
              </CardContent>
            </StyledCard>
          </Grow>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={1200}>
            <StyledCard>
              <CardHeaderBox color="error" />
              <CardContent sx={{ height: '100%', pt: 4, pb: 3, display: 'flex', flexDirection: 'column' }}>
                <CardIconContainer color="error">
                  <DoNotDisturbIcon sx={{ fontSize: 32 }} />
                </CardIconContainer>
                
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Inactive Users
                </Typography>
                <Typography variant="h3" sx={{ my: 1.5, fontWeight: 'bold', color: 'error.main' }}>
                  {users.filter(u => !u.IsActive).length.toLocaleString()}
                </Typography>
                <Chip 
                  color="error" 
                  label="Show Inactive" 
                  size="small" 
                  sx={{ 
                    maxWidth: 'fit-content', 
                    mt: 'auto',
                    fontWeight: 'medium',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => {
                    setStatusFilter('inactive');
                    setPage(0);
                  }}
                />
              </CardContent>
            </StyledCard>
          </Grow>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Fade in={true} timeout={800}>
        <Card 
          sx={{ 
            mb: 3, 
            borderRadius: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            overflow: 'visible',
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <SearchTextField
                  fullWidth
                  placeholder="Search by username, email or ID..."
                  variant="outlined"
                  value={search}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: search && (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSearch('');
                            setPage(0);
                            fetchUsers();
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="role-filter-label">Role</InputLabel>
                  <Select
                    labelId="role-filter-label"
                    label="Role"
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(0);
                      fetchUsers();
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Roles</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="regular">Regular</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    label="Status"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={3} md={1}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleChangeViewMode}
                  aria-label="view mode"
                  fullWidth
                  size="medium"
                  sx={{ height: '100%' }}
                >
                  <ToggleButton value="table" aria-label="table view">
                    <ListViewIcon />
                  </ToggleButton>
                  <ToggleButton value="grid" aria-label="grid view">
                    <GridViewIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              
              <Grid item xs={6} sm={3} md={1}>
                <AnimatedButton 
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={handleFilterMenuOpen}
                  startIcon={<FilterListIcon />}
                  sx={{ height: '100%' }}
                >
                  Filter
                </AnimatedButton>
                <Menu
                  anchorEl={filterMenuAnchor}
                  open={Boolean(filterMenuAnchor)}
                  onClose={handleFilterMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: { 
                      borderRadius: 2,
                      width: 220,
                      mt: 1.5,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <MenuItem 
                    onClick={() => {
                      setSearch('');
                      setRoleFilter('');
                      setStatusFilter('all');
                      setPage(0);
                      fetchUsers();
                      handleFilterMenuClose();
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      <RefreshIcon fontSize="small" />
                    </ListItemIcon>
                    Reset Filters
                  </MenuItem>
                  <Divider />
                  <MenuItem 
                    onClick={() => {
                      setRoleFilter('admin');
                      setPage(0);
                      fetchUsers();
                      handleFilterMenuClose();
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      <AdminIcon fontSize="small" color="secondary" />
                    </ListItemIcon>
                    Admins Only
                  </MenuItem>
                  <MenuItem 
                    onClick={() => {
                      setStatusFilter('active');
                      setPage(0);
                      handleFilterMenuClose();
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      <HowToRegIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    Active Only
                  </MenuItem>
                  <MenuItem 
                    onClick={() => {
                      setStatusFilter('inactive');
                      setPage(0);
                      handleFilterMenuClose();
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <ListItemIcon>
                      <DoNotDisturbIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    Inactive Only
                  </MenuItem>
                </Menu>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>
      
      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <Grow in={selectedUsers.length > 0} timeout={500}>
          <Card 
            sx={{ 
              mb: 3, 
              borderRadius: 3, 
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
              border: '1px solid',
              borderColor: 'primary.light'
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Chip
                    icon={<Checkbox checked size="small" />}
                    label={`${selectedUsers.length} users selected`}
                    color="primary"
                    sx={{ fontWeight: 'medium', height: 40 }}
                  />
                </Grid>
                
                <Grid item xs />
                
                <Grid item>
                  <Stack direction="row" spacing={1}>
                    <AnimatedButton
                      variant="outlined"
                      color="success"
                      startIcon={<ActivateIcon />}
                      onClick={() => handleBulkToggleActive(true)}
                      size="medium"
                    >
                      Activate
                    </AnimatedButton>
                    
                    <AnimatedButton
                      variant="outlined"
                      color="error"
                      startIcon={<DeactivateIcon />}
                      onClick={() => handleBulkToggleActive(false)}
                      size="medium"
                    >
                      Deactivate
                    </AnimatedButton>
                    
                    <AnimatedButton
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteSweepIcon />}
                      onClick={handleBulkDelete}
                      size="medium"
                    >
                      Delete
                    </AnimatedButton>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grow>
      )}

      {/* Users Table */}
      {viewMode === 'table' && (
        <Fade in={true} timeout={600}>
          <Card 
            sx={{ 
              mb: 3, 
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow 
                    sx={{ 
                      bgcolor: theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.primary.main, 0.1)
                        : alpha(theme.palette.primary.main, 0.05)
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        indeterminate={selectedUsers.length > 0 && selectedUsers.length < getFilteredUsers().length}
                        checked={getFilteredUsers().length > 0 && selectedUsers.length === getFilteredUsers().length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Username</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Email</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Role</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Join Date</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Status</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Points</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">Actions</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredUsers().length > 0 ? (
                    getFilteredUsers().map((user) => (
                      <TableRow 
                        key={user.UserID} 
                        hover
                        sx={{
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                          }
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={selectedUsers.includes(user.UserID)}
                            onChange={() => handleSelectUser(user.UserID)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={user.ProfileImage} 
                              alt={user.Username}
                              sx={{ 
                                mr: 2,
                                width: 40,
                                height: 40,
                                bgcolor: user.UserRole === 'admin' ? 'primary.main' : 'secondary.main',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              {user.Username ? user.Username[0].toUpperCase() : 'U'}
                            </Avatar>
                            <Typography 
                              variant="body1" 
                              fontWeight="medium"
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': {
                                  color: 'primary.main'
                                },
                                transition: 'color 0.2s'
                              }}
                              onClick={() => handleViewUser(user.UserID)}
                            >
                              {user.Username}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.Email}</TableCell>
                        <TableCell>
                          <Chip
                            icon={user.UserRole === 'admin' ? <AdminIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                            label={user.UserRole === 'admin' ? 'Admin' : 'User'}
                            color={user.UserRole === 'admin' ? 'primary' : 'default'}
                            size="small"
                            sx={{ fontWeight: 'medium', borderRadius: 8 }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.JoinDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={user.IsActive ? <ActivateIcon fontSize="small" /> : <DeactivateIcon fontSize="small" />}
                            label={user.IsActive ? 'Active' : 'Inactive'}
                            color={user.IsActive ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 'medium', borderRadius: 8 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.TotalPoints || 0}
                            size="small"
                            color={
                              user.TotalPoints > 1000 ? 'success' :
                              user.TotalPoints > 500 ? 'info' :
                              'default'
                            }
                            sx={{ fontWeight: 'medium', borderRadius: 8, minWidth: 50 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details" arrow>
                              <IconButton 
                                size="small" 
                                color="info"
                                onClick={() => handleViewUser(user.UserID)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title={user.IsActive ? "Deactivate" : "Activate"} arrow>
                              <IconButton
                                size="small"
                                color={user.IsActive ? "error" : "success"}
                                onClick={() => handleToggleActive(user.UserID, user.IsActive)}
                              >
                                {user.IsActive ? <DeactivateIcon fontSize="small" /> : <ActivateIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title={user.UserRole === 'admin' ? "Make Regular User" : "Make Admin"} arrow>
                              <IconButton
                                size="small"
                                color={user.UserRole === 'admin' ? "secondary" : "primary"}
                                onClick={() => handleChangeRole(user.UserID, user.UserRole)}
                              >
                                {user.UserRole === 'admin' ? <PersonIcon fontSize="small" /> : <AdminIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="More Actions" arrow>
                              <IconButton
                                size="small"
                                onClick={(e) => handleUserMenuOpen(e, user.UserID)}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                          <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                          <Typography variant="h6" gutterBottom>
                            No users found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            No matching results for your search criteria
                          </Typography>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                              setSearch('');
                              setRoleFilter('');
                              setStatusFilter('all');
                              setPage(0);
                              fetchUsers();
                            }}
                            startIcon={<RefreshIcon />}
                            sx={{ mt: 2, borderRadius: 8, px: 3 }}
                          >
                            Clear Filters
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            <TablePagination
              component="div"
              count={totalUsers}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                borderTop: '1px solid',
                borderColor: 'divider'
              }}
            />
          </Card>
        </Fade>
      )}
      
      {/* Grid View */}
      {viewMode === 'grid' && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={3}>
            {getFilteredUsers().length > 0 ? (
              getFilteredUsers().map((user, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={user.UserID}>
                  <Zoom in={true} style={{ transitionDelay: `${100 * (index % 4)}ms` }}>
                    <UserGridCard>
                      <Box 
                        sx={{ 
                          height: 80,
                          background: user.UserRole === 'admin' 
                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                            : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                          position: 'relative',
                        }}
                      />
                      
                      <Box sx={{ position: 'absolute', top: 15, right: 15, zIndex: 2 }}>
                        <Checkbox
                          checked={selectedUsers.includes(user.UserID)}
                          onChange={() => handleSelectUser(user.UserID)}
                          color="primary"
                          sx={{
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            width: 36,
                            height: 36,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ mt: -5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar
                          src={user.ProfileImage}
                          alt={user.Username}
                          sx={{
                            width: 80,
                            height: 80,
                            border: '4px solid white',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                            bgcolor: user.UserRole === 'admin' ? 'primary.main' : 'secondary.main',
                            fontSize: 32
                          }}
                        >
                          {user.Username ? user.Username[0].toUpperCase() : 'U'}
                        </Avatar>
                        
                        <CardContent sx={{ width: '100%', textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {user.Username}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            {user.Email}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, my: 2 }}>
                            <Chip
                              icon={user.UserRole === 'admin' ? <AdminIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                              label={user.UserRole === 'admin' ? 'Admin' : 'User'}
                              color={user.UserRole === 'admin' ? 'primary' : 'default'}
                              size="small"
                              sx={{ fontWeight: 'medium', borderRadius: 8 }}
                            />
                            
                            <Chip
                              icon={user.IsActive ? <ActivateIcon fontSize="small" /> : <DeactivateIcon fontSize="small" />}
                              label={user.IsActive ? 'Active' : 'Inactive'}
                              color={user.IsActive ? 'success' : 'error'}
                              size="small"
                              sx={{ fontWeight: 'medium', borderRadius: 8 }}
                            />
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Joined: {new Date(user.JoinDate).toLocaleDateString()}
                            </Typography>
                            
                            <Chip 
                              label={`${user.TotalPoints || 0} points`}
                              size="small"
                              color={
                                user.TotalPoints > 1000 ? 'success' :
                                user.TotalPoints > 500 ? 'info' :
                                'default'
                              }
                              sx={{ fontWeight: 'medium', borderRadius: 8 }}
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <AnimatedButton
                              variant="outlined"
                              size="small"
                              color="info"
                              startIcon={<ViewIcon />}
                              onClick={() => handleViewUser(user.UserID)}
                            >
                              Details
                            </AnimatedButton>
                            
                            <AnimatedButton
                              variant="outlined"
                              size="small"
                              color={user.IsActive ? "error" : "success"}
                              startIcon={user.IsActive ? <DeactivateIcon /> : <ActivateIcon />}
                              onClick={() => handleToggleActive(user.UserID, user.IsActive)}
                            >
                              {user.IsActive ? 'Deactivate' : 'Activate'}
                            </AnimatedButton>
                            
                            <IconButton
                              size="small"
                              onClick={(e) => handleUserMenuOpen(e, user.UserID)}
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Box>
                    </UserGridCard>
                  </Zoom>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <SearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h5" gutterBottom fontWeight="medium">
                    No Users Found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    No matching results for your search criteria.
                  </Typography>
                  <AnimatedButton
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setSearch('');
                      setRoleFilter('');
                      setStatusFilter('all');
                      setPage(0);
                      fetchUsers();
                    }}
                    startIcon={<RefreshIcon />}
                    sx={{ 
                      mt: 2,
                      borderRadius: 10,
                      px: 4,
                      py: 1.2,
                      boxShadow: '0 6px 20px rgba(63, 81, 181, 0.25)'
                    }}
                  >
                    Reset Filters
                  </AnimatedButton>
                </Box>
              </Grid>
            )}
          </Grid>
          
          {/* Grid View Pagination */}
          {getFilteredUsers().length > 0 && (
            <Card sx={{ mt: 3, borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <TablePagination
                component="div"
                count={totalUsers}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={pageSize}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[8, 12, 20, 36]}
              />
            </Card>
          )}
        </Box>
      )}
      
      {/* Export Buttons - Redesigned */}
      <Fade in={true} timeout={1000}>
        <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'center' }}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 20px rgba(0,0,0,0.07)',
              background: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(10px)',
              p: 2
            }}
          >
            <Stack 
              direction="row" 
              spacing={1.5} 
              alignItems="center"
              divider={<Divider orientation="vertical" flexItem />}
            >
              <Typography variant="subtitle1" fontWeight="medium" sx={{ pl: 1 }}>
                Export Data:
              </Typography>

              <ExportButton
                color="success" 
                onClick={() => handleExport('excel')}
                startIcon={<FileDownloadIcon />}
                endIcon={<DownloadIcon />}
              >
                Excel
              </ExportButton>
              
              <ExportButton
                color="primary"
                onClick={() => handleExport('csv')}
                startIcon={<FileDownloadIcon />}
                endIcon={<DownloadIcon />}
              >
                CSV
              </ExportButton>
              
              <ExportButton
                color="secondary"
                onClick={() => handleExport('json')}
                startIcon={<FileDownloadIcon />}
                endIcon={<DownloadIcon />}
              >
                JSON
              </ExportButton>
            </Stack>
          </Card>
        </Box>
      </Fade>

      {/* User Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleUserMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 180,
            mt: 0.5,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            '& .MuiMenuItem-root': {
              py: 1.5
            }
          }
        }}
      >
        <MenuItem onClick={() => { handleUserMenuClose(); handleViewUser(actionTarget); }}>
          <ListItemIcon><ViewIcon fontSize="small" color="info" /></ListItemIcon>
          View Details
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon><EditIcon fontSize="small" color="primary" /></ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon><MailIcon fontSize="small" color="secondary" /></ListItemIcon>
          Send Email
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <ListItemIcon><VpnKeyIcon fontSize="small" color="warning" /></ListItemIcon>
          Reset Password
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleUserMenuClose(); handleDeleteUser(actionTarget); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          Delete User
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        PaperProps={{ elevation: 5, sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3 }}>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            color="primary"
            variant="outlined"
            sx={{ borderRadius: 8 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDialog.action}
            color="error"
            variant="contained"
            sx={{ borderRadius: 8, ml: 1 }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add New User Dialog - Fixed Nesting Issue */}
      <Dialog
        open={newUserDialog}
        onClose={handleNewUserDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ elevation: 8, sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        <DialogHeader>
          <PersonAddIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="div" fontWeight="bold">
            Add New User
          </Typography>
        </DialogHeader>
        
        <DialogContent sx={{ py: 4, px: { xs: 2, md: 4 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={newUserFormData.username}
                onChange={handleNewUserFormChange}
                error={!!formErrors.username}
                helperText={formErrors.username}
                variant="outlined"
                sx={{ borderRadius: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={newUserFormData.email}
                onChange={handleNewUserFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={newUserFormData.password}
                onChange={handleNewUserFormChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={newUserFormData.confirmPassword}
                onChange={handleNewUserFormChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="new-user-role-label">User Role</InputLabel>
                <Select
                  labelId="new-user-role-label"
                  label="User Role"
                  name="role"
                  value={newUserFormData.role}
                  onChange={handleNewUserFormChange}
                >
                  <MenuItem value="regular">
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    Regular User
                  </MenuItem>
                  <MenuItem value="admin">
                    <ListItemIcon><AdminIcon fontSize="small" /></ListItemIcon>
                    Admin
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  height: '100%', 
                  pl: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  Active User
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color={newUserFormData.isActive ? "text.secondary" : "error.main"}>
                    No
                  </Typography>
                  <Switch
                    name="isActive"
                    checked={newUserFormData.isActive}
                    onChange={handleNewUserFormChange}
                    color="success"
                  />
                  <Typography variant="body2" color={newUserFormData.isActive ? "success.main" : "text.secondary"}>
                    Yes
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleNewUserDialogClose}
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: 8 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateNewUser}
            color="primary"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ 
              borderRadius: 8, 
              ml: 1,
              px: 3,
              background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
              boxShadow: '0 6px 15px rgba(63, 81, 181, 0.3)'
            }}
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}