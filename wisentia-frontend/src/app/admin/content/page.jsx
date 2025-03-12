'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Grid,
  Paper,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Category as CategoryIcon,
  School as SchoolIcon,
  Menu as MenuIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
  Visibility as VisibilityIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

// Mock kategori verileri
const mockCategories = [
  { id: 1, name: 'Programlama', description: 'Programlama dilleri ve algoritmalar', educationLevel: null, iconUrl: '/icons/programming.png', courseCount: 25 },
  { id: 2, name: 'Matematik', description: 'Temel ve ileri matematik konuları', educationLevel: null, iconUrl: '/icons/math.png', courseCount: 18 },
  { id: 3, name: 'Fen Bilimleri', description: 'Fizik, kimya ve biyoloji', educationLevel: null, iconUrl: '/icons/science.png', courseCount: 15 },
  { id: 4, name: 'Dil Öğrenimi', description: 'Yabancı dil eğitimi', educationLevel: null, iconUrl: '/icons/language.png', courseCount: 12 },
  { id: 5, name: 'İşletme', description: 'İşletme ve yönetim eğitimi', educationLevel: null, iconUrl: '/icons/business.png', courseCount: 10 },
  { id: 6, name: 'Müzik', description: 'Müzik teorisi ve enstrüman eğitimi', educationLevel: null, iconUrl: '/icons/music.png', courseCount: 8 },
  { id: 7, name: 'Sanat', description: 'Çizim, boyama ve diğer sanat dalları', educationLevel: null, iconUrl: '/icons/art.png', courseCount: 7 },
  { id: 8, name: 'Tarih', description: 'Dünya ve Türkiye tarihi', educationLevel: null, iconUrl: '/icons/history.png', courseCount: 5 },
];

// Mock kurs verileri
const mockCourses = [
  { id: 1, title: 'Python Temelleri', description: 'Python programlama dilinin temel prensipleri', categoryId: 1, educationLevel: 3, difficultyLevel: 1, durationMinutes: 480, points: 100, price: 0, isPremium: false, createdAt: '2023-01-15T10:30:00Z' },
  { id: 2, title: 'İleri Python', description: 'Python ile nesne yönelimli programlama', categoryId: 1, educationLevel: 4, difficultyLevel: 3, durationMinutes: 720, points: 200, price: 150, isPremium: true, createdAt: '2023-02-20T14:45:00Z' },
  { id: 3, title: 'Calculus 101', description: 'Temel kalkülüs ve türev', categoryId: 2, educationLevel: 4, difficultyLevel: 2, durationMinutes: 540, points: 150, price: 0, isPremium: false, createdAt: '2023-03-10T11:15:00Z' },
  { id: 4, title: 'İngilizce Başlangıç', description: 'Temel İngilizce dil bilgisi', categoryId: 4, educationLevel: 2, difficultyLevel: 1, durationMinutes: 800, points: 120, price: 0, isPremium: false, createdAt: '2023-04-05T09:20:00Z' },
  { id: 5, title: 'Web Geliştirme', description: 'HTML, CSS ve JavaScript temelleri', categoryId: 1, educationLevel: 3, difficultyLevel: 2, durationMinutes: 600, points: 180, price: 100, isPremium: true, createdAt: '2023-05-18T15:30:00Z' },
  { id: 6, title: 'İşletme Stratejileri', description: 'Modern iş dünyasında stratejik planlama', categoryId: 5, educationLevel: 5, difficultyLevel: 4, durationMinutes: 720, points: 220, price: 200, isPremium: true, createdAt: '2023-06-22T13:45:00Z' },
  { id: 7, title: 'Genel Fizik', description: 'Mekanik, elektrik ve manyetizma', categoryId: 3, educationLevel: 3, difficultyLevel: 3, durationMinutes: 540, points: 160, price: 0, isPremium: false, createdAt: '2023-07-14T10:10:00Z' },
  { id: 8, title: 'Piyano Başlangıç', description: 'Piyano çalmayı öğrenme', categoryId: 6, educationLevel: 2, difficultyLevel: 2, durationMinutes: 480, points: 130, price: 120, isPremium: true, createdAt: '2023-08-30T16:20:00Z' },
];

