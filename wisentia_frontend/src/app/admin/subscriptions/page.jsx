// src/app/admin/subscriptions/page.jsx - Hata gösterimi için eklemeler
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function SubscriptionManagementPage() {
  const [plans, setPlans] = useState([]);
  const [subscriptionStats, setSubscriptionStats] = useState({});
  const [recentSubscriptions, setRecentSubscriptions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    durationDays: 30,
    price: 0,
    nftId: '',
    features: '',
    isActive: true,
  });
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Snackbar için state'ler
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' // 'error', 'warning', 'info', 'success'
  });
  
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  // Snackbar'ı kapatma fonksiyonu
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({...snackbar, open: false});
  };

  // Snackbar gösterme yardımcı fonksiyonu
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  useEffect(() => {
    // Admin kontrolü
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/admin/subscriptions');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setPlans(data.plans || []);
        setSubscriptionStats(data.stats || {});
        setRecentSubscriptions(data.recentSubscriptions || []);
      } catch (err) {
        setError(err.message);
        showSnackbar(`Error loading subscription data: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchSubscriptionData();
    }
  }, [user, router]);

  const handleCreatePlan = () => {
    // Reset form data
    setFormData({
      planName: '',
      description: '',
      durationDays: 30,
      price: 0,
      nftId: '',
      features: '',
      isActive: true,
    });
    setEditingPlanId('new');
    setOpenDialog(true);
  };

  const handleEditPlan = (plan) => {
    setFormData({
      planName: plan.PlanName,
      description: plan.Description || '',
      durationDays: plan.DurationDays,
      price: plan.Price,
      nftId: plan.NFTID || '',
      features: plan.Features || '',
      isActive: plan.IsActive,
    });
    setEditingPlanId(plan.PlanID);
    setOpenDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      // Convert to correct types
      const dataToSend = {
        ...formData,
        durationDays: parseInt(formData.durationDays),
        price: parseFloat(formData.price),
        nftId: formData.nftId ? parseInt(formData.nftId) : null,
      };

      const isNewPlan = editingPlanId === 'new';
      const url = isNewPlan 
        ? '/api/admin/subscriptions/create' 
        : `/api/admin/subscriptions/${editingPlanId}/update`;

      const response = await fetch(url, {
        method: isNewPlan ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save plan: ${response.status}`);
      }

      // Refresh plans list
      const refreshResponse = await fetch('/api/admin/subscriptions');
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setPlans(refreshData.plans || []);
      }

      setOpenDialog(false);
      setEditingPlanId(null);
      
      // Show success message
      showSnackbar(
        isNewPlan ? 'Subscription plan created successfully' : 'Subscription plan updated successfully', 
        'success'
      );
    } catch (err) {
      showSnackbar(`Error: ${err.message}`, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (planId, isActive) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${planId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update plan: ${response.status}`);
      }

      // Update plans list
      setPlans(plans.map(plan => 
        plan.PlanID === planId ? { ...plan, IsActive: !isActive } : plan
      ));
      
      showSnackbar(`Plan ${!isActive ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (err) {
      showSnackbar(`Error: ${err.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading subscription data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Subscription Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreatePlan}
        >
          Create New Plan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Subscription Plans Card */}
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title="Subscription Plans" 
          titleTypographyProps={{ variant: 'h5' }}
          action={
            <Tooltip title="Manage your subscription plans here">
              <IconButton>
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Plan Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>NFT</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Active Subscribers</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary">No subscription plans found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.PlanID}>
                      <TableCell>
                        <Typography variant="subtitle2">{plan.PlanName}</Typography>
                        <Typography variant="body2" color="textSecondary" 
                          sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {plan.Description}
                        </Typography>
                      </TableCell>
                      <TableCell>{plan.DurationDays} days</TableCell>
                      <TableCell>${parseFloat(plan.Price).toFixed(2)}</TableCell>
                      <TableCell>{plan.NFTTitle || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={plan.IsActive ? 'Active' : 'Inactive'}
                          color={plan.IsActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {subscriptionStats[plan.PlanID]?.activeCount || 0}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Plan">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={plan.IsActive ? 'Deactivate Plan' : 'Activate Plan'}>
                          <IconButton
                            size="small"
                            color={plan.IsActive ? 'error' : 'success'}
                            onClick={() => handleToggleActive(plan.PlanID, plan.IsActive)}
                          >
                            {plan.IsActive ? <BlockIcon /> : <CheckCircleIcon />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recent Subscriptions Card */}
      <Card>
        <CardHeader 
          title="Recent Subscriptions" 
          titleTypographyProps={{ variant: 'h5' }}
        />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="textSecondary">No recent subscriptions</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentSubscriptions.map((subscription) => (
                    <TableRow key={subscription.SubscriptionID}>
                      <TableCell>{subscription.Username}</TableCell>
                      <TableCell>{subscription.PlanName}</TableCell>
                      <TableCell>
                        {new Date(subscription.StartDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(subscription.EndDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={subscription.IsActive ? 'Active' : 'Inactive'}
                          color={subscription.IsActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Plan Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !formSubmitting && setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPlanId === 'new' ? 'Create New Subscription Plan' : 'Edit Subscription Plan'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Plan Name"
                name="planName"
                value={formData.planName}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                error={formData.planName === ''}
                helperText={formData.planName === '' ? 'Plan name is required' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Duration (days)"
                name="durationDays"
                type="number"
                value={formData.durationDays}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ min: 1 }}
                error={!formData.durationDays || formData.durationDays < 1}
                helperText={!formData.durationDays || formData.durationDays < 1 ? 'Duration must be at least 1 day' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Price ($)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ step: 0.01, min: 0 }}
                error={formData.price < 0}
                helperText={formData.price < 0 ? 'Price cannot be negative' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="NFT ID"
                name="nftId"
                value={formData.nftId}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                helperText="Leave empty if no NFT is associated (optional)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Features (comma separated)"
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                placeholder="Feature 1, Feature 2, Feature 3"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)} 
            color="inherit"
            disabled={formSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={formSubmitting || !formData.planName || !formData.durationDays || formData.durationDays < 1 || formData.price < 0}
          >
            {formSubmitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}