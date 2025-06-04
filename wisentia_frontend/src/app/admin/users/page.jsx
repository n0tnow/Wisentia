// src/app/admin/users/page.jsx
"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
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
  styled, alpha, Stack, Switch, Container, Tab, Tabs, Badge,
  Skeleton, LinearProgress, FormControlLabel
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
  FileDownload as FileDownloadIcon,
  ManageAccounts as ManageAccountsIcon,
  Security as SecurityIcon,
  BusinessCenter as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Groups as GroupsIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Shield as ShieldIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

// Corporate Purple/Orange Theme Colors
const USER_COLORS = {
  primary: '#6366F1',      // Indigo
  secondary: '#F59E0B',    // Amber/Orange
  accent: '#8B5CF6',       // Purple
  success: '#10B981',      // Emerald
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  info: '#3B82F6',         // Blue
  neutral: '#6B7280',      // Gray
  dark: '#1F2937',         // Dark Gray
  light: '#F9FAFB',        // Light Gray
  gradients: {
    primary: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    secondary: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
    accent: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    corporate: 'linear-gradient(135deg, #6366F1 0%, #F59E0B 50%, #8B5CF6 100%)',
    business: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)'
  }
};

// Modern Styled Components
const UserCard = styled(Card)(({ theme, variant = 'default' }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(12px)',
  border: `1px solid ${alpha(USER_COLORS.primary, 0.15)}`,
  borderRadius: 16,
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
    border: `1px solid ${alpha(USER_COLORS.primary, 0.3)}`,
  },
  '&::before': {
    content: '""',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
    height: '4px',
    background: variant === 'primary' ? USER_COLORS.gradients.primary : 
                variant === 'secondary' ? USER_COLORS.gradients.secondary :
                variant === 'accent' ? USER_COLORS.gradients.accent :
                USER_COLORS.gradients.corporate,
  }
}));

const CorporateTab = styled(Tab)(({ theme }) => ({
  color: alpha(theme.palette.text.primary, 0.7),
  fontSize: '0.875rem',
  fontWeight: 600,
  minHeight: 64,
  textTransform: 'none',
  borderRadius: 0,
  margin: 0,
  transition: 'all 0.3s ease',
  position: 'relative',
  minWidth: 140,
  '&.Mui-selected': {
    color: USER_COLORS.primary,
    fontWeight: 700,
    background: alpha(USER_COLORS.primary, 0.08),
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '3px',
      background: USER_COLORS.gradients.primary,
    }
  },
  '&:hover': {
    color: USER_COLORS.primary,
    background: alpha(USER_COLORS.primary, 0.04),
  },
}));

