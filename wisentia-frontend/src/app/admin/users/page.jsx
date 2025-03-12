'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Menu,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  alpha,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  ListItemIcon,
  Switch,
  Tab,
  Tabs,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  Assessment as AssessmentIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Star as StarIcon,
  Wallet as WalletIcon,
  Visibility as VisibilityIcon // Bu satırı ekleyin
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

// Mock eğitim seviyeleri
const educationLevels = [
  { value: 1, label: 'İlkokul' },
  { value: 2, label: 'Ortaokul' },
  { value: 3, label: 'Lise' },
  { value: 4, label: 'Üniversite' },
  { value: 5, label: 'Profesyonel' }
];

// Mock kullanıcılar
const mockUsers = [
  {
    id: 1,
    username: 'ahmetyilmaz',
    email: 'ahmet.yilmaz@example.com',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    dateOfBirth: '1990-05-15',
    educationLevel: 4,
    points: 1250,
    walletAddress: '0x1a2b3c4d5e6f...',
    status: 'active',
    isAdmin: false,
    createdAt: '2023-10-15T14:30:00Z',
    lastLoginAt: '2023-11-20T09:15:00Z',
    completedCourses: 8,
    inProgressCourses: 3,
    completedQuests: 15,
    nftCount: 6
  },
  {
    id: 2,
    username: 'aysedemir',
    email: 'ayse.demir@example.com',
    firstName: 'Ayşe',
    lastName: 'Demir',
    dateOfBirth: '1992-08-22',
    educationLevel: 5,
    points: 980,
    walletAddress: '0x7e8f9a0b1c2d...',
    status: 'active',
    isAdmin: false,
    createdAt: '2023-09-22T11:45:00Z',
    lastLoginAt: '2023-11-21T16:20:00Z',
    completedCourses: 6,
    inProgressCourses: 2,
    completedQuests: 12,
    nftCount: 4
  },
  {
    id: 3,
    username: 'mehmetcan',
    email: 'mehmet.can@example.com',
    firstName: 'Mehmet',
    lastName: 'Can',
    dateOfBirth: '1988-03-10',
    educationLevel: 3,
    points: 720,
    walletAddress: '0x3d4e5f6a7b8c...',
    status: 'inactive',
    isAdmin: false,
    createdAt: '2023-08-10T09:30:00Z',
    lastLoginAt: '2023-10-05T14:10:00Z',
    completedCourses: 4,
    inProgressCourses: 1,
    completedQuests: 7,
    nftCount: 2
  },
  {
    id: 4,
    username: 'zeynepyildiz',
    email: 'zeynep.yildiz@example.com',
    firstName: 'Zeynep',
    lastName: 'Yıldız',
    dateOfBirth: '1995-12-03',
    educationLevel: 4,
    points: 1540,
    walletAddress: '0x9a0b1c2d3e4f...',
    status: 'active',
    isAdmin: true,
    createdAt: '2023-07-15T15:20:00Z',
    lastLoginAt: '2023-11-19T10:30:00Z',
    completedCourses: 10,
    inProgressCourses: 2,
    completedQuests: 20,
    nftCount: 8
  },
  {
    id: 5,
    username: 'mustafaozturk',
    email: 'mustafa.ozturk@example.com',
    firstName: 'Mustafa',
    lastName: 'Öztürk',
    dateOfBirth: '1991-07-28',
    educationLevel: 4,
    points: 830,
    walletAddress: '0x5f6a7b8c9d0e...',
    status: 'active',
    isAdmin: false,
    createdAt: '2023-06-28T08:45:00Z',
    lastLoginAt: '2023-11-18T13:25:00Z',
    completedCourses: 5,
    inProgressCourses: 3,
    completedQuests: 10,
    nftCount: 3
  },
  {
    id: 6,
    username: 'elifkaya',
    email: 'elif.kaya@example.com',
    firstName: 'Elif',
    lastName: 'Kaya',
    dateOfBirth: '1997-02-14',
    educationLevel: 2,
    points: 420,
    walletAddress: '0xb1c2d3e4f5a6...',
    status: 'suspended',
    isAdmin: false,
    createdAt: '2023-10-05T16:15:00Z',
    lastLoginAt: '2023-10-28T11:40:00Z',
    completedCourses: 2,
    inProgressCourses: 1,
    completedQuests: 4,
    nftCount: 1
  },
  {
    id: 7,
    username: 'aliyildirim',
    email: 'ali.yildirim@example.com',
    firstName: 'Ali',
    lastName: 'Yıldırım',
    dateOfBirth: '1985-09-17',
    educationLevel: 5,
    points: 1680,
    walletAddress: '0xd3e4f5a6b7c8...',
    status: 'active',
    isAdmin: false,
    createdAt: '2023-05-12T10:20:00Z',
    lastLoginAt: '2023-11-20T15:50:00Z',
    completedCourses: 12,
    inProgressCourses: 0,
    completedQuests: 25,
    nftCount: 10
  },
  {
    id: 8,
    username: 'merveaktas',
    email: 'merve.aktas@example.com',
    firstName: 'Merve',
    lastName: 'Aktaş',
    dateOfBirth: '1993-11-30',
    educationLevel: 3,
    points: 910,
    walletAddress: '0x2d3e4f5a6b7c...',
    status: 'active',
    isAdmin: false,
    createdAt: '2023-08-30T13:10:00Z',
    lastLoginAt: '2023-11-15T09:35:00Z',
    completedCourses: 6,
    inProgressCourses: 4,
    completedQuests: 13,
    nftCount: 5
  },
  {
    id: 9,
    username: 'emresahin',
    email: 'emre.sahin@example.com',
    firstName: 'Emre',
    lastName: 'Şahin',
    dateOfBirth: '1989-04-25',
    educationLevel: 4,
    points: 750,
    walletAddress: '0xe4f5a6b7c8d9...',
    status: 'inactive',
    isAdmin: false,
    createdAt: '2023-09-18T12:25:00Z',
    lastLoginAt: '2023-11-01T16:45:00Z',
    completedCourses: 4,
    inProgressCourses: 1,
    completedQuests: 8,
    nftCount: 2
  },
  {
    id: 10,
    username: 'selimsari',
    email: 'selim.sari@example.com',
    firstName: 'Selim',
    lastName: 'Sarı',
    dateOfBirth: '1994-01-20',
    educationLevel: 5,
    points: 1320,
    walletAddress: '0xf5a6b7c8d9e0...',
    status: 'active',
    isAdmin: false,
    createdAt: '2023-07-25T14:50:00Z',
    lastLoginAt: '2023-11-21T08:15:00Z',
    completedCourses: 9,
    inProgressCourses: 2,
    completedQuests: 18,
    nftCount: 7
  }
];