// Mock içerik verileri
const mockContents = [
  { id: 1, courseId: 1, title: 'Python Kurulumu', contentType: 'video', contentUrl: 'https://example.com/videos/python-setup.mp4', sequence: 1, durationMinutes: 15 },
  { id: 2, courseId: 1, title: 'Değişkenler ve Veri Tipleri', contentType: 'video', contentUrl: 'https://example.com/videos/python-variables.mp4', sequence: 2, durationMinutes: 25 },
  { id: 3, courseId: 1, title: 'Koşullu İfadeler', contentType: 'text', contentUrl: null, sequence: 3, durationMinutes: 20 },
  { id: 4, courseId: 1, title: 'Döngüler', contentType: 'interactive', contentUrl: 'https://example.com/interactive/python-loops.html', sequence: 4, durationMinutes: 30 },
  { id: 5, courseId: 2, title: 'Sınıflar ve Nesneler', contentType: 'video', contentUrl: 'https://example.com/videos/python-classes.mp4', sequence: 1, durationMinutes: 40 },
  { id: 6, courseId: 2, title: 'Kalıtım', contentType: 'text', contentUrl: null, sequence: 2, durationMinutes: 30 },
  { id: 7, courseId: 3, title: 'Limit Kavramı', contentType: 'video', contentUrl: 'https://example.com/videos/calculus-limits.mp4', sequence: 1, durationMinutes: 35 },
  { id: 8, courseId: 3, title: 'Türev Alma Kuralları', contentType: 'interactive', contentUrl: 'https://example.com/interactive/calculus-derivatives.html', sequence: 2, durationMinutes: 45 },
];

// Eğitim seviyeleri
const educationLevels = [
  { value: 1, label: 'İlkokul' },
  { value: 2, label: 'Ortaokul' },
  { value: 3, label: 'Lise' },
  { value: 4, label: 'Üniversite' },
  { value: 5, label: 'Profesyonel' },
];

// Zorluk seviyeleri
const difficultyLevels = [
  { value: 1, label: 'Başlangıç' },
  { value: 2, label: 'Temel' },
  { value: 3, label: 'Orta' },
  { value: 4, label: 'İleri' },
  { value: 5, label: 'Uzman' },
];

// İçerik tipleri
const contentTypes = [
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Metin' },
  { value: 'interactive', label: 'Etkileşimli' },
];

