'use client';
import { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  LocalActivity as NFTIcon,
  BarChart as AnalyticsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Article as ArticleIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Drawer width
const drawerWidth = 260;

export default function AdminLayout({ children }) {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const [open, setOpen] = useState(isLargeScreen);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationEl, setNotificationEl] = useState(null);
  
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationOpen = (event) => {
    setNotificationEl(event.currentTarget);
  };
  
  const handleNotificationClose = () => {
    setNotificationEl(null);
  };
  
  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };
  
  // Navigation items for the sidebar
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Kullanıcılar', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Kategoriler', icon: <CategoryIcon />, path: '/admin/categories' },
    { text: 'İçerik Yönetimi', icon: <ArticleIcon />, path: '/admin/content' },
    { text: 'Kurslar', icon: <SchoolIcon />, path: '/admin/courses' },
    { text: 'Görevler', icon: <QuestIcon />, path: '/admin/quests' },
    { text: 'NFT\'ler', icon: <NFTIcon />, path: '/admin/nfts' },
    { text: 'Analizler', icon: <AnalyticsIcon />, path: '/admin/analytics' },
    { text: 'Ayarlar', icon: <SettingsIcon />, path: '/admin/settings' },
  ];
  
  // Mock notifications
  const notifications = [
    { id: 1, title: 'Yeni Kullanıcı Kaydı', content: 'Ahmet Yılmaz yeni kayıt oldu', time: '5 dakika önce' },
    { id: 2, title: 'Kurs Tamamlama', content: '5 kullanıcı Python Kursu\'nu tamamladı', time: '1 saat önce' },
    { id: 3, title: 'Sistem Güncellemesi', content: 'Yeni versiyon başarıyla yüklendi', time: '3 saat önce' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/admin"
            sx={{
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            WISENTIA ADMIN PANEL
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Notifications */}
          <Box sx={{ display: 'flex' }}>
            <IconButton 
              color="inherit" 
              onClick={handleNotificationOpen}
              size="large"
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={notificationEl}
              open={Boolean(notificationEl)}
              onClose={handleNotificationClose}
              sx={{ mt: '45px' }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            >
              <Typography variant="subtitle1" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
                Bildirimler
              </Typography>
              <Divider />
              {notifications.map((notification) => (
                <MenuItem key={notification.id} onClick={handleNotificationClose}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 250 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {notification.title}
                    </Typography>
                    <Typography variant="body2">{notification.content}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.time}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
              <Divider />
              <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                <Typography 
                  component={Link} 
                  href="/admin/notifications" 
                  variant="body2" 
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                >
                  Tüm Bildirimleri Görüntüle
                </Typography>
              </Box>
            </Menu>
            
            {/* User Profile */}
            <Tooltip title="Hesap ayarları">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="large"
                edge="end"
                aria-haspopup="true"
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32 }} alt={user?.Username || 'Admin'}>
                  {user?.FirstName?.charAt(0) || 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              sx={{ mt: '45px' }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1">{user?.FirstName} {user?.LastName}</Typography>
                <Typography variant="body2" color="text.secondary">Administrator</Typography>
              </Box>
              <Divider />
              <MenuItem component={Link} href="/admin/profile" onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                Profil
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Çıkış Yap
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant={isLargeScreen ? "permanent" : "temporary"}
        open={open}
        onClose={isLargeScreen ? undefined : handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', my: 2 }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  component={Link} 
                  href={item.path}
                  selected={pathname === item.path}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderLeft: pathname === item.path ? 
                      `4px solid ${theme.palette.primary.main}` : 
                      '4px solid transparent',
                    backgroundColor: pathname === item.path ? 
                      'rgba(0, 0, 0, 0.04)' : 
                      'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: pathname === item.path ? 
                      theme.palette.primary.main : 
                      theme.palette.text.secondary,
                    minWidth: 40 
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: pathname === item.path ? 'bold' : 'normal'
                    }}
                    sx={{ 
                      color: pathname === item.path ? 
                        theme.palette.primary.main : 
                        theme.palette.text.primary
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Wisentia
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Yönetim Paneli v1.0
            </Typography>
          </Box>
        </Box>
      </Drawer>
      
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}