// Mock kurslar
const mockCourses = [
  { id: 1, title: 'Python Temelleri', category: 'Programlama', progress: 100 },
  { id: 2, title: 'Web Geliştirme', category: 'Programlama', progress: 85 },
  { id: 3, title: 'Veri Bilimi Giriş', category: 'Veri Bilimi', progress: 72 },
  { id: 4, title: 'JavaScript Temelleri', category: 'Programlama', progress: 100 },
  { id: 5, title: 'React Framework', category: 'Web Geliştirme', progress: 50 },
  { id: 6, title: 'Veri Yapıları ve Algoritmalar', category: 'Bilgisayar Bilimi', progress: 65 },
  { id: 7, title: 'İngilizce B1', category: 'Yabancı Dil', progress: 100 },
  { id: 8, title: 'İngilizce B2', category: 'Yabancı Dil', progress: 40 },
];

// Mock görevler
const mockQuests = [
  { id: 1, title: 'Python Algoritmalar', category: 'Programlama', completed: true, score: 95 },
  { id: 2, title: 'Web Tasarım Projesi', category: 'Web Geliştirme', completed: true, score: 88 },
  { id: 3, title: 'Veri Analizi Görevi', category: 'Veri Bilimi', completed: true, score: 92 },
  { id: 4, title: 'JavaScript Uygulaması', category: 'Programlama', completed: true, score: 85 },
  { id: 5, title: 'React Component Challenge', category: 'Web Geliştirme', completed: false, score: 0 },
];