// Tab içerikleri
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default function ContentManagement() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterEducationLevel, setFilterEducationLevel] = useState('');
  
  // Kategori state'leri
  const [categories, setCategories] = useState(mockCategories);
  const [categoryPage, setCategoryPage] = useState(0);
  const [categoryRowsPerPage, setCategoryRowsPerPage] = useState(5);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Kurs state'leri
  const [courses, setCourses] = useState(mockCourses);
  const [coursePage, setCoursePage] = useState(0);
  const [courseRowsPerPage, setCourseRowsPerPage] = useState(5);
  const [courseDialog, setCourseDialog] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  
  // İçerik state'leri
  const [contents, setContents] = useState(mockContents);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [contentDialog, setContentDialog] = useState(false);
  const [contentToEdit, setContentToEdit] = useState(null);
  const [contentToDelete, setContentToDelete] = useState(null);
  
  // Bildirim state'leri
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Menü state'leri
  const [categoryMenuAnchorEl, setCategoryMenuAnchorEl] = useState(null);
  const [courseMenuAnchorEl, setCourseMenuAnchorEl] = useState(null);
  const [contentMenuAnchorEl, setContentMenuAnchorEl] = useState(null);
  const [targetId, setTargetId] = useState(null);
  
  // Tab değişimi
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Arama terimi değişimi
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Kategori filtreleme değişimi
  const handleCategoryFilterChange = (event) => {
    setFilterCategory(event.target.value);
  };
  
  // Eğitim seviyesi filtreleme değişimi
  const handleEducationLevelFilterChange = (event) => {
    setFilterEducationLevel(event.target.value);
  };
  
  // Kategori sayfalaması
  const handleCategoryChangePage = (event, newPage) => {
    setCategoryPage(newPage);
  };
  
  const handleCategoryChangeRowsPerPage = (event) => {
    setCategoryRowsPerPage(parseInt(event.target.value, 10));
    setCategoryPage(0);
  };
  
  // Kurs sayfalaması
  const handleCourseChangePage = (event, newPage) => {
    setCoursePage(newPage);
  };
  
  const handleCourseChangeRowsPerPage = (event) => {
    setCourseRowsPerPage(parseInt(event.target.value, 10));
    setCoursePage(0);
  };
  
  // Kategori dialog yönetimi
  const handleOpenCategoryDialog = (category = null) => {
    setCategoryToEdit(category);
    setCategoryDialog(true);
  };
  
  const handleCloseCategoryDialog = () => {
    setCategoryToEdit(null);
    setCategoryDialog(false);
  };
  
  // Kurs dialog yönetimi
  const handleOpenCourseDialog = (course = null) => {
    setCourseToEdit(course);
    setCourseDialog(true);
  };
  
  const handleCloseCourseDialog = () => {
    setCourseToEdit(null);
    setCourseDialog(false);
  };
  
  // İçerik dialog yönetimi
  const handleOpenContentDialog = (courseId, content = null) => {
    setSelectedCourse(courseId);
    setContentToEdit(content);
    setContentDialog(true);
  };
  
  const handleCloseContentDialog = () => {
    setSelectedCourse(null);
    setContentToEdit(null);
    setContentDialog(false);
  };
  
  // Silme onay dialogu
  const handleOpenDeleteConfirm = (item, type) => {
    if (type === 'category') {
      setCategoryToDelete(item);
    } else if (type === 'course') {
      setCourseToDelete(item);
    } else if (type === 'content') {
      setContentToDelete(item);
    }
    setDeleteConfirmOpen(true);
  };
  
  const handleCloseDeleteConfirm = () => {
    setCategoryToDelete(null);
    setCourseToDelete(null);
    setContentToDelete(null);
    setDeleteConfirmOpen(false);
  };
  
  // Kategori menüsü yönetimi
  const handleCategoryMenuOpen = (event, id) => {
    setCategoryMenuAnchorEl(event.currentTarget);
    setTargetId(id);
  };
  
  const handleCategoryMenuClose = () => {
    setCategoryMenuAnchorEl(null);
    setTargetId(null);
  };
  
  // Kurs menüsü yönetimi
  const handleCourseMenuOpen = (event, id) => {
    setCourseMenuAnchorEl(event.currentTarget);
    setTargetId(id);
  };
  
  const handleCourseMenuClose = () => {
    setCourseMenuAnchorEl(null);
    setTargetId(null);
  };
  
  // İçerik menüsü yönetimi
  const handleContentMenuOpen = (event, id) => {
    setContentMenuAnchorEl(event.currentTarget);
    setTargetId(id);
  };
  
  const handleContentMenuClose = () => {
    setContentMenuAnchorEl(null);
    setTargetId(null);
  };
  
  // Bildirim yönetimi
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Kategori işlemleri
  const handleSaveCategory = (category) => {
    if (category.id) {
      // Güncelleme
      const updatedCategories = categories.map(c => 
        c.id === category.id ? category : c
      );
      setCategories(updatedCategories);
      showNotification('Kategori başarıyla güncellendi.');
    } else {
      // Yeni ekleme
      const newCategory = {
        ...category,
        id: categories.length + 1,
        courseCount: 0
      };
      setCategories([...categories, newCategory]);
      showNotification('Kategori başarıyla eklendi.');
    }
    handleCloseCategoryDialog();
  };
  
  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      const updatedCategories = categories.filter(c => c.id !== categoryToDelete.id);
      setCategories(updatedCategories);
      showNotification('Kategori başarıyla silindi.');
    }
    handleCloseDeleteConfirm();
  };
  
  // Kurs işlemleri
  const handleSaveCourse = (course) => {
    if (course.id) {
      // Güncelleme
      const updatedCourses = courses.map(c => 
        c.id === course.id ? course : c
      );
      setCourses(updatedCourses);
      showNotification('Kurs başarıyla güncellendi.');
    } else {
      // Yeni ekleme
      const newCourse = {
        ...course,
        id: courses.length + 1,
        createdAt: new Date().toISOString()
      };
      setCourses([...courses, newCourse]);
      showNotification('Kurs başarıyla eklendi.');
    }
    handleCloseCourseDialog();
  };
  
  const handleDeleteCourse = () => {
    if (courseToDelete) {
      const updatedCourses = courses.filter(c => c.id !== courseToDelete.id);
      setCourses(updatedCourses);
      showNotification('Kurs başarıyla silindi.');
    }
    handleCloseDeleteConfirm();
  };
  
  // İçerik işlemleri
  const handleSaveContent = (content) => {
    if (content.id) {
      // Güncelleme
      const updatedContents = contents.map(c => 
        c.id === content.id ? content : c
      );
      setContents(updatedContents);
      showNotification('İçerik başarıyla güncellendi.');
    } else {
      // Yeni ekleme
      const newContent = {
        ...content,
        id: contents.length + 1,
        courseId: selectedCourse
      };
      setContents([...contents, newContent]);
      showNotification('İçerik başarıyla eklendi.');
    }
    handleCloseContentDialog();
  };
  
  const handleDeleteContent = () => {
    if (contentToDelete) {
      const updatedContents = contents.filter(c => c.id !== contentToDelete.id);
      setContents(updatedContents);
      showNotification('İçerik başarıyla silindi.');
    }
    handleCloseDeleteConfirm();
  };
  
  // Filtreleme işlemleri
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? course.categoryId === parseInt(filterCategory) : true;
    const matchesEducationLevel = filterEducationLevel ? course.educationLevel === parseInt(filterEducationLevel) : true;
    
    return matchesSearch && matchesCategory && matchesEducationLevel;
  });
  
  const filteredContents = contents.filter(content => 
    (selectedCourse ? content.courseId === selectedCourse : true) && 
    content.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Kategoriye göre kurs sayısı
  const getCourseCountByCategory = (categoryId) => {
    return courses.filter(course => course.categoryId === categoryId).length;
  };
  
  // Kursa göre içerik sayısı
  const getContentCountByCourse = (courseId) => {
    return contents.filter(content => content.courseId === courseId).length;
  };
  
  // Kategori adını alma
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Bilinmeyen Kategori';
  };
  
  // Eğitim seviyesi adını alma
  const getEducationLevelName = (educationLevelId) => {
    const level = educationLevels.find(l => l.value === educationLevelId);
    return level ? level.label : 'Tüm Seviyeler';
  };
  
  // İçerik tipini alma
  const getContentTypeName = (contentType) => {
    const type = contentTypes.find(t => t.value === contentType);
    return type ? type.label : 'Bilinmeyen Tip';
  };
  
  // Ana component içeriği
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          İçerik Yönetimi
        </Typography>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="content management tabs"
            sx={{ px: 2 }}
          >
            <Tab 
              icon={<CategoryIcon />} 
              iconPosition="start" 
              label="Kategoriler" 
              id="content-tab-0" 
              aria-controls="content-tabpanel-0" 
            />
            <Tab 
              icon={<SchoolIcon />} 
              iconPosition="start" 
              label="Kurslar" 
              id="content-tab-1" 
              aria-controls="content-tabpanel-1" 
            />
            <Tab 
              icon={<VideoIcon />} 
              iconPosition="start" 
              label="Ders İçerikleri" 
              id="content-tab-2" 
              aria-controls="content-tabpanel-2" 
            />
          </Tabs>
        </Box>
        
        {/* Kategoriler Tabı */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <TextField
              label="Kategori Ara"
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
              sx={{ width: 300 }}
            />
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCategoryDialog()}
            >
              Yeni Kategori
            </Button>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="kategoriler tablosu">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Kategori Adı</TableCell>
                  <TableCell>Açıklama</TableCell>
                  <TableCell>Eğitim Seviyesi</TableCell>
                  <TableCell align="center">Kurs Sayısı</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories
                  .slice(categoryPage * categoryRowsPerPage, categoryPage * categoryRowsPerPage + categoryRowsPerPage)
                  .map((category) => (
                    <TableRow key={category.id}>
                      <TableCell component="th" scope="row">
                        {category.id}
                      </TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>
                        {category.educationLevel 
                          ? getEducationLevelName(category.educationLevel) 
                          : 'Tüm Seviyeler'}
                      </TableCell>
                      <TableCell align="center">{getCourseCountByCategory(category.id)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label="daha fazla"
                          size="small"
                          onClick={(e) => handleCategoryMenuOpen(e, category.id)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Kategori bulunamadı.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCategories.length}
            rowsPerPage={categoryRowsPerPage}
            page={categoryPage}
            onPageChange={handleCategoryChangePage}
            onRowsPerPageChange={handleCategoryChangeRowsPerPage}
            labelRowsPerPage="Sayfa başına kategori:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </TabPanel>
        
        {/* Kurslar Tabı */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Kurs Ara"
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
                sx={{ width: 250 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={filterCategory}
                  label="Kategori"
                  onChange={handleCategoryFilterChange}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Eğitim Seviyesi</InputLabel>
                <Select
                  value={filterEducationLevel}
                  label="Eğitim Seviyesi"
                  onChange={handleEducationLevelFilterChange}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {educationLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCourseDialog()}
            >
              Yeni Kurs
            </Button>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="kurslar tablosu">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Kurs Adı</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Eğitim Seviyesi</TableCell>
                  <TableCell>Zorluk</TableCell>
                  <TableCell align="center">Premium</TableCell>
                  <TableCell align="center">İçerik Sayısı</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCourses
                  .slice(coursePage * courseRowsPerPage, coursePage * courseRowsPerPage + courseRowsPerPage)
                  .map((course) => (
                    <TableRow key={course.id}>
                      <TableCell component="th" scope="row">
                        {course.id}
                      </TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{getCategoryName(course.categoryId)}</TableCell>
                      <TableCell>{getEducationLevelName(course.educationLevel)}</TableCell>
                      <TableCell>
                        {difficultyLevels.find(l => l.value === course.difficultyLevel)?.label || 'Bilinmeyen'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={course.isPremium ? 'Evet' : 'Hayır'} 
                          color={course.isPremium ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">{getContentCountByCourse(course.id)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label="daha fazla"
                          size="small"
                          onClick={(e) => handleCourseMenuOpen(e, course.id)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredCourses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Kurs bulunamadı.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredCourses.length}
            rowsPerPage={courseRowsPerPage}
            page={coursePage}
            onPageChange={handleCourseChangePage}
            onRowsPerPageChange={handleCourseChangeRowsPerPage}
            labelRowsPerPage="Sayfa başına kurs:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </TabPanel>
        
        {/* İçerikler Tabı */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="İçerik Ara"
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
                sx={{ width: 250 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel>Kurs</InputLabel>
                <Select
                  value={selectedCourse || ''}
                  label="Kurs"
                  onChange={(e) => setSelectedCourse(e.target.value || null)}
                >
                  <MenuItem value="">Tüm Kurslar</MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenContentDialog(selectedCourse)}
              disabled={!selectedCourse}
            >
              Yeni İçerik
            </Button>
          </Box>
          
          {!selectedCourse ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              İçerik eklemek veya düzenlemek için önce bir kurs seçiniz.
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="içerikler tablosu">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>İçerik Adı</TableCell>
                      <TableCell>Tip</TableCell>
                      <TableCell>Sıra</TableCell>
                      <TableCell align="center">Süre (dk)</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredContents.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell component="th" scope="row">
                          {content.id}
                        </TableCell>
                        <TableCell>{content.title}</TableCell>
                        <TableCell>{getContentTypeName(content.contentType)}</TableCell>
                        <TableCell>{content.sequence}</TableCell>
                        <TableCell align="center">{content.durationMinutes}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            aria-label="daha fazla"
                            size="small"
                            onClick={(e) => handleContentMenuOpen(e, content.id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredContents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Bu kurs için içerik bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </TabPanel>
      </Paper>
      
      {/* Kategori Dialogs */}
      <Dialog 
        open={categoryDialog} 
        onClose={handleCloseCategoryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {categoryToEdit ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Kategori Adı"
            fullWidth
            variant="outlined"
            defaultValue={categoryToEdit?.name || ''}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Açıklama"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            defaultValue={categoryToEdit?.description || ''}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Eğitim Seviyesi</InputLabel>
            <Select
              label="Eğitim Seviyesi"
              defaultValue={categoryToEdit?.educationLevel || ''}
            >
              <MenuItem value="">Tüm Seviyeler</MenuItem>
              {educationLevels.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="İkon URL"
            fullWidth
            variant="outlined"
            defaultValue={categoryToEdit?.iconUrl || ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={() => handleSaveCategory({
              id: categoryToEdit?.id,
              name: 'Yeni Kategori', // Bu normalde form değerlerinden alınır
              description: 'Açıklama',
              educationLevel: null,
              iconUrl: '/icons/default.png'
            })}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Kurs Dialogs */}
      <Dialog 
        open={courseDialog} 
        onClose={handleCloseCourseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {courseToEdit ? 'Kursu Düzenle' : 'Yeni Kurs Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Kurs Adı"
                fullWidth
                variant="outlined"
                defaultValue={courseToEdit?.title || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Açıklama"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                defaultValue={courseToEdit?.description || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  label="Kategori"
                  defaultValue={courseToEdit?.categoryId || ''}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Eğitim Seviyesi</InputLabel>
                <Select
                  label="Eğitim Seviyesi"
                  defaultValue={courseToEdit?.educationLevel || ''}
                >
                  {educationLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Zorluk Seviyesi</InputLabel>
                <Select
                  label="Zorluk Seviyesi"
                  defaultValue={courseToEdit?.difficultyLevel || ''}
                >
                  {difficultyLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Süre (dakika)"
                fullWidth
                type="number"
                variant="outlined"
                defaultValue={courseToEdit?.durationMinutes || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Puan Değeri"
                fullWidth
                type="number"
                variant="outlined"
                defaultValue={courseToEdit?.points || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fiyat"
                fullWidth
                type="number"
                variant="outlined"
                defaultValue={courseToEdit?.price || '0'}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Premium İçerik</InputLabel>
                <Select
                  label="Premium İçerik"
                  defaultValue={courseToEdit?.isPremium ? 'true' : 'false'}
                >
                  <MenuItem value="false">Hayır</MenuItem>
                  <MenuItem value="true">Evet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCourseDialog}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={() => handleSaveCourse({
              id: courseToEdit?.id,
              title: 'Yeni Kurs', // Bu normalde form değerlerinden alınır
              description: 'Açıklama',
              categoryId: 1,
              educationLevel: 3,
              difficultyLevel: 2,
              durationMinutes: 480,
              points: 100,
              price: 0,
              isPremium: false
            })}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* İçerik Dialogs */}
      <Dialog 
        open={contentDialog} 
        onClose={handleCloseContentDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {contentToEdit ? 'İçeriği Düzenle' : 'Yeni İçerik Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="İçerik Başlığı"
                fullWidth
                variant="outlined"
                defaultValue={contentToEdit?.title || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>İçerik Tipi</InputLabel>
                <Select
                  label="İçerik Tipi"
                  defaultValue={contentToEdit?.contentType || 'video'}
                >
                  {contentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Sıra Numarası"
                fullWidth
                type="number"
                variant="outlined"
                defaultValue={contentToEdit?.sequence || filteredContents.length + 1}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="İçerik URL (video, etkileşimli içerik için)"
                fullWidth
                variant="outlined"
                defaultValue={contentToEdit?.contentUrl || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Süre (dakika)"
                fullWidth
                type="number"
                variant="outlined"
                defaultValue={contentToEdit?.durationMinutes || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mt: 1 }}
              >
                Dosya Yükle
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContentDialog}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={() => handleSaveContent({
              id: contentToEdit?.id,
              title: 'Yeni İçerik', // Bu normalde form değerlerinden alınır
              contentType: 'video',
              contentUrl: 'https://example.com/videos/new.mp4',
              sequence: contentToEdit?.sequence || filteredContents.length + 1,
              durationMinutes: 30
            })}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Silme Onay Dialogu */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>Silme Onayı</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {categoryToDelete && `"${categoryToDelete.name}" kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
            {courseToDelete && `"${courseToDelete.title}" kursunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
            {contentToDelete && `"${contentToDelete.title}" içeriğini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>İptal</Button>
          <Button 
            onClick={() => {
              if (categoryToDelete) handleDeleteCategory();
              else if (courseToDelete) handleDeleteCourse();
              else if (contentToDelete) handleDeleteContent();
            }} 
            color="error"
            variant="contained"
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Kategori Menüsü */}
      <Menu
        anchorEl={categoryMenuAnchorEl}
        open={Boolean(categoryMenuAnchorEl)}
        onClose={handleCategoryMenuClose}
      >
        <MenuItem onClick={() => {
          const category = categories.find(c => c.id === targetId);
          handleOpenCategoryDialog(category);
          handleCategoryMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Düzenle</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const category = categories.find(c => c.id === targetId);
          handleOpenDeleteConfirm(category, 'category');
          handleCategoryMenuClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sil</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Kurs Menüsü */}
      <Menu
        anchorEl={courseMenuAnchorEl}
        open={Boolean(courseMenuAnchorEl)}
        onClose={handleCourseMenuClose}
      >
        <MenuItem onClick={() => {
          const course = courses.find(c => c.id === targetId);
          handleOpenCourseDialog(course);
          handleCourseMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Düzenle</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          setSelectedCourse(targetId);
          setTabValue(2); // İçerik tabına geç
          handleCourseMenuClose();
        }}>
          <ListItemIcon>
            <ArticleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>İçerikleri Yönet</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          // Kursu önizle
          handleCourseMenuClose();
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Önizle</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const course = courses.find(c => c.id === targetId);
          handleOpenDeleteConfirm(course, 'course');
          handleCourseMenuClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sil</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* İçerik Menüsü */}
      <Menu
        anchorEl={contentMenuAnchorEl}
        open={Boolean(contentMenuAnchorEl)}
        onClose={handleContentMenuClose}
      >
        <MenuItem onClick={() => {
          const content = contents.find(c => c.id === targetId);
          handleOpenContentDialog(content.courseId, content);
          handleContentMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Düzenle</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          // İçeriği önizle
          handleContentMenuClose();
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Önizle</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const content = contents.find(c => c.id === targetId);
          handleOpenDeleteConfirm(content, 'content');
          handleContentMenuClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sil</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Bildirim Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}