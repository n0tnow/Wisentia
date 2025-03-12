'use client';
import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  BarChart as AnalyticsIcon,
  CloudUpload as CloudUploadIcon,
  Language as LanguageIcon,
  Money as MoneyIcon,
  ColorLens as ThemeIcon,
  Storage as StorageIcon,
  Engineering as MaintenanceIcon,
  CreditCard as PaymentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Key as KeyIcon,
  CloudCircle as ApiIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  BugReport as BugReportIcon,
  Backup as BackupIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  LocalActivity as NFTIcon
} from '@mui/icons-material';

// TabPanel component for settings tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'Wisentia Learning Platform',
    description: 'Empower your learning journey with Wisentia',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    primaryColor: '#1976d2',
    secondaryColor: '#f50057',
    defaultLanguage: 'en',
    timeZone: 'UTC',
    footerText: '© 2023 Wisentia Learning Platform. All rights reserved.',
    maintenanceMode: false
  });
  
  // User settings
  const [userSettings, setUserSettings] = useState({
    allowRegistration: true,
    requireEmailVerification: true,
    allowGuestAccess: false,
    defaultUserRole: 'student',
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 30
  });
  
  // Content settings
  const [contentSettings, setContentSettings] = useState({
    maxUploadSize: 100,
    allowedFileTypes: '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.ppt,.pptx,.mp4,.webm',
    enableContentModeration: true,
    defaultCourseVisibility: 'private',
    courseApprovalsRequired: true,
    enableComments: true,
    enableRatings: true,
    maxCourseDescriptionLength: 1000
  });
  
  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: 'notifications@wisentia.com',
    smtpPassword: '************',
    fromEmail: 'no-reply@wisentia.com',
    fromName: 'Wisentia Learning',
    enableSsl: true,
    emailTemplate: 'default',
    sendWelcomeEmail: true,
    sendCourseCompletionEmail: true
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    enablePushNotifications: true,
    enableEmailNotifications: true,
    enableInAppNotifications: true,
    courseEnrollmentNotification: true,
    courseCompletionNotification: true,
    questCompletionNotification: true,
    commentNotification: true,
    announcementNotification: true
  });
  
  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    currency: 'USD',
    enablePayments: true,
    paymentGateways: ['stripe', 'paypal'],
    stripeLiveKey: 'pk_live_...',
    stripeTestKey: 'pk_test_...',
    paypalClientId: 'client_id_...',
    testMode: true,
    minPurchaseAmount: 5,
    taxRate: 0,
    refundPolicy: 30
  });
  
  // Integration settings
  const [integrationSettings, setIntegrationSettings] = useState({
    googleAnalyticsId: 'UA-XXXXXXXXX-X',
    facebookPixelId: '123456789',
    recaptchaSiteKey: '6LdXXXXXXXXXXXX',
    enableSocialLogin: true,
    allowedSocialLogins: ['google', 'facebook', 'apple'],
    apiKey: 'api_key_xxxxxxxxxxxxx',
    webhookUrl: 'https://webhook.example.com/endpoint'
  });
  
  // Backup settings
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    backupRetentionDays: 30,
    backupStorage: 'cloud',
    cloudProvider: 'aws',
    s3BucketName: 'wisentia-backups',
    backupIncludeMedia: true,
    lastBackupDate: '2023-11-12 02:00:00',
    lastBackupStatus: 'successful'
  });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle input change for general settings
  const handleGeneralSettingsChange = (event) => {
    const { name, value, checked } = event.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: name === 'maintenanceMode' ? checked : value
    });
  };
  
  // Handle input change for user settings
  const handleUserSettingsChange = (event) => {
    const { name, value, checked, type } = event.target;
    setUserSettings({
      ...userSettings,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value) : value
    });
  };
  
  // Handle input change for content settings
  const handleContentSettingsChange = (event) => {
    const { name, value, checked, type } = event.target;
    setContentSettings({
      ...contentSettings,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value) : value
    });
  };
  
  // Handle input change for email settings
  const handleEmailSettingsChange = (event) => {
    const { name, value, checked, type } = event.target;
    setEmailSettings({
      ...emailSettings,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value) : value
    });
  };
  
  // Handle input change for notification settings
  const handleNotificationSettingsChange = (event) => {
    const { name, checked } = event.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };
  
  // Handle input change for payment settings
  const handlePaymentSettingsChange = (event) => {
    const { name, value, checked, type } = event.target;
    setPaymentSettings({
      ...paymentSettings,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) : value
    });
  };
  
  // Handle input change for integration settings
  const handleIntegrationSettingsChange = (event) => {
    const { name, value, checked, type } = event.target;
    setIntegrationSettings({
      ...integrationSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle input change for backup settings
  const handleBackupSettingsChange = (event) => {
    const { name, value, checked, type } = event.target;
    setBackupSettings({
      ...backupSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Save settings
  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
    }, 1000);
  };
  
  // Run backup
  const handleRunBackup = () => {
    setConfirmDialogAction('backup');
    setConfirmDialogOpen(true);
  };
  
  // Reset settings
  const handleResetSettings = () => {
    setConfirmDialogAction('reset');
    setConfirmDialogOpen(true);
  };
  
  // Perform confirmed action
  const handleConfirmedAction = () => {
    setConfirmDialogOpen(false);
    
    if (confirmDialogAction === 'backup') {
      setLoading(true);
      // Simulate backup API call
      setTimeout(() => {
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Backup started successfully',
          severity: 'success'
        });
      }, 1500);
    } else if (confirmDialogAction === 'reset') {
      setLoading(true);
      // Simulate reset API call
      setTimeout(() => {
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Settings reset to default values',
          severity: 'info'
        });
      }, 1000);
    }
  };
  
  // Close confirmation dialog
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Test email
  const handleTestEmail = () => {
    setLoading(true);
    // Simulate email API call
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Test email sent successfully',
        severity: 'success'
      });
    }, 1000);
  };
  
  // Generate new API key
  const handleGenerateApiKey = () => {
    setConfirmDialogAction('apiKey');
    setConfirmDialogOpen(true);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Settings
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleResetSettings}
          >
            Reset to Default
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            disabled={loading}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
      
      {/* Settings tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            aria-label="settings tabs"
          >
            <Tab 
              icon={<SettingsIcon />} 
              iconPosition="start" 
              label="General" 
              id="settings-tab-0" 
              aria-controls="settings-tabpanel-0" 
            />
            <Tab 
              icon={<PersonIcon />} 
              iconPosition="start" 
              label="Users" 
              id="settings-tab-1" 
              aria-controls="settings-tabpanel-1" 
            />
            <Tab 
              icon={<SchoolIcon />} 
              iconPosition="start" 
              label="Content" 
              id="settings-tab-2" 
              aria-controls="settings-tabpanel-2" 
            />
            <Tab 
              icon={<EmailIcon />} 
              iconPosition="start" 
              label="Email" 
              id="settings-tab-3" 
              aria-controls="settings-tabpanel-3" 
            />
            <Tab 
              icon={<NotificationsIcon />} 
              iconPosition="start" 
              label="Notifications" 
              id="settings-tab-4" 
              aria-controls="settings-tabpanel-4" 
            />
            <Tab 
              icon={<PaymentIcon />} 
              iconPosition="start" 
              label="Payments" 
              id="settings-tab-5" 
              aria-controls="settings-tabpanel-5" 
            />
            <Tab 
              icon={<ApiIcon />} 
              iconPosition="start" 
              label="Integrations" 
              id="settings-tab-6" 
              aria-controls="settings-tabpanel-6" 
            />
            <Tab 
              icon={<BackupIcon />} 
              iconPosition="start" 
              label="Backup" 
              id="settings-tab-7" 
              aria-controls="settings-tabpanel-7" 
            />
          </Tabs>
        </Box>
        
        {/* General Settings */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Platform Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Platform Name"
                name="platformName"
                value={generalSettings.platformName}
                onChange={handleGeneralSettingsChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Platform Description"
                name="description"
                value={generalSettings.description}
                onChange={handleGeneralSettingsChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Logo URL"
                name="logoUrl"
                value={generalSettings.logoUrl}
                onChange={handleGeneralSettingsChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <CloudUploadIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Favicon URL"
                name="faviconUrl"
                value={generalSettings.faviconUrl}
                onChange={handleGeneralSettingsChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <CloudUploadIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Primary Color"
                name="primaryColor"
                value={generalSettings.primaryColor}
                onChange={handleGeneralSettingsChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          backgroundColor: generalSettings.primaryColor,
                          border: '1px solid #ccc'
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Secondary Color"
                name="secondaryColor"
                value={generalSettings.secondaryColor}
                onChange={handleGeneralSettingsChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          backgroundColor: generalSettings.secondaryColor,
                          border: '1px solid #ccc'
                        }} 
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Localization
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Default Language</InputLabel>
                <Select
                  name="defaultLanguage"
                  value={generalSettings.defaultLanguage}
                  label="Default Language"
                  onChange={handleGeneralSettingsChange}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="tr">Turkish</MenuItem>
                  <MenuItem value="ar">Arabic</MenuItem>
                  <MenuItem value="zh">Chinese</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Time Zone</InputLabel>
                <Select
                  name="timeZone"
                  value={generalSettings.timeZone}
                  label="Time Zone"
                  onChange={handleGeneralSettingsChange}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                  <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                  <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                  <MenuItem value="Europe/London">Greenwich Mean Time (GMT)</MenuItem>
                  <MenuItem value="Europe/Paris">Central European Time (CET)</MenuItem>
                  <MenuItem value="Asia/Istanbul">Turkey Time (TRT)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Footer Text"
                name="footerText"
                value={generalSettings.footerText}
                onChange={handleGeneralSettingsChange}
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            System
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onChange={handleGeneralSettingsChange}
                    name="maintenanceMode"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography>Maintenance Mode</Typography>
                    <Typography variant="caption" color="text.secondary">
                      When enabled, the site will be inaccessible to regular users.
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          </Grid>
          
          {generalSettings.maintenanceMode && (
            <Alert 
              severity="warning" 
              sx={{ mt: 2 }}
              action={
                <Button color="inherit" size="small">
                  Preview
                </Button>
              }
            >
              Maintenance mode is active. Only administrators can access the site.
            </Alert>
          )}
        </TabPanel>
        
        {/* User Settings */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Registration & Access
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.allowRegistration}
                      onChange={handleUserSettingsChange}
                      name="allowRegistration"
                    />
                  }
                  label="Allow New Registrations"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.requireEmailVerification}
                      onChange={handleUserSettingsChange}
                      name="requireEmailVerification"
                    />
                  }
                  label="Require Email Verification"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.allowGuestAccess}
                      onChange={handleUserSettingsChange}
                      name="allowGuestAccess"
                    />
                  }
                  label="Allow Guest Access"
                />
              </FormGroup>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Default User Role</InputLabel>
                <Select
                  name="defaultUserRole"
                  value={userSettings.defaultUserRole}
                  label="Default User Role"
                  onChange={handleUserSettingsChange}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="instructor">Instructor</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Password Security
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Password Length"
                name="passwordMinLength"
                type="number"
                value={userSettings.passwordMinLength}
                onChange={handleUserSettingsChange}
                InputProps={{ inputProps: { min: 6, max: 32 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.passwordRequireUppercase}
                      onChange={handleUserSettingsChange}
                      name="passwordRequireUppercase"
                    />
                  }
                  label="Require Uppercase Letters"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.passwordRequireNumbers}
                      onChange={handleUserSettingsChange}
                      name="passwordRequireNumbers"
                    />
                  }
                  label="Require Numbers"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.passwordRequireSpecialChars}
                      onChange={handleUserSettingsChange}
                      name="passwordRequireSpecialChars"
                    />
                  }
                  label="Require Special Characters"
                />
              </FormGroup>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Session & Security
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                name="sessionTimeout"
                type="number"
                value={userSettings.sessionTimeout}
                onChange={handleUserSettingsChange}
                InputProps={{ inputProps: { min: 5, max: 1440 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Login Attempts"
                name="maxLoginAttempts"
                type="number"
                value={userSettings.maxLoginAttempts}
                onChange={handleUserSettingsChange}
                InputProps={{ inputProps: { min: 3, max: 10 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Lockout Duration (minutes)"
                name="lockoutDuration"
                type="number"
                value={userSettings.lockoutDuration}
                onChange={handleUserSettingsChange}
                InputProps={{ inputProps: { min: 5, max: 1440 } }}
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Content Settings */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Content & Uploads
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Upload Size (MB)"
                name="maxUploadSize"
                type="number"
                value={contentSettings.maxUploadSize}
                onChange={handleContentSettingsChange}
                InputProps={{ inputProps: { min: 1, max: 1000 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Allowed File Types"
                name="allowedFileTypes"
                value={contentSettings.allowedFileTypes}
                onChange={handleContentSettingsChange}
                helperText="Comma-separated list of file extensions"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Default Course Visibility</InputLabel>
                <Select
                  name="defaultCourseVisibility"
                  value={contentSettings.defaultCourseVisibility}
                  label="Default Course Visibility"
                  onChange={handleContentSettingsChange}
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                  <MenuItem value="restricted">Restricted</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Course Description Length"
                name="maxCourseDescriptionLength"
                type="number"
                value={contentSettings.maxCourseDescriptionLength}
                onChange={handleContentSettingsChange}
                InputProps={{ inputProps: { min: 100, max: 5000 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={contentSettings.enableContentModeration}
                      onChange={handleContentSettingsChange}
                      name="enableContentModeration"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography>Content Moderation</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Automatically scan uploaded content for inappropriate material
                      </Typography>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={contentSettings.courseApprovalsRequired}
                      onChange={handleContentSettingsChange}
                      name="courseApprovalsRequired"
                    />
                  }
                  label="Course Approvals Required"
                />
              </FormGroup>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={contentSettings.enableComments}
                      onChange={handleContentSettingsChange}
                      name="enableComments"
                    />
                  }
                  label="Enable Comments"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={contentSettings.enableRatings}
                      onChange={handleContentSettingsChange}
                      name="enableRatings"
                    />
                  }
                  label="Enable Ratings"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Email Settings */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            SMTP Configuration
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Server"
                name="smtpServer"
                value={emailSettings.smtpServer}
                onChange={handleEmailSettingsChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Port"
                name="smtpPort"
                type="number"
                value={emailSettings.smtpPort}
                onChange={handleEmailSettingsChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Username"
                name="smtpUsername"
                value={emailSettings.smtpUsername}
                onChange={handleEmailSettingsChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Password"
                name="smtpPassword"
                type="password"
                value={emailSettings.smtpPassword}
                onChange={handleEmailSettingsChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailSettings.enableSsl}
                    onChange={handleEmailSettingsChange}
                    name="enableSsl"
                  />
                }
                label="Enable SSL/TLS"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                onClick={handleTestEmail}
                startIcon={<EmailIcon />}
              >
                Send Test Email
              </Button>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Email Templates
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Email"
                name="fromEmail"
                value={emailSettings.fromEmail}
                onChange={handleEmailSettingsChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Name"
                name="fromName"
                value={emailSettings.fromName}
                onChange={handleEmailSettingsChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Email Template</InputLabel>
                <Select
                  name="emailTemplate"
                  value={emailSettings.emailTemplate}
                  label="Email Template"
                  onChange={handleEmailSettingsChange}
                >
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="minimal">Minimal</MenuItem>
                  <MenuItem value="modern">Modern</MenuItem>
                  <MenuItem value="corporate">Corporate</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Notification Emails
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailSettings.sendWelcomeEmail}
                      onChange={handleEmailSettingsChange}
                      name="sendWelcomeEmail"
                    />
                  }
                  label="Send Welcome Email"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailSettings.sendCourseCompletionEmail}
                      onChange={handleEmailSettingsChange}
                      name="sendCourseCompletionEmail"
                    />
                  }
                  label="Send Course Completion Email"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Notification Settings */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Notification Channels
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.enableEmailNotifications}
                      onChange={handleNotificationSettingsChange}
                      name="enableEmailNotifications"
                    />
                  }
                  label="Email Notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.enablePushNotifications}
                      onChange={handleNotificationSettingsChange}
                      name="enablePushNotifications"
                    />
                  }
                  label="Push Notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.enableInAppNotifications}
                      onChange={handleNotificationSettingsChange}
                      name="enableInAppNotifications"
                    />
                  }
                  label="In-App Notifications"
                />
              </FormGroup>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Notification Events
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.courseEnrollmentNotification}
                      onChange={handleNotificationSettingsChange}
                      name="courseEnrollmentNotification"
                    />
                  }
                  label="Course Enrollment"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.courseCompletionNotification}
                      onChange={handleNotificationSettingsChange}
                      name="courseCompletionNotification"
                    />
                  }
                  label="Course Completion"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.questCompletionNotification}
                      onChange={handleNotificationSettingsChange}
                      name="questCompletionNotification"
                    />
                  }
                  label="Quest Completion"
                />
              </FormGroup>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.commentNotification}
                      onChange={handleNotificationSettingsChange}
                      name="commentNotification"
                    />
                  }
                  label="Comments"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.announcementNotification}
                      onChange={handleNotificationSettingsChange}
                      name="announcementNotification"
                    />
                  }
                  label="Announcements"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Payment Settings */}
        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>
            Payment Configuration
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={paymentSettings.enablePayments}
                      onChange={handlePaymentSettingsChange}
                      name="enablePayments"
                    />
                  }
                  label="Enable Payments"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={paymentSettings.testMode}
                      onChange={handlePaymentSettingsChange}
                      name="testMode"
                    />
                  }
                  label="Test Mode"
                />
              </FormGroup>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  name="currency"
                  value={paymentSettings.currency}
                  label="Currency"
                  onChange={handlePaymentSettingsChange}
                >
                  <MenuItem value="USD">US Dollar (USD)</MenuItem>
                  <MenuItem value="EUR">Euro (EUR)</MenuItem>
                  <MenuItem value="GBP">British Pound (GBP)</MenuItem>
                  <MenuItem value="JPY">Japanese Yen (JPY)</MenuItem>
                  <MenuItem value="TRY">Turkish Lira (TRY)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Purchase Amount"
                name="minPurchaseAmount"
                type="number"
                value={paymentSettings.minPurchaseAmount}
                onChange={handlePaymentSettingsChange}
                InputProps={{ 
                  inputProps: { min: 0, step: 0.01 },
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax Rate (%)"
                name="taxRate"
                type="number"
                value={paymentSettings.taxRate}
                onChange={handlePaymentSettingsChange}
                InputProps={{ 
                  inputProps: { min: 0, max: 100, step: 0.01 },
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Refund Policy (days)"
                name="refundPolicy"
                type="number"
                value={paymentSettings.refundPolicy}
                onChange={handlePaymentSettingsChange}
                InputProps={{ inputProps: { min: 0, max: 180 } }}
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Payment Gateways
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardHeader 
                  title="Stripe" 
                  action={
                    <Switch
                      checked={paymentSettings.paymentGateways.includes('stripe')}
                      onChange={(e) => {
                        const gateways = e.target.checked 
                          ? [...paymentSettings.paymentGateways, 'stripe'] 
                          : paymentSettings.paymentGateways.filter(g => g !== 'stripe');
                        setPaymentSettings({...paymentSettings, paymentGateways: gateways});
                      }}
                    />
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Live API Key"
                        name="stripeLiveKey"
                        value={paymentSettings.stripeLiveKey}
                        onChange={handlePaymentSettingsChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Test API Key"
                        name="stripeTestKey"
                        value={paymentSettings.stripeTestKey}
                        onChange={handlePaymentSettingsChange}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardHeader 
                  title="PayPal" 
                  action={
                    <Switch
                      checked={paymentSettings.paymentGateways.includes('paypal')}
                      onChange={(e) => {
                        const gateways = e.target.checked 
                          ? [...paymentSettings.paymentGateways, 'paypal'] 
                          : paymentSettings.paymentGateways.filter(g => g !== 'paypal');
                        setPaymentSettings({...paymentSettings, paymentGateways: gateways});
                      }}
                    />
                  }
                />
                <Divider />
                <CardContent>
                  <TextField
                    fullWidth
                    label="Client ID"
                    name="paypalClientId"
                    value={paymentSettings.paypalClientId}
                    onChange={handlePaymentSettingsChange}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Integration Settings */}
        <TabPanel value={tabValue} index={6}>
          <Typography variant="h6" gutterBottom>
            Analytics Integrations
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Google Analytics Tracking ID"
                name="googleAnalyticsId"
                value={integrationSettings.googleAnalyticsId}
                onChange={handleIntegrationSettingsChange}
                placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Facebook Pixel ID"
                name="facebookPixelId"
                value={integrationSettings.facebookPixelId}
                onChange={handleIntegrationSettingsChange}
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Social Login
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={integrationSettings.enableSocialLogin}
                    onChange={handleIntegrationSettingsChange}
                    name="enableSocialLogin"
                  />
                }
                label="Enable Social Login"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label="Google" 
                  color={integrationSettings.allowedSocialLogins.includes('google') ? 'primary' : 'default'}
                  onClick={() => {
                    const updatedLogins = integrationSettings.allowedSocialLogins.includes('google')
                      ? integrationSettings.allowedSocialLogins.filter(login => login !== 'google')
                      : [...integrationSettings.allowedSocialLogins, 'google'];
                    setIntegrationSettings({...integrationSettings, allowedSocialLogins: updatedLogins});
                  }}
                />
                <Chip 
                  label="Facebook" 
                  color={integrationSettings.allowedSocialLogins.includes('facebook') ? 'primary' : 'default'}
                  onClick={() => {
                    const updatedLogins = integrationSettings.allowedSocialLogins.includes('facebook')
                      ? integrationSettings.allowedSocialLogins.filter(login => login !== 'facebook')
                      : [...integrationSettings.allowedSocialLogins, 'facebook'];
                    setIntegrationSettings({...integrationSettings, allowedSocialLogins: updatedLogins});
                  }}
                />
                <Chip 
                  label="Apple" 
                  color={integrationSettings.allowedSocialLogins.includes('apple') ? 'primary' : 'default'}
                  onClick={() => {
                    const updatedLogins = integrationSettings.allowedSocialLogins.includes('apple')
                      ? integrationSettings.allowedSocialLogins.filter(login => login !== 'apple')
                      : [...integrationSettings.allowedSocialLogins, 'apple'];
                    setIntegrationSettings({...integrationSettings, allowedSocialLogins: updatedLogins});
                  }}
                />
                <Chip 
                  label="Twitter" 
                  color={integrationSettings.allowedSocialLogins.includes('twitter') ? 'primary' : 'default'}
                  onClick={() => {
                    const updatedLogins = integrationSettings.allowedSocialLogins.includes('twitter')
                      ? integrationSettings.allowedSocialLogins.filter(login => login !== 'twitter')
                      : [...integrationSettings.allowedSocialLogins, 'twitter'];
                    setIntegrationSettings({...integrationSettings, allowedSocialLogins: updatedLogins});
                  }}
                />
                <Chip 
                  label="LinkedIn" 
                  color={integrationSettings.allowedSocialLogins.includes('linkedin') ? 'primary' : 'default'}
                  onClick={() => {
                    const updatedLogins = integrationSettings.allowedSocialLogins.includes('linkedin')
                      ? integrationSettings.allowedSocialLogins.filter(login => login !== 'linkedin')
                      : [...integrationSettings.allowedSocialLogins, 'linkedin'];
                    setIntegrationSettings({...integrationSettings, allowedSocialLogins: updatedLogins});
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Security & API
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="reCAPTCHA Site Key"
                name="recaptchaSiteKey"
                value={integrationSettings.recaptchaSiteKey}
                onChange={handleIntegrationSettingsChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="API Key"
                name="apiKey"
                value={integrationSettings.apiKey}
                onChange={handleIntegrationSettingsChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button 
                        variant="text" 
                        size="small"
                        onClick={handleGenerateApiKey}
                      >
                        Regenerate
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Webhook URL"
                name="webhookUrl"
                value={integrationSettings.webhookUrl}
                onChange={handleIntegrationSettingsChange}
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Backup Settings */}
        <TabPanel value={tabValue} index={7}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Backup Configuration
            </Typography>
            <Button
              variant="contained"
              startIcon={<BackupIcon />}
              onClick={handleRunBackup}
            >
              Run Backup Now
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={backupSettings.autoBackup}
                    onChange={handleBackupSettingsChange}
                    name="autoBackup"
                  />
                }
                label="Automatic Backups"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Backup Frequency</InputLabel>
                <Select
                  name="backupFrequency"
                  value={backupSettings.backupFrequency}
                  label="Backup Frequency"
                  onChange={handleBackupSettingsChange}
                  disabled={!backupSettings.autoBackup}
                >
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Backup Time"
                name="backupTime"
                type="time"
                value={backupSettings.backupTime}
                onChange={handleBackupSettingsChange}
                disabled={!backupSettings.autoBackup || backupSettings.backupFrequency === 'hourly'}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Backup Retention (days)"
                name="backupRetentionDays"
                type="number"
                value={backupSettings.backupRetentionDays}
                onChange={handleBackupSettingsChange}
                InputProps={{ inputProps: { min: 1, max: 365 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Backup Storage</InputLabel>
                <Select
                  name="backupStorage"
                  value={backupSettings.backupStorage}
                  label="Backup Storage"
                  onChange={handleBackupSettingsChange}
                >
                  <MenuItem value="local">Local Storage</MenuItem>
                  <MenuItem value="cloud">Cloud Storage</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cloud Provider</InputLabel>
                <Select
                  name="cloudProvider"
                  value={backupSettings.cloudProvider}
                  label="Cloud Provider"
                  onChange={handleBackupSettingsChange}
                  disabled={backupSettings.backupStorage !== 'cloud'}
                >
                  <MenuItem value="aws">Amazon S3</MenuItem>
                  <MenuItem value="gcp">Google Cloud Storage</MenuItem>
                  <MenuItem value="azure">Microsoft Azure Blob</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="S3 Bucket Name"
                name="s3BucketName"
                value={backupSettings.s3BucketName}
                onChange={handleBackupSettingsChange}
                disabled={backupSettings.backupStorage !== 'cloud' || backupSettings.cloudProvider !== 'aws'}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={backupSettings.backupIncludeMedia}
                    onChange={handleBackupSettingsChange}
                    name="backupIncludeMedia"
                  />
                }
                label="Include Media Files"
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Backup History
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Backup
                    </Typography>
                    <Typography variant="body1">
                      {backupSettings.lastBackupDate}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={backupSettings.lastBackupStatus} 
                      color={backupSettings.lastBackupStatus === 'successful' ? 'success' : 'error'} 
                      size="small" 
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>2023-11-12 02:00:00</TableCell>
                  <TableCell>Automatic</TableCell>
                  <TableCell>256 MB</TableCell>
                  <TableCell>
                    <Chip label="Successful" color="success" size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Download">
                      <IconButton size="small">
                        <CloudUploadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Restore">
                      <IconButton size="small">
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2023-11-11 02:00:00</TableCell>
                  <TableCell>Automatic</TableCell>
                  <TableCell>248 MB</TableCell>
                  <TableCell>
                    <Chip label="Successful" color="success" size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Download">
                      <IconButton size="small">
                        <CloudUploadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Restore">
                      <IconButton size="small">
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2023-11-10 15:30:45</TableCell>
                  <TableCell>Manual</TableCell>
                  <TableCell>252 MB</TableCell>
                  <TableCell>
                    <Chip label="Successful" color="success" size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Download">
                      <IconButton size="small">
                        <CloudUploadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Restore">
                      <IconButton size="small">
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2023-11-10 02:00:00</TableCell>
                  <TableCell>Automatic</TableCell>
                  <TableCell>245 MB</TableCell>
                  <TableCell>
                    <Chip label="Failed" color="error" size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Logs">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {confirmDialogAction === 'backup' && "Run Backup"}
          {confirmDialogAction === 'reset' && "Reset Settings"}
          {confirmDialogAction === 'apiKey' && "Generate New API Key"}
        </DialogTitle>
        <DialogContent>
          {confirmDialogAction === 'backup' && (
            <Typography>
              Are you sure you want to run a backup now? This process may take several minutes.
            </Typography>
          )}
          {confirmDialogAction === 'reset' && (
            <Typography>
              Are you sure you want to reset all settings to their default values? This action cannot be undone.
            </Typography>
          )}
          {confirmDialogAction === 'apiKey' && (
            <Typography>
              Are you sure you want to generate a new API key? This will invalidate the current key and any applications using it will need to be updated.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button onClick={handleConfirmedAction} autoFocus color="primary" variant="contained">
            {confirmDialogAction === 'backup' && "Run Backup"}
            {confirmDialogAction === 'reset' && "Reset"}
            {confirmDialogAction === 'apiKey' && "Generate"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}