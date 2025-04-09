'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TokenIcon from '@mui/icons-material/Token';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function WalletPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [walletInfo, setWalletInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  // Connect wallet states
  const [walletAddress, setWalletAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);
  
  // Disconnect dialog
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  
  // Copy notification
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Fetch wallet information
  useEffect(() => {
    const fetchWalletInfo = async () => {
      setLoading(true);
      
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }
      
      try {
        // In a real application, fetch from API:
        // const response = await fetch('/api/wallet/info/');
        // const data = await response.json();
        
        // Mock data for now
        const mockConnected = user?.walletAddress || Math.random() > 0.5;
        
        if (mockConnected) {
          const mockWallet = {
            connected: true,
            address: user?.walletAddress || '0x1234567890abcdef1234567890abcdef12345678',
            balance: '0.128',
            network: 'EduChain',
            nftCount: 7
          };
          
          const mockTransactions = [
            {
              id: 1,
              type: 'mint',
              hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              timestamp: '2023-08-15T14:30:00Z',
              details: 'Minted Blockchain Pioneer NFT'
            },
            {
              id: 2,
              type: 'mint',
              hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              timestamp: '2023-08-10T09:15:00Z',
              details: 'Minted Course Completion: Web3 Basics NFT'
            },
            {
              id: 3,
              type: 'transfer',
              hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
              timestamp: '2023-07-28T16:45:00Z',
              details: 'Received 0.05 EDU from Platform Rewards'
            }
          ];
          
          setTimeout(() => {
            setWalletInfo(mockWallet);
            setTransactions(mockTransactions);
            setWalletAddress(mockWallet.address);
            setLoading(false);
          }, 1000);
        } else {
          setTimeout(() => {
            setWalletInfo({ connected: false });
            setLoading(false);
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to fetch wallet info:', error);
        setError('Failed to load wallet information. Please try again.');
        setLoading(false);
      }
    };
    
    fetchWalletInfo();
  }, [isAuthenticated, user]);
  
  const handleConnectWallet = async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Validate address
    if (!walletAddress) {
      setAddressError('Wallet address is required');
      return;
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setAddressError('Please enter a valid Ethereum address');
      return;
    }
    
    setConnectLoading(true);
    setAddressError('');
    
    try {
      // In a real app, call API to connect wallet
      // const response = await fetch('/api/wallet/connect/', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ address: walletAddress }),
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setWalletInfo({
        connected: true,
        address: walletAddress,
        balance: '0.000',
        network: 'EduChain',
        nftCount: 0
      });
      
      setConnectSuccess(true);
      
      // Clear success message after a delay
      setTimeout(() => {
        setConnectSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setConnectLoading(false);
    }
  };
  
  const handleDisconnectOpen = () => {
    setDisconnectOpen(true);
  };
  
  const handleDisconnectClose = () => {
    setDisconnectOpen(false);
  };
  
  const handleDisconnectWallet = async () => {
    setDisconnectLoading(true);
    
    try {
      // In a real app, call API to disconnect wallet
      // const response = await fetch('/api/wallet/disconnect/', {
      //   method: 'POST',
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWalletInfo({ connected: false });
      setDisconnectOpen(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setError('Failed to disconnect wallet. Please try again.');
    } finally {
      setDisconnectLoading(false);
    }
  };
  
  const handleAddressChange = (event) => {
    setWalletAddress(event.target.value);
    
    if (addressError) {
      setAddressError('');
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const shortenTxHash = (hash) => {
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 6)}`;
  };
  
  if (!isAuthenticated()) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography variant="body1" paragraph>
            You need to log in to connect and manage your wallet.
          </Typography>
          <Button variant="contained" onClick={() => router.push('/login')}>
            Log In
          </Button>
        </Box>
      </Container>
    );
  }
  
  if (loading) {
    return (
      <Container sx={{ my: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Wallet
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Connect your Ethereum wallet to mint and manage your NFTs on the blockchain.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {connectSuccess && (
        <Alert severity="success" sx={{ mb: 4 }}>
          Wallet connected successfully!
        </Alert>
      )}
      
      {walletInfo?.connected ? (
        // Connected wallet view
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccountBalanceWalletIcon color="primary" fontSize="large" sx={{ mr: 2 }} />
                <Typography variant="h5">
                  Connected Wallet
                </Typography>
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={handleDisconnectOpen}
                  sx={{ ml: 'auto' }}
                >
                  Disconnect
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Wallet Address
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          bgcolor: 'background.paper', 
                          p: 1, 
                          borderRadius: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: { xs: '200px', sm: '300px', md: '100%' }
                        }}
                      >
                        {walletInfo.address}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => copyToClipboard(walletInfo.address)}
                        sx={{ ml: 1 }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => window.open(`https://explorer.educhain.example/address/${walletInfo.address}`, '_blank')}
                        sx={{ ml: 0.5 }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Network
                    </Typography>
                    <Typography variant="body1">
                      {walletInfo.network}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'primary.dark',
                      color: 'white',
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      mb: 2
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        zIndex: 0
                      }} 
                    />
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Balance
                      </Typography>
                      <Typography variant="h4" gutterBottom>
                        {walletInfo.balance} EDU
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {walletInfo.nftCount} NFTs in Wallet
                      </Typography>
                    </Box>
                  </Paper>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      startIcon={<TokenIcon />}
                      onClick={() => router.push('/nfts')}
                    >
                      View NFTs
                    </Button>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      startIcon={<SwapHorizIcon />}
                      disabled
                    >
                      Transfer
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Transactions" />
              <Tab label="NFT Activity" />
            </Tabs>
          </Box>
          
          {tabValue === 0 && (
            <Card>
              <List>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <ListItem 
                      key={tx.id}
                      divider
                      secondaryAction={
                        <IconButton 
                          size="small"
                          onClick={() => window.open(`https://explorer.educhain.example/tx/${tx.hash}`, '_blank')}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        {tx.type === 'mint' ? <TokenIcon color="primary" /> : <SwapHorizIcon color="primary" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={tx.details}
                        secondary={
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { sm: 2 } }}>
                            <Typography variant="caption" component="span">
                              {formatDate(tx.timestamp)}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              component="span" 
                              sx={{ fontFamily: 'monospace' }}
                            >
                              Tx: {shortenTxHash(tx.hash)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText 
                      primary="No transactions yet"
                      secondary="Your transactions will appear here once you mint NFTs or receive tokens"
                    />
                  </ListItem>
                )}
              </List>
            </Card>
          )}
          
          {tabValue === 1 && (
            <Card>
              <List>
                {transactions.filter(tx => tx.type === 'mint').length > 0 ? (
                  transactions
                    .filter(tx => tx.type === 'mint')
                    .map((tx) => (
                      <ListItem 
                        key={tx.id}
                        divider
                        secondaryAction={
                          <IconButton 
                            size="small"
                            onClick={() => window.open(`https://explorer.educhain.example/tx/${tx.hash}`, '_blank')}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <TokenIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={tx.details}
                          secondary={
                            <Typography variant="caption" component="span">
                              {formatDate(tx.timestamp)}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))
                ) : (
                  <ListItem>
                    <ListItemText 
                      primary="No NFT activity yet"
                      secondary="Your NFT transactions will appear here once you mint or trade NFTs"
                    />
                  </ListItem>
                )}
              </List>
            </Card>
          )}
        </>
      ) : (
        // Not connected view
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 72 }} />
              <Typography variant="h5" sx={{ mt: 2 }}>
                Connect Your Wallet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                Link your Ethereum wallet to start minting your NFTs to the blockchain
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Ethereum Wallet Address"
                placeholder="0x..."
                fullWidth
                value={walletAddress}
                onChange={handleAddressChange}
                error={!!addressError}
                helperText={addressError || "Enter your Ethereum wallet address to connect"}
                sx={{ mb: 2 }}
              />
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleConnectWallet}
                disabled={connectLoading}
                startIcon={connectLoading ? <CircularProgress size={20} /> : <AccountBalanceWalletIcon />}
              >
                {connectLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have a wallet?
              </Typography>
            </Divider>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              You'll need an Ethereum wallet to store your NFTs. We recommend MetaMask, which is easy to set up and use.
            </Typography>
            
            <Button
              variant="outlined"
              color="primary"
              onClick={() => window.open('https://metamask.io/', '_blank')}
              fullWidth
            >
              Get MetaMask
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Disconnect Wallet Dialog */}
      <Dialog open={disconnectOpen} onClose={handleDisconnectClose}>
        <DialogTitle>Disconnect Wallet</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to disconnect your wallet?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You can reconnect your wallet at any time.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDisconnectClose} disabled={disconnectLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDisconnectWallet} 
            color="error" 
            variant="contained"
            disabled={disconnectLoading}
          >
            {disconnectLoading ? <CircularProgress size={24} /> : 'Disconnect'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="Copied to clipboard"
        action={
          <IconButton size="small" color="inherit" onClick={() => setCopySuccess(false)}>
            <CheckCircleIcon />
          </IconButton>
        }
      />
    </Container>
  );
}