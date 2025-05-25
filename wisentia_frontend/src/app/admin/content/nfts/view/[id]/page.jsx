'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import { use } from 'react';

import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
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
  Link,
  Stack,
  Skeleton,
  IconButton,
  Tooltip
} from '@mui/material';

import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Verified as VerifiedIcon,
  Token as TokenIcon,
  VerifiedUser as MintedIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  CalendarMonth as CalendarIcon,
  Subscriptions as SubscriptionIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';

export default function NFTViewPage({ params }) {
  const nftId = use(params).id;
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  
  const [nftData, setNftData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
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
  
  const handleBack = () => {
    router.back();
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Get color based on rarity
  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
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
      {/* Back button and header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          variant="outlined"
        >
          Back to NFTs
        </Button>
        <Button 
          startIcon={<EditIcon />} 
          onClick={handleEdit}
          variant="contained"
          color="primary"
        >
          Edit NFT
        </Button>
      </Box>
      
      <Grid container spacing={4}>
        {/* NFT Image and basic info section */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ position: 'relative' }}>
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
              
              {/* Status chip */}
              <Chip 
                label={nftData.IsActive ? 'Active' : 'Inactive'} 
                color={nftData.IsActive ? 'success' : 'error'}
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16,
                  fontWeight: 'bold'
                }}
              />
            </Box>
            
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TokenIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  NFT ID: {nftData.NFTID}
                </Typography>
              </Box>
              
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {nftData.Title}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                <Chip 
                  label={nftData.NFTType || 'Standard'} 
                  color="primary"
                  size="small"
                  variant="outlined"
                />
                
                <Chip 
                  label={nftData.Rarity || 'Common'} 
                  size="small"
                  sx={{ 
                    bgcolor: alpha(getRarityColor(nftData.Rarity), 0.1),
                    color: getRarityColor(nftData.Rarity),
                    borderColor: getRarityColor(nftData.Rarity)
                  }}
                  variant="outlined"
                />
                
                {nftData.SubscriptionDays > 0 && (
                  <Chip 
                    icon={<SubscriptionIcon />}
                    label={`${nftData.SubscriptionDays} days`} 
                    color="secondary"
                    size="small"
                  />
                )}
              </Box>
              
              <Typography variant="body1" paragraph>
                {nftData.Description}
              </Typography>
            </CardContent>
          </Paper>
        </Grid>
        
        {/* NFT Details section */}
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              borderRadius: 4,
              mb: 4
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              NFT Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Value
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WalletIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        {nftData.TradeValue || 0} EDU
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Subscription
                    </Typography>
                    {nftData.SubscriptionDays > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SubscriptionIcon color="secondary" sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          {nftData.SubscriptionDays} days
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        Not a subscription NFT
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Owners
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        {nftData.OwnersCount || 0}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Chip 
                      label={nftData.IsActive ? 'Active' : 'Inactive'} 
                      color={nftData.IsActive ? 'success' : 'error'}
                      sx={{ fontWeight: 'medium' }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
          
          {/* IPFS Metadata */}
          {nftData.IPFSMetadata && (
            <Paper 
              elevation={2}
              sx={{ 
                p: 3, 
                borderRadius: 4,
                mb: 4
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Blockchain Metadata
              </Typography>
              
              {nftData.IPFSMetadata.ipfsUri && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    IPFS URI
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}>
                    <Typography variant="body2" sx={{ flexGrow: 1, fontFamily: 'monospace', mr: 1 }}>
                      {nftData.IPFSMetadata.ipfsUri}
                    </Typography>
                    <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                      <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(nftData.IPFSMetadata.ipfsUri)}
                        color={copied ? "success" : "primary"}
                      >
                        {copied ? <CheckCircleIcon /> : <CopyIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}
              
              {nftData.IPFSMetadata.ipfsGateway && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    IPFS Gateway URL
                  </Typography>
                  <Link 
                    href={nftData.IPFSMetadata.ipfsGateway} 
                    target="_blank"
                    rel="noopener noreferrer" 
                    underline="hover"
                  >
                    {nftData.IPFSMetadata.ipfsGateway}
                  </Link>
                </Box>
              )}
            </Paper>
          )}
          
          {/* Owners List */}
          {nftData.Owners && nftData.Owners.length > 0 && (
            <Paper 
              elevation={2}
              sx={{ 
                p: 3, 
                borderRadius: 4
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Owners ({nftData.Owners.length})
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Acquisition Date</TableCell>
                      <TableCell>Minted</TableCell>
                      <TableCell>Transaction Hash</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nftData.Owners.map((owner) => (
                      <TableRow key={owner.UserNFTID}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ mr: 1, width: 28, height: 28 }}
                              src={owner.ProfileImage}
                            >
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Link 
                              href={`/admin/users/${owner.UserID}`}
                              underline="hover"
                            >
                              {owner.Username || owner.Email}
                            </Link>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(owner.AcquisitionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {owner.IsMinted ? (
                            <Chip 
                              icon={<MintedIcon />} 
                              label="Minted" 
                              size="small" 
                              color="success" 
                              variant="outlined"
                            />
                          ) : (
                            <Chip 
                              label="Not Minted" 
                              size="small" 
                              color="default" 
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {owner.TransactionHash ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {owner.TransactionHash.substring(0, 12)}...
                              </Typography>
                              <Tooltip title="Copy transaction hash">
                                <IconButton 
                                  size="small" 
                                  onClick={() => copyToClipboard(owner.TransactionHash)}
                                >
                                  <CopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
} 