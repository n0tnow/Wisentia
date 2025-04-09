'use client';

import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Link, 
  Grid, 
  Divider, 
  IconButton,
  TextField,
  Button,
  useTheme,
  alpha,
  Tooltip,
  Paper
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import TwitterIcon from '@mui/icons-material/Twitter';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
//import DiscordIcon from '@mui/icons-material/Discord';
import TelegramIcon from '@mui/icons-material/Telegram';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';

export default function Footer() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    // Subscription logic here
    console.log('Subscribed with email:', email);
    setEmail('');
  };
  
  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { name: 'Courses', href: '/courses' },
        { name: 'Quests', href: '/quests' },
        { name: 'NFT Marketplace', href: '/nfts' },
        { name: 'Community', href: '/community' },
        { name: 'Leaderboard', href: '/leaderboard' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Partners', href: '/partners' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'FAQs', href: '/faqs' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' }
      ]
    }
  ];
  
  const socialLinks = [
    { name: 'Twitter', icon: <TwitterIcon />, href: '#' },
    //{ name: 'Discord', icon: <DiscordIcon />, href: '#' },
    { name: 'GitHub', icon: <GitHubIcon />, href: '#' },
    { name: 'LinkedIn', icon: <LinkedInIcon />, href: '#' },
    { name: 'Telegram', icon: <TelegramIcon />, href: '#' }
  ];

  return (
    <Box 
      component="footer" 
      sx={{ 
        position: 'relative',
        py: 6, 
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'light' 
          ? alpha(theme.palette.primary.light, 0.05)
          : alpha(theme.palette.background.paper, 0.4),
        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: theme.palette.mode === 'dark' 
            ? `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.primary.dark, 0.15)} 0%, transparent 40%), 
              radial-gradient(circle at 80% 70%, ${alpha(theme.palette.secondary.dark, 0.1)} 0%, transparent 40%)`
            : `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.primary.light, 0.15)} 0%, transparent 40%), 
              radial-gradient(circle at 80% 70%, ${alpha(theme.palette.secondary.light, 0.1)} 0%, transparent 40%)`,
          zIndex: -1,
        }
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          <Grid 
            item 
            xs={12} 
            md={4}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                  mr: 1.5,
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(45deg, transparent 30%, ${alpha('#fff', 0.2)} 40%, ${alpha('#fff', 0.3)} 50%, ${alpha('#fff', 0.2)} 60%, transparent 70%)`,
                    backgroundSize: '200% 200%',
                    animation: 'shimmer 3s infinite linear',
                  },
                  '@keyframes shimmer': {
                    '0%': { backgroundPosition: '0% 0%' },
                    '100%': { backgroundPosition: '200% 200%' }
                  }
                }}
              >
                <SchoolIcon sx={{ color: 'white', fontSize: 20, zIndex: 1 }} />
              </Box>
              <Typography 
                variant="h5" 
                component="div"
                sx={{ 
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                WISENTIA
              </Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '90%' }}>
              Web3 tabanlı eğitim platformu, Learn & Earn modeliyle blockchain ve yapay zeka teknolojilerini birleştirerek eğitim deneyiminizi dönüştürüyoruz.
            </Typography>
            
            <Paper
              component="form"
              onSubmit={handleSubscribe}
              elevation={0}
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                maxWidth: 400,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: 3,
                mb: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                }
              }}
            >
              <TextField
                sx={{ ml: 1, flex: 1 }}
                placeholder="Email adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                }}
              />
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <Button 
                type="submit" 
                sx={{ 
                  p: '10px', 
                  borderRadius: '50%',
                  minWidth: 'unset',
                  color: theme.palette.primary.main
                }} 
                aria-label="subscribe"
              >
                <ArrowForwardIcon />
              </Button>
            </Paper>
            
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              {socialLinks.map((item) => (
                <Tooltip key={item.name} title={item.name}>
                  <IconButton
                    component={motion.div}
                    whileHover={{ y: -5, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href={item.href}
                    target="_blank"
                    rel="noopener"
                    aria-label={item.name}
                    sx={{
                      color: 'text.secondary',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      }
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          </Grid>
          
          {footerLinks.map((section) => (
            <Grid 
              key={section.title} 
              item 
              xs={12} 
              sm={4} 
              md={2.5}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  position: 'relative',
                  display: 'inline-block',
                  mb: 2,
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    width: '40%',
                    height: '3px',
                    borderRadius: '2px',
                    bottom: '-6px',
                    left: 0,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }
                }}
              >
                {section.title}
              </Typography>
              <Box 
                component="ul" 
                sx={{ 
                  p: 0, 
                  m: 0, 
                  listStyle: 'none',
                  '& li': {
                    mb: 1.5,
                  }
                }}
              >
                {section.links.map((link) => (
                  <Box 
                    component="li" 
                    key={link.name}
                    sx={{
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(5px)',
                      }
                    }}
                  >
                    <Link 
                      href={link.href} 
                      color="inherit" 
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'text.secondary',
                        transition: 'color 0.3s ease',
                        '&:hover': {
                          color: 'primary.main',
                        }
                      }}
                    >
                      {link.name}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
        
        <Divider sx={{ my: 4, opacity: 0.2 }} />
        
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              &copy; {new Date().getFullYear()} Wisentia. Tüm hakları saklıdır.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography variant="body2" color="text.secondary">
              Powered by 
              <Box 
                component="span" 
                sx={{ 
                  ml: 1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold'
                }}
              >
                EduChain
              </Box>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}