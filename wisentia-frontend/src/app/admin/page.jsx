'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
  IconButton,
  LinearProgress,
  Badge,
  Tooltip,
  useTheme,
  alpha,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  LocalActivity as NFTIcon,
  Assignment as AssignmentIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  WatchLater as WatchLaterIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import Link from 'next/link';

export default function AdminDashboard() {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('7days');
  const [isLoading, setIsLoading] = useState(false);
  
  // Grafik için örnek veriler
  const userActivityData = [
    { name: 'Pzt', value: 40 },
    { name: 'Sal', value: 30 },
    { name: 'Çar', value: 45 },
    { name: 'Per', value: 65 },
    { name: 'Cum', value: 55 },
    { name: 'Cmt', value: 35 },
    { name: 'Paz', value: 28 },
  ];
  
  const courseCompletionData = [
    { name: 'Programlama', completed: 67, active: 33 },
    { name: 'Matematik', completed: 45, active: 55 },
    { name: 'Fen', completed: 58, active: 42 },
    { name: 'Dil', completed: 39, active: 61 },
    { name: 'İşletme', completed: 25, active: 75 }
  ];
  
  const userDistributionData = [
    { name: 'Yeni Kullanıcılar', value: 540 },
    { name: 'Aktif Kullanıcılar', value: 1320 },
    { name: 'Pasif Kullanıcılar', value: 380 }
  ];
  
  const COLORS = [theme.palette.primary.main, theme.palette.success.main, theme.palette.error.main];
  
  // Son aktiviteler için örnek veriler
  const recentActivities = [
    { id: 1, type: 'user', name: 'Ahmet Yılmaz', action: 'kayıt oldu', time: '10 dakika önce' },
    { id: 2, type: 'course', name: 'Python Başlangıç', action: 'yayınlandı', time: '2 saat önce' },
    { id: 3, type: 'quest', name: 'Kodlama Görevi', action: '5 kullanıcı tarafından tamamlandı', time: '4 saat önce' },
    { id: 4, type: 'nft', name: 'Python Uzmanı Rozeti', action: 'Merve Demir tarafından kazanıldı', time: '1 gün önce' },
    { id: 5, type: 'user', name: 'Zeynep Kaya', action: '3 kursu tamamladı', time: '2 gün önce' }
  ];
  
  // En başarılı kullanıcılar
  const topPerformers = [
    { id: 1, name: 'Elif Yıldız', points: 1250, courses: 8, quests: 15 },
    { id: 2, name: 'Mustafa Öztürk', points: 980, courses: 6, quests: 12 },
    { id: 3, name: 'Ayşe Çelik', points: 870, courses: 5, quests: 10 }
  ];
  
  const handleRefresh = () => {
    setIsLoading(true);
    // Veri yüklemeyi simüle et
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
    handleRefresh();
  };
  
  // Türkçe zaman dilimi ekranları
  const timeRangeLabels = {
    'today': 'Bugün',
    '7days': 'Son 7 Gün',
    '30days': 'Son 30 Gün',
    '90days': 'Son 90 Gün'
  };
  
  // Süre görselleştirmesi için yardımcı fonksiyon
  const getTimeRangeDisplayText = () => {
    if (timeRange === 'today') return 'gün';
    if (timeRange === '7days') return 'hafta';
    return 'ay';
  };
  
  return (
    <Box>
      {/* Başlık */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Yönetim Paneli
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Zaman Aralığı</InputLabel>
            <Select
              value={timeRange}
              label="Zaman Aralığı"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="today">Bugün</MenuItem>
              <MenuItem value="7days">Son 7 Gün</MenuItem>
              <MenuItem value="30days">Son 30 Gün</MenuItem>
              <MenuItem value="90days">Son 90 Gün</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            variant="outlined"
          >
            Yenile
          </Button>
        </Box>
      </Box>
      
      {/* İstatistik Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: 4, 
              bgcolor: theme.palette.primary.main 
            }} />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Toplam Kullanıcı
                </Typography>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <PersonIcon sx={{ color: theme.palette.primary.main }} />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                2.240
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <ArrowUpwardIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main" component="span">
                  +12,5%
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  geçen {getTimeRangeDisplayText()} göre
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: 4, 
              bgcolor: theme.palette.info.main 
            }} />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Toplam Kurs
                </Typography>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                  <SchoolIcon sx={{ color: theme.palette.info.main }} />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                156
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <ArrowUpwardIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main" component="span">
                  +5,2%
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  geçen {getTimeRangeDisplayText()} göre
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: 4, 
              bgcolor: theme.palette.warning.main 
            }} />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Toplam Görev
                </Typography>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                  <QuestIcon sx={{ color: theme.palette.warning.main }} />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                328
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <ArrowUpwardIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main" component="span">
                  +8,7%
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  geçen {getTimeRangeDisplayText()} göre
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: 4, 
              bgcolor: theme.palette.success.main 
            }} />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Toplam NFT
                </Typography>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                  <NFTIcon sx={{ color: theme.palette.success.main }} />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                842
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <ArrowUpwardIcon sx={{ color: theme.palette.success.main, fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2" color="success.main" component="span">
                  +15,3%
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  geçen {getTimeRangeDisplayText()} göre
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Grafikler */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Kullanıcı Aktivite Grafiği */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ 
            height: '100%', 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}>
            <CardHeader 
              title="Kullanıcı Aktivitesi" 
              subheader="Günlük aktif kullanıcılar"
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ height: 320 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <LinearProgress sx={{ width: '80%' }} />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={userActivityData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={theme.palette.primary.main} 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Kullanıcı Dağılımı Pasta Grafiği */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ 
            height: '100%', 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}>
            <CardHeader 
              title="Kullanıcı Dağılımı" 
              subheader="Aktivite durumuna göre"
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ height: 320 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <LinearProgress sx={{ width: '80%' }} />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: %${(percent * 100).toFixed(0)}`}
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Kurs Tamamlanma Oranları Grafiği */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}>
            <CardHeader 
              title="Kurs Tamamlanma Oranları" 
              subheader="Kategorilere göre"
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ height: 320 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <LinearProgress sx={{ width: '80%' }} />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={courseCompletionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="completed" name="Tamamlanan" stackId="a" fill={theme.palette.success.main} />
                    <Bar dataKey="active" name="Devam Eden" stackId="a" fill={theme.palette.primary.light} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Son Aktiviteler ve En Başarılı Kullanıcılar */}
      <Grid container spacing={3}>
        {/* Son Aktiviteler */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}>
            <CardHeader 
              title="Son Aktiviteler" 
              action={
                <Button 
                  component={Link} 
                  href="/admin/activities"
                  size="small"
                >
                  Tümünü Gör
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List sx={{ width: '100%' }}>
                {recentActivities.map((activity, index) => (
                  <Box key={activity.id}>
                    <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: 
                            activity.type === 'user' ? alpha(theme.palette.primary.main, 0.1) :
                            activity.type === 'course' ? alpha(theme.palette.info.main, 0.1) :
                            activity.type === 'quest' ? alpha(theme.palette.warning.main, 0.1) :
                            alpha(theme.palette.success.main, 0.1)
                        }}>
                          {activity.type === 'user' ? <PersonIcon sx={{ color: theme.palette.primary.main }} /> :
                           activity.type === 'course' ? <SchoolIcon sx={{ color: theme.palette.info.main }} /> :
                           activity.type === 'quest' ? <QuestIcon sx={{ color: theme.palette.warning.main }} /> :
                           <NFTIcon sx={{ color: theme.palette.success.main }} />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box component="span" fontWeight="medium">
                            {activity.name}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {activity.action}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              {activity.time}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* En Başarılı Kullanıcılar */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}>
            <CardHeader 
              title="En Başarılı Kullanıcılar" 
              action={
                <Button 
                  component={Link} 
                  href="/admin/users"
                  size="small"
                >
                  Tümünü Gör
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List sx={{ width: '100%' }}>
                {topPerformers.map((performer, index) => (
                  <Box key={performer.id}>
                    <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar>{performer.name.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box component="span" fontWeight="medium">
                            {performer.name}
                          </Box>
                        }
                        secondary={
                          <>
                            <Box sx={{ display: 'flex', mt: 1 }}>
                              <Box sx={{ mr: 2 }}>
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Puanlar
                                </Typography>
                                <Typography component="div" variant="subtitle2" fontWeight="bold">
                                  {performer.points}
                                </Typography>
                              </Box>
                              <Box sx={{ mr: 2 }}>
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Kurslar
                                </Typography>
                                <Typography component="div" variant="subtitle2" fontWeight="bold">
                                  {performer.courses}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Görevler
                                </Typography>
                                <Typography component="div" variant="subtitle2" fontWeight="bold">
                                  {performer.quests}
                                </Typography>
                              </Box>
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                    {index < topPerformers.length - 1 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}