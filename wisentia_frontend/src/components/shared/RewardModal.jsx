import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Button, DialogActions } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Image from 'next/image';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

export default function RewardModal({ open, onClose, rewardPoints, rewardNft }) {
  const [width, height] = useWindowSize();
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundImage: 'linear-gradient(to bottom right, #2e1065, #4c1d95)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 2,
          overflow: 'hidden',
        }
      }}
    >
      {open && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      
      <DialogTitle sx={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold', pt: 4 }}>
        Tebrikler! 🎉
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
            Görev ödülünü kazandınız!
          </Typography>
          
          {rewardPoints > 0 && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.5)',
              width: '100%',
              justifyContent: 'center'
            }}>
              <StarIcon sx={{ color: 'gold', fontSize: '2rem', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'gold' }}>
                +{rewardPoints} Puan
              </Typography>
            </Box>
          )}
          
          {rewardNft && (
            <Box sx={{ 
              mt: 3, 
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              width: '100%',
              textAlign: 'center'
            }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                <EmojiEventsIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#FFD700' }} />
                NFT Ödülü Kazandınız
              </Typography>
              
              <Box sx={{ position: 'relative', width: '100%', height: 240, mb: 2 }}>
                <Image
                  src={rewardNft.imageUri || "/placeholder-nft.jpg"}
                  alt={rewardNft.title}
                  layout="fill"
                  objectFit="contain"
                />
              </Box>
              
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {rewardNft.title}
              </Typography>
              
              <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                {rewardNft.description}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button 
          variant="contained" 
          onClick={onClose}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
            }
          }}
        >
          Harika!
        </Button>
      </DialogActions>
    </Dialog>
  );
} 