const StatsMetric = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: 16,
  background: alpha(USER_COLORS.primary, 0.05),
  border: `1px solid ${alpha(USER_COLORS.primary, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: alpha(USER_COLORS.primary, 0.1),
    transform: 'scale(1.02)',
    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)'
  }
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '2.25rem',
  fontFamily: 'Inter, sans-serif',
  color: USER_COLORS.primary,
  lineHeight: 1,
  marginBottom: theme.spacing(0.5),
  [theme.breakpoints.down('md')]: {
    fontSize: '1.875rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  }
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontFamily: 'Inter, sans-serif'
}));

const UserAvatar = styled(Avatar)(({ color, size = 48 }) => ({
  width: size,
  height: size,
  background: color || USER_COLORS.gradients.primary,
  boxShadow: `0 4px 16px ${alpha(USER_COLORS.primary, 0.25)}`,
  transition: 'all 0.3s ease',
  fontWeight: 700,
  fontSize: size > 40 ? '1.25rem' : '1rem',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 8px 24px ${alpha(USER_COLORS.primary, 0.35)}`,
  }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${USER_COLORS.primary} 0%, ${USER_COLORS.secondary} 50%, ${USER_COLORS.accent} 100%)`,
  borderRadius: 20,
  padding: theme.spacing(4),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.1,
  }
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    transition: 'all 0.3s ease',
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    '&.Mui-focused': {
      boxShadow: `0 0 0 3px ${alpha(USER_COLORS.primary, 0.2)}`,
    },
    '&:hover': {
      background: alpha(theme.palette.background.paper, 0.9),
    }
  }
}));

const ActionButton = styled(Button)(({ theme, variant: customVariant = 'primary' }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: USER_COLORS.gradients[customVariant] || USER_COLORS.gradients.primary,
  color: 'white',
  border: 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(USER_COLORS[customVariant] || USER_COLORS.primary, 0.3)}`,
    background: USER_COLORS.gradients[customVariant] || USER_COLORS.gradients.primary,
  }
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`user-tabpanel-${index}`}
    aria-labelledby={`user-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Fade in={true} timeout={300}>
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      </Fade>
    )}
  </div>
);

// Loading Skeleton Component
const UserManagementSkeleton = () => (
  <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)' }}>
    <Box sx={{ p: 4 }}>
      <Skeleton variant="text" width={400} height={60} sx={{ bgcolor: alpha(USER_COLORS.primary, 0.1) }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, mt: 4 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={160} sx={{ bgcolor: alpha(USER_COLORS.primary, 0.1), borderRadius: 2 }} />
        ))}
      </Box>
    </Box>
  </Box>
);

// Add User Dialog Component
const AddUserDialog = ({ open, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userRole: 'regular',
    isActive: true
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      userRole: 'regular',
      isActive: true
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: USER_COLORS.gradients.primary,
        color: 'white',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        py: 3
      }}>
        <PersonAddIcon sx={{ mr: 2, fontSize: '2rem' }} />
        ADD NEW USER
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: USER_COLORS.primary
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: USER_COLORS.primary
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: USER_COLORS.primary
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: USER_COLORS.primary
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>User Role</InputLabel>
                <Select
                  name="userRole"
                  value={formData.userRole}
                  label="User Role"
                  onChange={handleChange}
                >
                  <MenuItem value="regular">Regular User</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Active User"
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  '& .MuiFormControlLabel-label': {
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <ActionButton
            onClick={handleClose}
            sx={{ 
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              minWidth: 120
            }}
          >
            <CancelIcon sx={{ mr: 1 }} />
            CANCEL
          </ActionButton>
          
          <ActionButton
            type="submit"
            disabled={loading}
            sx={{ 
              background: USER_COLORS.gradients.success,
              minWidth: 120
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            ) : (
              <SaveIcon sx={{ mr: 1 }} />
            )}
            {loading ? 'CREATING...' : 'CREATE USER'}
          </ActionButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default function UserManagementPage() {
  // States
  const [allUsers, setAllUsers] = useState([]); // Store all users
  const [displayUsers, setDisplayUsers] = useState([]); // Users to display
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [viewMode, setViewMode] = useState('table');
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [newUserDialog, setNewUserDialog] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  // Safe auth hook usage
  let user = null;
  let isAuthenticated = false;
  
  try {
    const authContext = useAuth();
    user = authContext.user;
    isAuthenticated = authContext.isAuthenticated;
  } catch (authError) {
    console.warn('Auth context not available, checking localStorage for admin access');
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');
        if (storedUser && accessToken) {
          user = JSON.parse(storedUser);
          isAuthenticated = true;
        }
      } catch (e) {
        console.error('Error checking stored auth:', e);
      }
    }
  }

  const router = useRouter();
  const theme = useTheme();

  // Auth check
  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'admin')) {
      console.log('Admin access denied, redirecting to login');
      router.push('/login?redirect=/admin/users');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Filter users based on search, role, and status
  const filteredUsers = useMemo(() => {
    let filtered = [...allUsers];
    
    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user => 
        user.Username?.toLowerCase().includes(searchLower) ||
        user.Email?.toLowerCase().includes(searchLower) ||
        user.UserID?.toString().includes(searchLower)
      );
    }
    
    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.UserRole === roleFilter);
    }
    
    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(user => user.IsActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(user => !user.IsActive);
    }
    
    return filtered;
  }, [allUsers, search, roleFilter, statusFilter]);

  // Paginated users for display
  const paginatedUsers = useMemo(() => {
    const startIndex = page * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, page, pageSize]);

  // User statistics
  const userStats = useMemo(() => {
    const activeUsers = allUsers.filter(u => u.IsActive).length;
    const inactiveUsers = allUsers.filter(u => !u.IsActive).length;
    const adminUsers = allUsers.filter(u => u.UserRole === 'admin').length;
    const regularUsers = allUsers.filter(u => u.UserRole === 'regular').length;
    
    return {
      total: allUsers.length,
      active: activeUsers,
      inactive: inactiveUsers,
      admins: adminUsers,
      regular: regularUsers
    };
  }, [allUsers]);

  // Load users once from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching all users from API...');
      
      const response = await fetch('/api/admin/users?pageSize=1000', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('User fetch failed:', errorText);
        throw new Error(`Failed to load users: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Users fetched successfully:', data);
      
      const users = Array.isArray(data.users) ? data.users : [];
      setAllUsers(users);
      setTotalUsers(users.length);
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setAllUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers().finally(() => setRefreshing(false));
  };

  // Handle create user
  const handleCreateUser = async (userData) => {
    try {
      setCreatingUser(true);
      
      console.log('Creating user with data:', userData);
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      // Refresh user list
      await fetchUsers();
      
      setNewUserDialog(false);
        setSnackbar({
          open: true,
        message: 'User created successfully',
          severity: 'success'
        });
    } catch (err) {
      console.error('Error creating user:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to create user',
        severity: 'error'
      });
    } finally {
      setCreatingUser(false);
    }
  };

  // Handle search - immediate frontend filtering
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0); // Reset to first page
  };

  // Handle role filter change
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setPage(0);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  // Handle view user details
  const handleViewUser = (userId) => {
    router.push(`/admin/users/${userId}`);
  };

  // Handle user row click
  const handleUserRowClick = (userId) => {
    handleViewUser(userId);
  };

  // Handle toggle user status
  const handleToggleActive = async (userId, isActive) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        // Update local state
        setAllUsers(users => users.map(user => 
          user.UserID === userId ? { ...user, IsActive: !isActive } : user
        ));
      setSnackbar({
        open: true,
          message: `User ${!isActive ? 'activated' : 'deactivated'} successfully`,
        severity: 'success'
      });
      } else {
        throw new Error('Failed to update user status');
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update user status',
        severity: 'error'
      });
    }
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Other handlers remain the same...
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangeViewMode = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Load data when component mounts
  useEffect(() => {
      fetchUsers();
  }, [fetchUsers]);

  // Show loading skeleton
  if (loading && allUsers.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)' }}>
        <Box sx={{ p: 4 }}>
          <Skeleton variant="text" width={400} height={60} sx={{ bgcolor: alpha(USER_COLORS.primary, 0.1) }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, mt: 4 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={160} sx={{ bgcolor: alpha(USER_COLORS.primary, 0.1), borderRadius: 2 }} />
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

    return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        sx={{ 
          width: '100%',
            borderRadius: 2,
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Add User Dialog */}
      <AddUserDialog
        open={newUserDialog}
        onClose={() => setNewUserDialog(false)}
        onSubmit={handleCreateUser}
        loading={creatingUser}
      />

      <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
        {/* Corporate Header */}
        <UserCard sx={{
          background: `linear-gradient(135deg, ${USER_COLORS.primary} 0%, ${USER_COLORS.secondary} 50%, ${USER_COLORS.accent} 100%)`,
          borderRadius: 20,
          padding: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 4,
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={3}>
              <UserAvatar size={80} sx={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                <ManageAccountsIcon sx={{ fontSize: 40 }} />
              </UserAvatar>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h2" component="h1" fontWeight={800} sx={{ 
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '1px'
                }}>
                  USER CONTROL CENTER
        </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mt: 1, fontFamily: 'Inter, sans-serif' }}>
                  Advanced User Management & Analytics Platform
        </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip 
                    label="🔄 REAL-TIME" 
                    icon={<SpeedIcon sx={{ color: '#10B981 !important' }} />}
                    sx={{
                      bgcolor: 'rgba(16, 185, 129, 0.25)', 
                      color: '#10B981',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Chip 
                    label={`👥 TOTAL: ${userStats.total}`} 
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.15)', 
                      color: 'white',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                  <Chip 
                    label={`🟢 ACTIVE: ${userStats.active}`} 
                    sx={{ 
                      bgcolor: `rgba(16, 185, 129, 0.15)`, 
                      color: '#10B981',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                </Stack>
      </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'rotate(180deg)'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
              
              <ActionButton
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setNewUserDialog(true)}
      sx={{ 
                  background: USER_COLORS.gradients.success,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700
                }}
              >
                ADD USER
              </ActionButton>
            </Box>
          </Box>
        </UserCard>

        {/* Error Alert */}
      {error && (
          <Fade in={!!error}>
          <Alert 
            severity="error" 
              variant="filled"
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #EF4444',
                color: '#FFFFFF',
                '& .MuiAlert-icon': { color: '#EF4444' }
              }}
            action={
                <Button color="inherit" size="small" onClick={handleRefresh}>
                Retry
              </Button>
            }
          >
              User Management Error: {error}
          </Alert>
          </Fade>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6} lg={3}>
            <UserCard>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <UserAvatar sx={{ width: 56, height: 56, mx: 'auto', mb: 2 }}>
                  <GroupsIcon />
                </UserAvatar>
                <Typography variant="h4" fontWeight={800} sx={{ color: USER_COLORS.primary, mb: 0.5 }}>
                  {userStats.total.toLocaleString()}
            </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Total Users
            </Typography>
          </Box>
            </UserCard>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <UserCard>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <UserAvatar sx={{ 
                  width: 56, 
                  height: 56, 
                  mx: 'auto', 
                  mb: 2,
                  background: USER_COLORS.gradients.success
                }}>
                  <HowToRegIcon />
                </UserAvatar>
                <Typography variant="h4" fontWeight={800} sx={{ color: USER_COLORS.success, mb: 0.5 }}>
                  {userStats.active.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Active Users
                </Typography>
              </Box>
            </UserCard>
        </Grid>
        
          <Grid item xs={12} md={6} lg={3}>
            <UserCard>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <UserAvatar sx={{ 
                  width: 56, 
                  height: 56, 
                  mx: 'auto', 
                  mb: 2,
                  background: USER_COLORS.gradients.secondary
                }}>
                  <SecurityIcon />
                </UserAvatar>
                <Typography variant="h4" fontWeight={800} sx={{ color: USER_COLORS.secondary, mb: 0.5 }}>
                  {userStats.admins.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Admin Users
                </Typography>
              </Box>
            </UserCard>
        </Grid>
        
          <Grid item xs={12} md={6} lg={3}>
            <UserCard>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <UserAvatar sx={{ 
                  width: 56, 
                  height: 56, 
                  mx: 'auto', 
                  mb: 2,
                  background: USER_COLORS.gradients.accent
                }}>
                  <AnalyticsIcon />
                </UserAvatar>
                <Typography variant="h4" fontWeight={800} sx={{ color: USER_COLORS.accent, mb: 0.5 }}>
                  {userStats.regular.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Regular Users
                </Typography>
              </Box>
            </UserCard>
          </Grid>
        </Grid>
        
        {/* Main Content */}
        <UserCard variant="primary">
          <CardContent sx={{ p: 3 }}>
            {/* Controls */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <GroupsIcon sx={{ color: USER_COLORS.primary }} />
                <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'Inter, sans-serif' }}>
                  USER DATABASE CONTROL
                </Typography>
                <Chip 
                  label={`Showing ${paginatedUsers.length} of ${filteredUsers.length}`}
                  size="small" 
                  sx={{ 
                    bgcolor: alpha(USER_COLORS.primary, 0.1),
                    color: USER_COLORS.primary,
                    fontWeight: 600
                  }}
                />
              </Box>
              
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <SearchTextField
                  placeholder="Search users..."
                  value={search}
                  onChange={handleSearchChange}
                  size="small"
                  sx={{ minWidth: 250 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: USER_COLORS.primary }} />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Role"
                    onChange={handleRoleFilterChange}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="regular">Regular</MenuItem>
                  </Select>
                </FormControl>
              
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusFilterChange}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            {loading ? (
              <Box sx={{ py: 4 }}>
                <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Loading user data...
                </Typography>
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <UserAvatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    background: alpha(USER_COLORS.primary, 0.1),
                  }}
                >
                  <GroupsIcon fontSize="large" />
                </UserAvatar>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, fontFamily: 'Inter, sans-serif' }}>
                  {search || roleFilter || statusFilter !== 'all' ? 'No matching users found' : 'No users found'}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3, fontFamily: 'Inter, sans-serif' }}>
                  {search || roleFilter || statusFilter !== 'all' 
                    ? 'Try adjusting your search criteria.' 
                    : 'Start by adding users to the platform.'}
                </Typography>
                {(search || roleFilter || statusFilter !== 'all') ? (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearch('');
                      setRoleFilter('');
                      setStatusFilter('all');
                    }}
                    startIcon={<ClearIcon />}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <ActionButton
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setNewUserDialog(true)}
            sx={{ 
                      background: USER_COLORS.gradients.primary,
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    Add First User
                  </ActionButton>
                )}
              </Box>
            ) : (
              <>
            <TableContainer>
              <Table>
                <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: USER_COLORS.primary }}>USER</TableCell>
                        <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: USER_COLORS.primary }}>EMAIL</TableCell>
                        <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: USER_COLORS.primary }}>ROLE</TableCell>
                        <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: USER_COLORS.primary }}>STATUS</TableCell>
                        <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: USER_COLORS.primary }}>JOIN DATE</TableCell>
                        <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: USER_COLORS.primary }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                      {paginatedUsers.map((userData) => (
                      <TableRow 
                          key={userData.UserID}
                        sx={{
                            cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                              backgroundColor: alpha(USER_COLORS.primary, 0.05),
                              transform: 'scale(1.01)'
                            }
                          }}
                          onClick={() => handleUserRowClick(userData.UserID)}
                        >
                          <TableCell sx={{ fontFamily: 'Inter, sans-serif' }}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <UserAvatar size={40} sx={{ background: USER_COLORS.gradients.primary }}>
                                <PersonIcon sx={{ fontSize: 20 }} />
                              </UserAvatar>
                              <Box>
                                <Typography variant="body1" fontWeight={600} sx={{ fontFamily: 'Inter, sans-serif' }}>
                                  {userData.Username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {userData.UserID}
                            </Typography>
                              </Box>
                          </Box>
                        </TableCell>
                          <TableCell sx={{ fontFamily: 'Inter, sans-serif' }}>
                            {userData.Email}
                        </TableCell>
                        <TableCell>
                          <Chip
                              label={userData.UserRole?.toUpperCase() || 'USER'}
                              color={userData.UserRole === 'admin' ? 'primary' : 'default'}
                            size="small"
                              sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                              label={userData.IsActive ? 'ACTIVE' : 'INACTIVE'}
                              color={userData.IsActive ? 'success' : 'error'}
                            size="small"
                              sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                          />
                        </TableCell>
                          <TableCell sx={{ fontFamily: 'Inter, sans-serif' }}>
                            {userData.JoinDate ? new Date(userData.JoinDate).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                              <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewUser(userData.UserID);
                                  }}
                                  sx={{ color: USER_COLORS.info }}
                                >
                                  <ViewIcon />
                              </IconButton>
                            </Tooltip>
                              <Tooltip title={userData.IsActive ? 'Deactivate' : 'Activate'}>
                              <IconButton
                                size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleActive(userData.UserID, userData.IsActive);
                                  }}
                                  sx={{ color: userData.IsActive ? USER_COLORS.warning : USER_COLORS.success }}
                                >
                                  {userData.IsActive ? <DoNotDisturbIcon /> : <HowToRegIcon />}
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                      ))}
                </TableBody>
              </Table>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                    count={filteredUsers.length}
                    rowsPerPage={pageSize}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ 
                      borderTop: `1px solid ${alpha(USER_COLORS.primary, 0.1)}`,
                      '& .MuiTablePagination-toolbar': {
                        fontFamily: 'Inter, sans-serif'
                      }
                    }}
                  />
                </TableContainer>
              </>
            )}
          </CardContent>
        </UserCard>
      </Container>
    </>
  );
}