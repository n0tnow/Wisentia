'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Link
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function NFTDetailPage({ params }) {
  const nftId = params.nftId;
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Fetch NFT details
  // NFT detay sayfasında useEffect'i şu şekilde güncelleyelim:
useEffect(() => {
  const fetchNFTDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/nfts/${nftId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch NFT details: ${response.status}`);
      }
      const data = await response.json();
      setNft(data);
    } catch (error) {
      console.error('Failed to fetch NFT details:', error);
      setError('Failed to load NFT details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  fetchNFTDetails();
}, [nftId]);
  
  const getNftTypeColor = (type) => {
    switch (type) {
      case 'achievement':
        return 'primary';
      case 'course_completion':
        return 'success';
      case 'subscription':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  const getNftTypeLabel = (type) => {
    switch (type) {
      case 'achievement':
        return 'Achievement';
      case 'course_completion':
        return 'Course Completion';
      case 'subscription':
        return 'Subscription';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      },
      () => {
        setError('Failed to copy to clipboard');
      }
    );
  };
  
  if (loading) {
    return (
      <Container sx={{ my: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ my: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  if (!nft) {
    return (
      <Container sx={{ my: 4 }}>
        <Alert severity="warning">NFT not found</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        {/* Left column - NFT image and details */}
        <Grid item xs={12} md={7}>
          <Box
            component="img"
            src={nft.imageUri}
            alt={nft.title}
            sx={{
              width: '100%',
              borderRadius: 2,
              boxShadow: 3,
              mb: 3
            }}
          />
          
          <Typography variant="h4" component="h1" gutterBottom>
            {nft.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Chip 
              label={getNftTypeLabel(nft.type)}
              color={getNftTypeColor(nft.type)}
            />
            
            {nft.isMinted && (
              <Chip 
                icon={<VerifiedIcon />}
                label="Blockchain Verified"
                color="success"
                variant="outlined"
              />
            )}
          </Box>
          
          <Typography variant="body1" paragraph>
            {nft.description}
          </Typography>
          
          {nft.relatedQuest && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Related Quest
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body1" fontWeight="medium">
                  {nft.relatedQuest.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed on: {new Date(nft.relatedQuest.completionDate).toLocaleDateString()}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => router.push(`/quests/${nft.relatedQuest.id}`)}
                  sx={{ mt: 1 }}
                >
                  View Quest
                </Button>
              </Paper>
            </Box>
          )}
        </Grid>
        
        {/* Right column - Blockchain info */}
        <Grid item xs={12} md={5}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                NFT Details
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Acquisition Date
                </Typography>
                <Typography variant="body1">
                  {new Date(nft.acquisitionDate).toLocaleDateString()}
                </Typography>
              </Box>
              
              {nft.expiryDate && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Expiry Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(nft.expiryDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              {nft.isMinted ? (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Blockchain Information
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Token ID
                    </Typography>
                    <Typography variant="body1">
                      {nft.blockchainData.tokenId}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Contract Address
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          bgcolor: 'background.paper', 
                          p: 1, 
                          borderRadius: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '80%'
                        }}
                      >
                        {nft.blockchainData.contract}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(nft.blockchainData.contract)}
                        sx={{ ml: 1 }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Network
                    </Typography>
                    <Typography variant="body1">
                      {nft.blockchainData.network}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Transaction Hash
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          bgcolor: 'background.paper', 
                          p: 1, 
                          borderRadius: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '60%'
                        }}
                      >
                        {nft.transactionHash.substring(0, 18)}...
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(nft.transactionHash)}
                        sx={{ ml: 1 }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <Link 
                        href="#" 
                        underline="none"
                        sx={{ ml: 1, display: 'flex', alignItems: 'center' }}
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(`https://explorer.educhain.example/tx/${nft.transactionHash}`, '_blank');
                        }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </Link>
                    </Box>
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Attributes
                  </Typography>
                  
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {nft.blockchainData.attributes.map((attr, index) => (
                      <Grid item xs={6} key={index}>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 1, 
                            textAlign: 'center',
                            bgcolor: 'background.paper'
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" display="block">
                            {attr.trait_type}
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {attr.value}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body1" paragraph>
                    This NFT has not been minted to the blockchain yet.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AccountBalanceWalletIcon />}
                    onClick={() => router.push('/wallet')}
                  >
                    Mint to Blockchain
                  </Button>
                </Box>
              )}
              
              {copySuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Copied to clipboard!
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}