// Mock NFT'ler
const mockNFTs = [
  { id: 1, name: 'Python Master', rarity: 'Nadir', acquired: '2023-04-15' },
  { id: 2, name: 'Web Developer', rarity: 'Yaygın', acquired: '2023-05-22' },
  { id: 3, name: 'Data Scientist Beginner', rarity: 'Yaygın', acquired: '2023-06-10' },
  { id: 4, name: 'JavaScript Guru', rarity: 'Nadir', acquired: '2023-07-18' },
  { id: 5, name: 'English Speaker', rarity: 'Yaygın', acquired: '2023-08-05' },
];

// Mock etkinlikler
const mockActivities = [
  { id: 1, type: 'course_completed', title: 'Python Temelleri kursunu tamamladı', date: '2023-10-15' },
  { id: 2, type: 'quest_completed', title: 'Web Tasarım Projesi görevini tamamladı', date: '2023-10-22' },
  { id: 3, type: 'nft_earned', title: 'JavaScript Guru NFT\'sini kazandı', date: '2023-11-05' },
  { id: 4, type: 'login', title: 'Platforma giriş yaptı', date: '2023-11-18' },
  { id: 5, type: 'points_earned', title: '200 puan kazandı', date: '2023-11-20' },
];

// Kullanıcı durumlarının renkleri
const statusColors = {
  active: 'success',
  inactive: 'default',
  suspended: 'error'
};

// Kullanıcı durumları Türkçe karşılıkları
const statusLabels = {
  active: 'Aktif',
  inactive: 'Pasif',
  suspended: 'Askıya Alınmış'
};

// Tabpanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-detail-tabpanel-${index}`}
      aria-labelledby={`user-detail-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Kullanıcı detay drawer componenti
const UserDetailDrawer = ({ open, user, onClose }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  if (!user) return null;
  
  // Eğitim seviyesi adını al
  const getEducationLevelName = (level) => {
    const educationLevel = educationLevels.find(l => l.value === level);
    return educationLevel ? educationLevel.label : 'Bilinmiyor';
  };
  
  // Tab değişimi
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Kurs ilerleme grafiği verileri
  const courseProgressData = [
    { name: 'Tamamlanan', value: user.completedCourses },
    { name: 'Devam Eden', value: user.inProgressCourses },
  ];
  
  // Aktivite grafiği için veriler (son 5 ay)
  const activityData = [
    { name: 'Tem', value: 12 },
    { name: 'Ağu', value: 19 },
    { name: 'Eyl', value: 10 },
    { name: 'Eki', value: 25 },
    { name: 'Kas', value: 18 },
  ];
  
  // Pasta grafiği için renkler
  const COLORS = [theme.palette.primary.main, theme.palette.info.main];
  
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500, md: 700 }, p: 0 }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" component="div">
          Kullanıcı Detayları
        </Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>
      
      {/* Kullanıcı başlık bilgileri */}
      <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{ width: 80, height: 80, bgcolor: theme.palette.primary.main }}
        >
          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            @{user.username}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Chip 
              label={statusLabels[user.status]} 
              color={statusColors[user.status]} 
              size="small" 
            />
            {user.isAdmin && (
              <Chip 
                label="Admin" 
                color="primary" 
                variant="outlined" 
                size="small" 
              />
            )}
          </Box>
        </Box>
      </Box>
      
      {/* Tab menü */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="user detail tabs">
          <Tab label="Genel Bilgiler" id="user-detail-tab-0" aria-controls="user-detail-tabpanel-0" />
          <Tab label="Kurslar" id="user-detail-tab-1" aria-controls="user-detail-tabpanel-1" />
          <Tab label="Görevler" id="user-detail-tab-2" aria-controls="user-detail-tabpanel-2" />
          <Tab label="NFT'ler" id="user-detail-tab-3" aria-controls="user-detail-tabpanel-3" />
          <Tab label="Aktivite" id="user-detail-tab-4" aria-controls="user-detail-tabpanel-4" />
        </Tabs>
      </Box>
      
      {/* Genel Bilgiler Tab */}
      <Box sx={{ p: 3 }}>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText primary="E-posta" secondary={user.email} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon />
                  </ListItemIcon>
                  <ListItemText primary="Doğum Tarihi" secondary={new Date(user.dateOfBirth).toLocaleDateString('tr-TR')} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon />
                  </ListItemIcon>
                  <ListItemText primary="Eğitim Seviyesi" secondary={getEducationLevelName(user.educationLevel)} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <StarIcon />
                  </ListItemIcon>
                  <ListItemText primary="Toplam Puan" secondary={user.points} />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} sm={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon />
                  </ListItemIcon>
                  <ListItemText primary="Kayıt Tarihi" secondary={new Date(user.createdAt).toLocaleDateString('tr-TR')} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon />
                  </ListItemIcon>
                  <ListItemText primary="Son Giriş" secondary={new Date(user.lastLoginAt).toLocaleDateString('tr-TR')} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WalletIcon />
                  </ListItemIcon>
                  <ListItemText primary="Cüzdan Adresi" secondary={user.walletAddress} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Hesap Durumu" 
                    secondary={
                      <Chip 
                        label={statusLabels[user.status]} 
                        color={statusColors[user.status]} 
                        size="small" 
                        sx={{ mt: 0.5 }}
                      />
                    } 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            İstatistikler
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Kurs İlerlemesi
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={courseProgressData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {courseProgressData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Aylık Aktivite
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={activityData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill={theme.palette.primary.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Kurslar Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Kullanıcının Kursları
          </Typography>
          
          <List>
            {mockCourses.map((course) => (
              <ListItem key={course.id} sx={{ px: 0, py: 1 }}>
                <ListItemIcon>
                  <SchoolIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={course.title} 
                  secondary={course.category} 
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
                <Box>
                  <Typography variant="body2" color="text.secondary" align="right" gutterBottom>
                    {course.progress}% tamamlandı
                  </Typography>
                  <Box sx={{ width: 100, position: 'relative' }}>
                    <Box
                      sx={{
                        width: '100%',
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        borderRadius: 5,
                        height: 5,
                      }}
                    />
                    <Box
                      sx={{
                        width: `${course.progress}%`,
                        backgroundColor: course.progress === 100 ? theme.palette.success.main : theme.palette.primary.main,
                        borderRadius: 5,
                        height: 5,
                        position: 'absolute',
                        top: 0,
                      }}
                    />
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </TabPanel>
        
        {/* Görevler Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Kullanıcının Görevleri
          </Typography>
          
          <List>
            {mockQuests.map((quest) => (
              <ListItem key={quest.id} sx={{ px: 0, py: 1 }}>
                <ListItemIcon>
                  {quest.completed 
                    ? <CheckCircleIcon color="success" /> 
                    : <QuestIcon color="primary" />
                  }
                </ListItemIcon>
                <ListItemText 
                  primary={quest.title} 
                  secondary={quest.category} 
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
                <Box>
                  {quest.completed ? (
                    <Chip 
                      label={`${quest.score} puan`} 
                      color="success" 
                      size="small" 
                      variant="outlined" 
                    />
                  ) : (
                    <Chip 
                      label="Devam Ediyor" 
                      color="info" 
                      size="small" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </TabPanel>
        
        {/* NFT'ler Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Kullanıcının NFT'leri
          </Typography>
          
          <Grid container spacing={2}>
            {mockNFTs.map((nft) => (
              <Grid item xs={12} sm={6} key={nft.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        variant="rounded" 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          bgcolor: alpha(theme.palette.primary.main, 0.1) 
                        }}
                      >
                        <NFTIcon sx={{ color: theme.palette.primary.main }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{nft.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip 
                            label={nft.rarity} 
                            size="small" 
                            color={nft.rarity === 'Nadir' ? 'secondary' : 'default'} 
                          />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(nft.acquired).toLocaleDateString('tr-TR')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        
        {/* Aktivite Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Son Aktiviteler
          </Typography>
          
          <List>
            {mockActivities.map((activity) => (
              <ListItem key={activity.id} sx={{ px: 0, py: 1 }}>
                <ListItemIcon>
                  {activity.type === 'course_completed' && <SchoolIcon color="primary" />}
                  {activity.type === 'quest_completed' && <AssignmentTurnedInIcon color="success" />}
                  {activity.type === 'nft_earned' && <NFTIcon color="secondary" />}
                  {activity.type === 'login' && <PersonIcon color="info" />}
                  {activity.type === 'points_earned' && <StarIcon color="warning" />}
                </ListItemIcon>
                <ListItemText 
                  primary={activity.title} 
                  secondary={new Date(activity.date).toLocaleDateString('tr-TR')} 
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Box>
    </Drawer>
  );
};

export default function UserManagement() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [educationLevelFilter, setEducationLevelFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(false);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [targetUserId, setTargetUserId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Arama işlevi
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Filtre işlevleri
  const handleStatusChange = (event) => {
    setUserStatus(event.target.value);
    setPage(0);
  };

  const handleEducationLevelChange = (event) => {
    setEducationLevelFilter(event.target.value);
    setPage(0);
  };

  // Sayfala işlevleri
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Kullanıcı detaylarını göster
  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setUserDetailOpen(true);
  };

  // Kullanıcı detay drawer'ını kapat
  const handleCloseUserDetail = () => {
    setUserDetailOpen(false);
  };
  
  // Kullanıcı menüsü aç
  const handleOpenUserMenu = (event, userId) => {
    setMenuAnchorEl(event.currentTarget);
    setTargetUserId(userId);
  };
  
  // Kullanıcı menüsü kapat
  const handleCloseUserMenu = () => {
    setMenuAnchorEl(null);
    setTargetUserId(null);
  };
  
  // Kullanıcı silme onayı dialogu aç
  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
    handleCloseUserMenu();
  };
  
  // Kullanıcı silme onayı dialogu kapat
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };
  
  // Kullanıcı silme işlevi
  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter(user => user.id !== userToDelete.id));
    }
    handleCloseDeleteDialog();
  };
  
  // Kullanıcı durumunu değiştir
  const handleToggleUserStatus = (userId, newStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    handleCloseUserMenu();
  };
  
  // Kullanıcı düzenleme dialogu aç
  const handleOpenEditDialog = (user) => {
    setUserToEdit(user);
    setEditUserDialogOpen(true);
    handleCloseUserMenu();
  };
  
  // Kullanıcı düzenleme dialogu kapat
  const handleCloseEditDialog = () => {
    setEditUserDialogOpen(false);
    setUserToEdit(null);
  };
  
  // Kullanıcı ekleme dialogu aç
  const handleOpenAddDialog = () => {
    setAddUserDialogOpen(true);
  };
  
  // Kullanıcı ekleme dialogu kapat
  const handleCloseAddDialog = () => {
    setAddUserDialogOpen(false);
  };
  
  // Kullanıcı verisini yenile
  const handleRefreshUsers = () => {
    setLoading(true);
    // Burada gerçek bir API çağrısı yapılacak
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  // Eğitim seviyesi adını al
  const getEducationLevelName = (level) => {
    const educationLevel = educationLevels.find(l => l.value === level);
    return educationLevel ? educationLevel.label : 'Bilinmiyor';
  };
  
  // Filtreleme işlemi
  const filteredUsers = users.filter(user => {
    // Arama terimine göre filtrele
    const searchMatch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Durum filtresine göre filtrele
    const statusMatch = userStatus ? user.status === userStatus : true;
    
    // Eğitim seviyesi filtresine göre filtrele
    const educationLevelMatch = educationLevelFilter ? user.educationLevel === parseInt(educationLevelFilter) : true;
    
    return searchMatch && statusMatch && educationLevelMatch;
  });
  
  // Sayfada gösterilecek kullanıcılar
  const visibleUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Kullanıcı Yönetimi
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Yeni Kullanıcı
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshUsers}
          >
            Yenile
          </Button>
        </Box>
      </Box>
      
      {/* Filtreleme ve Arama */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Kullanıcı Ara"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Kullanıcı Durumu</InputLabel>
            <Select
              value={userStatus}
              label="Kullanıcı Durumu"
              onChange={handleStatusChange}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="inactive">Pasif</MenuItem>
              <MenuItem value="suspended">Askıya Alınmış</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Eğitim Seviyesi</InputLabel>
            <Select
              value={educationLevelFilter}
              label="Eğitim Seviyesi"
              onChange={handleEducationLevelChange}
            >
              <MenuItem value="">Tümü</MenuItem>
              {educationLevels.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Typography variant="body2" color="text.secondary">
            Toplam: {filteredUsers.length} kullanıcı
          </Typography>
        </Box>
      </Paper>
      
      {/* Kullanıcı Tablosu */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }} aria-label="kullanıcılar tablosu">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Kullanıcı</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>E-posta</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Eğitim Seviyesi</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Puanlar</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Durum</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Son Giriş</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : visibleUsers.length > 0 ? (
                visibleUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                          {user.firstName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getEducationLevelName(user.educationLevel)}</TableCell>
                    <TableCell align="center">{user.points.toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={statusLabels[user.status]} 
                        color={statusColors[user.status]} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      {new Date(user.lastLoginAt).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Detaylar">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleViewUserDetails(user)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton 
                        size="small"
                        onClick={(e) => handleOpenUserMenu(e, user.id)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1">
                      Kullanıcı bulunamadı.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına kullanıcı:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
      
      {/* Kullanıcı Detay Drawer */}
      <UserDetailDrawer 
        open={userDetailOpen} 
        user={selectedUser} 
        onClose={handleCloseUserDetail} 
      />
      
      {/* Kullanıcı Menüsü */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseUserMenu}
      >
        {targetUserId && (
          <>
            <MenuItem onClick={() => {
              const user = users.find(u => u.id === targetUserId);
              handleViewUserDetails(user);
              handleCloseUserMenu();
            }}>
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Detayları Görüntüle</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              const user = users.find(u => u.id === targetUserId);
              handleOpenEditDialog(user);
            }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Düzenle</ListItemText>
            </MenuItem>
            <Divider />
            {users.find(u => u.id === targetUserId)?.status === 'active' ? (
              <MenuItem onClick={() => handleToggleUserStatus(targetUserId, 'inactive')}>
                <ListItemIcon>
                  <BlockIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Devre Dışı Bırak</ListItemText>
              </MenuItem>
            ) : (
              <MenuItem onClick={() => handleToggleUserStatus(targetUserId, 'active')}>
                <ListItemIcon>
                  <CheckCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Aktifleştir</ListItemText>
              </MenuItem>
            )}
            <MenuItem onClick={() => {
              const user = users.find(u => u.id === targetUserId);
              handleOpenDeleteDialog(user);
            }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: theme.palette.error.main }}>Sil</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
      
      {/* Kullanıcı Silme Onayı */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Kullanıcıyı Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {userToDelete && (
              <>
                <strong>{userToDelete.firstName} {userToDelete.lastName}</strong> adlı kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>İptal</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}