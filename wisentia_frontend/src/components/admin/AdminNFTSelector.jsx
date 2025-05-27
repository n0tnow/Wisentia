import { useState, useEffect } from 'react';
import { 
  FormControl, InputLabel, Select, MenuItem, FormHelperText, 
  CircularProgress, Chip, Box, Typography, Avatar, Card, CardContent
} from '@mui/material';

export default function AdminNFTSelector({ value, onChange, error, helperText }) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadNFTs = async () => {
      try {
        let token = '';
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('access_token');
        }

        const response = await fetch('/api/admin/nfts', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setNfts(Array.isArray(data) ? data : data.nfts || []);
        } else {
          setLoadError('Failed to load NFTs');
          console.error('Failed to load NFTs:', data);
        }
      } catch (error) {
        setLoadError('Error loading NFTs');
        console.error('Error loading NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, []);

  const selectedNFT = nfts.find(nft => nft.NFTID === value);

  return (
    <Box>
      <FormControl fullWidth error={!!error}>
        <InputLabel>Select NFT Reward (Optional)</InputLabel>
        <Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
          label="Select NFT Reward (Optional)"
          disabled={loading}
        >
          <MenuItem value="">
            <Typography color="text.secondary">No NFT Reward</Typography>
          </MenuItem>
          {loading ? (
            <MenuItem disabled>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Loading NFTs...
            </MenuItem>
          ) : nfts.length === 0 ? (
            <MenuItem disabled>
              No NFTs available
            </MenuItem>
          ) : (
            nfts.map((nft) => (
              <MenuItem key={nft.NFTID} value={nft.NFTID}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    src={nft.ImageURI} 
                    alt={nft.Title}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {nft.Title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      {nft.Rarity && (
                        <Chip 
                          label={nft.Rarity} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      )}
                      {nft.TradeValue && (
                        <Chip 
                          label={`${nft.TradeValue} points`} 
                          size="small" 
                          color="success" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </MenuItem>
            ))
          )}
        </Select>
        {(error || helperText || loadError) && (
          <FormHelperText error={!!error}>
            {error || loadError || helperText}
          </FormHelperText>
        )}
      </FormControl>
      
      {selectedNFT && (
        <Card sx={{ mt: 2, maxWidth: 400 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={selectedNFT.ImageURI} 
                alt={selectedNFT.Title}
                sx={{ width: 60, height: 60 }}
              />
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedNFT.Title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedNFT.Description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {selectedNFT.Rarity && (
                    <Chip 
                      label={selectedNFT.Rarity} 
                      size="small" 
                      color="primary" 
                    />
                  )}
                  {selectedNFT.TradeValue && (
                    <Chip 
                      label={`${selectedNFT.TradeValue} points`} 
                      size="small" 
                      color="success" 
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
} 