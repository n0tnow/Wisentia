/*'use client';
import { useState } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  AccountBalanceWallet as WalletIcon,
  LinkOff as DisconnectIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useWallet } from '@/contexts/WalletContext';

const WalletConnectButton = ({ variant = 'contained', size = 'medium', fullWidth = false }) => {
  const theme = useTheme();
  const { 
    walletAddress, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    shortenAddress,
    error
  } = useWallet();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnectClick = () => {
    if (isConnected) {
      setDialogOpen(true);
    } else {
      handleConnect();
    }
  };

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setDialogOpen(false);
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error('Adres kopyalama hatası: ', err));
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={handleConnectClick}
        startIcon={isConnected ? null : <WalletIcon />}
        disabled={isConnecting}
        sx={{
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          fontWeight: 'bold',
          ...(isConnected && {
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: theme.palette.success.main,
            '&:hover': {
              bgcolor: alpha(theme.palette.success.main, 0.2),
            }
          })
        }}
      >
        {isConnecting ? (
          <CircularProgress size={24} thickness={4} />
        ) : isConnected ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                bgcolor: theme.palette.success.main,
                boxShadow: `0 0 10px ${theme.palette.success.main}`,
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 0.6, transform: 'scale(0.9)' },
                  '50%': { opacity: 1, transform: 'scale(1.1)' },
                  '100%': { opacity: 0.6, transform: 'scale(0.9)' }
                }
              }} 
            />
            {shortenAddress(walletAddress)}
          </Box>
        ) : (
          'Cüzdan Bağla'
        )}
      </Button>

      {/* Cüzdan Diyaloğu *//*}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight="bold">Cüzdan Bağlandı</Typography>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Cüzdan Adresi
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                wordBreak: 'break-all'
              }}
            >
              <Typography variant="body2" fontFamily="monospace" sx={{ flexGrow: 1 }}>
                {walletAddress}
              </Typography>
              <Button 
                size="small" 
                onClick={handleCopyAddress} 
                startIcon={copied ? <CheckIcon color="success" /> : <CopyIcon />}
                sx={{ ml: 1, minWidth: 'auto', pl: 1, pr: 1 }}
              >
                {copied ? 'Kopyalandı' : 'Kopyala'}
              </Button>
            </Box>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Bu cüzdan Wisentia hesabınıza bağlanmıştır. Kursları ve görevleri tamamladığınızda
            NFT ödüllerinizi almak için bu cüzdanı kullanabilirsiniz.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Kapat
          </Button>
          <Button
            onClick={handleDisconnect}
            variant="contained"
            color="error"
            startIcon={<DisconnectIcon />}
            sx={{ borderRadius: 2 }}
          >
            Bağlantıyı Kes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WalletConnectButton;*/