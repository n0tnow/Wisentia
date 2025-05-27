'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@mui/material/styles';

import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  Avatar,
  Stack,
  Skeleton,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tabs,
  Tab
} from '@mui/material';

import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Verified as VerifiedIcon,
  Token as TokenIcon,
  VerifiedUser as MintedIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  CalendarMonth as CalendarIcon,
  Subscriptions as SubscriptionIcon,
  AccountBalanceWallet as WalletIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nft-tabpanel-${index}`}
      aria-labelledby={`nft-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function NFTDetailPage({ params }) {
  const nftId = params.id;
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  const [nftData, setNftData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchNFTDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/admin/nfts/${nftId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch NFT data');
        }
        
        const data = await response.json();
        console.log('NFT details:', data);
        setNftData(data);
      } catch (err) {
        console.error('Error fetching NFT data:', err);
        setError(err.message || 'An error occurred while loading NFT data');
      } finally {
        setLoading(false);
      }
    };

    if (nftId) {
      fetchNFTDetails();
    }
  }, [nftId, user, router]);
  
  const handleEdit = () => {
    router.push(`/admin/content/nfts/edit/${nftId}`);
  };
  
  const handleView = () => {
    router.push(`/admin/content/nfts/view/${nftId}`);
  };
  
  const handleBack = () => {
    router.push('/admin/content/nfts');
  };
  
  const handleDeleteNFT = async () => {
    try {
      setDeleting(true);
      
      const response = await fetch(`/api/admin/nfts/${nftId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete NFT');
      }
      
      // Redirect to NFTs list after successful deletion
      router.push('/admin/content/nfts');
    } catch (err) {
      console.error('Error deleting NFT:', err);
      setError(err.message || 'Failed to delete NFT');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Helper function to safely render values
  const safeRender = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') return fallback;
    return value;
  };
  
  // Get color based on rarity
  const getRarityColor = (rarity) => {
    const safeRarity = safeRender(rarity, 'common');
    switch (safeRarity.toLowerCase()) {
      case 'common': return theme.palette.info.main;
      case 'uncommon': return theme.palette.success.main;
      case 'rare': return theme.palette.secondary.main;
      case 'epic': return theme.palette.warning.main;
      case 'legendary': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };
  
  // Loading skeleton
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Skeleton variant="text" width="80%" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={30} sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={6} sm={3} key={item}>
                  <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleBack}>
              Go Back
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }
  
  // If no data
  if (!nftData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleBack}>
              Go Back
            </Button>
          }
        >
          NFT not found or not accessible
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          variant="outlined"
        >
          Back to NFTs
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            startIcon={<ViewIcon />} 
            onClick={handleView}
            variant="outlined"
            color="info"
          >
            View Details
          </Button>
          <Button 
            startIcon={<EditIcon />} 
            onClick={handleEdit}
            variant="contained"
            color="primary"
          >
            Edit NFT
          </Button>
          <Button 
            startIcon={<DeleteIcon />} 
            onClick={() => setDeleteDialogOpen(true)}
            variant="outlined"
            color="error"
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* NFT Title */}
      <Typography variant="h4" component="h1" gutterBottom>
        {safeRender(nftData.Title, 'NFT Details')}
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="NFT detail tabs">
          <Tab label="General Information" />
          <Tab label="Ownership & Trading" />
          <Tab label="Metadata & Technical" />
        </Tabs>
      </Box>

      {/* Tab Content Container with Fixed Height */}
      <Box sx={{ 
        minHeight: '600px', // Fixed minimum height to prevent layout shifts
        position: 'relative'
      }}>
        {/* General Information Tab */}
        {tabValue === 0 && (
          <Grid container spacing={4}>
            {/* NFT Image */}
            <Grid item xs={12} md={5}>
              <Paper 
                elevation={2} 
                sx={{ 
                  borderRadius: 4, 
                  overflow: 'hidden',
                  height: 'fit-content'
                }}
              >
                <CardMedia
                  component="img"
                  image={nftData.ImageURI || 'https://via.placeholder.com/400x400?text=NFT'}
                  alt={nftData.Title}
                  sx={{ 
                    width: '100%', 
                    height: 400,
                    objectFit: 'contain',
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x400?text=NFT';
                  }}
                />
              </Paper>
            </Grid>

            {/* NFT Details */}
            <Grid item xs={12} md={7}>
              <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {safeRender(nftData.Description, 'No description available')}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      NFT ID
                    </Typography>
                    <Typography variant="h6">
                      #{safeRender(nftData.NFTID)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Rarity
                    </Typography>
                    <Chip 
                      label={safeRender(nftData.Rarity, 'Common')} 
                      sx={{ 
                        backgroundColor: alpha(getRarityColor(nftData.Rarity), 0.1),
                        color: getRarityColor(nftData.Rarity),
                        fontWeight: 'bold'
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Trade Value
                    </Typography>
                    <Typography variant="h6">
                      {safeRender(nftData.TradeValue, 0)} Points
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={nftData.IsActive ? 'Active' : 'Inactive'} 
                      color={nftData.IsActive ? 'success' : 'error'}
                    />
                  </Grid>
                  
                  {nftData.SubscriptionDays && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Subscription Duration
                      </Typography>
                      <Typography variant="h6">
                        {safeRender(nftData.SubscriptionDays)} days
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Ownership & Trading Tab */}
        {tabValue === 1 && (
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ownership & Trading Information
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This section will show ownership history, current owners, and trading information when implemented.
            </Typography>
            
            <Alert severity="info">
              Ownership and trading features are coming soon.
            </Alert>
          </Paper>
        )}

        {/* Metadata & Technical Tab */}
        {tabValue === 2 && (
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Technical Information
            </Typography>
            
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      NFT Type ID
                    </TableCell>
                    <TableCell>{safeRender(nftData.NFTTypeID)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Image URI
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          {safeRender(nftData.ImageURI)}
                        </Typography>
                        {nftData.ImageURI && (
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(nftData.ImageURI)}
                          >
                            {copied ? <CheckCircleIcon color="success" /> : <CopyIcon />}
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Blockchain Metadata
                    </TableCell>
                    <TableCell>
                      {nftData.BlockchainMetadata && typeof nftData.BlockchainMetadata !== 'object' ? (
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          {nftData.BlockchainMetadata}
                        </Typography>
                      ) : nftData.BlockchainMetadata && typeof nftData.BlockchainMetadata === 'object' ? (
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          {JSON.stringify(nftData.BlockchainMetadata, null, 2)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not minted on blockchain yet
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete NFT
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this NFT? This action cannot be undone.
            <br /><br />
            <strong>NFT:</strong> {safeRender(nftData?.Title, 'Unknown NFT')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteNFT} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 