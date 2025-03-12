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
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardActions,
  Menu,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  alpha,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Avatar,
  Badge,
  Switch,
  FormControlLabel,
  Drawer,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  LocalActivity as NFTIcon,
  Category as CategoryIcon,
  School as SchoolIcon,
  EmojiEvents as QuestIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
  Stars as StarsIcon,
  AttachMoney as MoneyIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Mock NFT categories
const nftCategories = [
  { value: 1, label: 'Achievement' },
  { value: 2, label: 'Course' },
  { value: 3, label: 'Quest' },
  { value: 4, label: 'Premium' }
];

// Mock NFT rarities
const nftRarities = [
  { value: 1, label: 'Common', color: '#7E7E7E' },
  { value: 2, label: 'Rare', color: '#0088FE' },
  { value: 3, label: 'Epic', color: '#9C27B0' },
  { value: 4, label: 'Legendary', color: '#FFD700' }
];

// Mock unlock condition types
const unlockConditionTypes = [
  { value: 1, label: 'Course Completion', icon: <SchoolIcon /> },
  { value: 2, label: 'Quest Completion', icon: <QuestIcon /> },
  { value: 3, label: 'Achievement', icon: <StarsIcon /> }
];

// Mock NFTs
const mockNFTs = [
  {
    id: 1,
    name: 'Python Master',
    description: 'Awarded to users who complete all Python courses',
    imageUrl: '/nfts/python-master.png',
    category: 1, // Achievement
    rarity: 3, // Epic
    tokenValue: 500,
    unlockConditionType: 1, // Course
    unlockConditionId: 2, // Python Advanced course ID
    unlockLevel: 0,
    minimumPoints: 1000,
    buyable: false,
    createdAt: '2023-03-15T10:30:00Z',
    totalIssued: 124,
    totalAvailable: 0, // Unlimited for achievement NFTs
    lastIssuedAt: '2023-11-01T15:45:00Z'
  },
  {
    id: 2,
    name: 'Math Wizard',
    description: 'For students excelling in mathematics',
    imageUrl: '/nfts/math-wizard.png',
    category: 1, // Achievement
    rarity: 2, // Rare
    tokenValue: 300,
    unlockConditionType: 2, // Quest
    unlockConditionId: 5, // Advanced Math Quest ID
    unlockLevel: 0,
    minimumPoints: 800,
    buyable: false,
    createdAt: '2023-04-10T14:20:00Z',
    totalIssued: 89,
    totalAvailable: 0,
    lastIssuedAt: '2023-10-28T09:15:00Z'
  },
  {
    id: 3,
    name: 'Web Developer',
    description: 'Complete all web development courses',
    imageUrl: '/nfts/web-developer.png',
    category: 2, // Course
    rarity: 3, // Epic
    tokenValue: 450,
    unlockConditionType: 1, // Course
    unlockConditionId: 5, // Web Development course ID
    unlockLevel: 0,
    minimumPoints: 1200,
    buyable: false,
    createdAt: '2023-05-20T09:45:00Z',
    totalIssued: 76,
    totalAvailable: 0,
    lastIssuedAt: '2023-11-05T16:30:00Z'
  },
  {
    id: 4,
    name: 'Early Adopter',
    description: 'For our first 100 users',
    imageUrl: '/nfts/early-adopter.png',
    category: 4, // Premium
    rarity: 4, // Legendary
    tokenValue: 1000,
    unlockConditionType: 3, // Achievement
    unlockConditionId: 0,
    unlockLevel: 0,
    minimumPoints: 0,
    buyable: false,
    createdAt: '2023-01-05T08:00:00Z',
    totalIssued: 100,
    totalAvailable: 100,
    lastIssuedAt: '2023-02-15T12:20:00Z'
  },
  {
    id: 5,
    name: 'Premium Member',
    description: 'Exclusive NFT for premium members',
    imageUrl: '/nfts/premium.png',
    category: 4, // Premium
    rarity: 2, // Rare
    tokenValue: 200,
    unlockConditionType: null,
    unlockConditionId: null,
    unlockLevel: 0,
    minimumPoints: 0,
    buyable: true,
    price: 50,
    createdAt: '2023-06-15T11:30:00Z',
    totalIssued: 210,
    totalAvailable: 1000,
    lastIssuedAt: '2023-11-10T14:10:00Z'
  },
  {
    id: 6,
    name: 'Quest Champion',
    description: 'Complete 20 quests successfully',
    imageUrl: '/nfts/quest-champion.png',
    category: 3, // Quest
    rarity: 3, // Epic
    tokenValue: 400,
    unlockConditionType: 3, // Achievement
    unlockConditionId: 0,
    unlockLevel: 0,
    minimumPoints: 2000,
    buyable: false,
    createdAt: '2023-07-05T13:45:00Z',
    totalIssued: 58,
    totalAvailable: 0,
    lastIssuedAt: '2023-11-08T10:25:00Z'
  },
  {
    id: 7,
    name: 'Coding Beginner',
    description: 'Complete your first programming course',
    imageUrl: '/nfts/coding-beginner.png',
    category: 2, // Course
    rarity: 1, // Common
    tokenValue: 100,
    unlockConditionType: 1, // Course
    unlockConditionId: 1, // Python Basics course ID
    unlockLevel: 0,
    minimumPoints: 0,
    buyable: false,
    createdAt: '2023-02-10T16:20:00Z',
    totalIssued: 875,
    totalAvailable: 0,
    lastIssuedAt: '2023-11-12T09:05:00Z'
  },
  {
    id: 8,
    name: 'Exam Crusher',
    description: 'Score over 90% on 5 different quests',
    imageUrl: '/nfts/exam-crusher.png',
    category: 3, // Quest
    rarity: 2, // Rare
    tokenValue: 250,
    unlockConditionType: 3, // Achievement
    unlockConditionId: 0,
    unlockLevel: 0,
    minimumPoints: 500,
    buyable: false,
    createdAt: '2023-08-18T10:15:00Z',
    totalIssued: 142,
    totalAvailable: 0,
    lastIssuedAt: '2023-11-11T15:55:00Z'
  },
  {
    id: 9,
    name: 'Special Edition',
    description: 'Limited edition NFT for special events',
    imageUrl: '/nfts/special-edition.png',
    category: 4, // Premium
    rarity: 4, // Legendary
    tokenValue: 800,
    unlockConditionType: null,
    unlockConditionId: null,
    unlockLevel: 0,
    minimumPoints: 0,
    buyable: true,
    price: 100,
    createdAt: '2023-09-25T14:00:00Z',
    totalIssued: 25,
    totalAvailable: 50,
    lastIssuedAt: '2023-11-07T11:40:00Z'
  },
  {
    id: 10,
    name: 'Science Explorer',
    description: 'Complete all science courses',
    imageUrl: '/nfts/science-explorer.png',
    category: 2, // Course
    rarity: 2, // Rare
    tokenValue: 350,
    unlockConditionType: 1, // Course
    unlockConditionId: 7, // General Physics course ID
    unlockLevel: 0,
    minimumPoints: 1500,
    buyable: false,
    createdAt: '2023-06-30T09:10:00Z',
    totalIssued: 62,
    totalAvailable: 0,
    lastIssuedAt: '2023-11-09T16:35:00Z'
  }
];

// Mock users who own NFTs
const mockUserNFTs = [
  { id: 1, userId: 1, nftId: 1, tokenId: 'token123', acquiredAt: '2023-05-15T10:30:00Z', transactionHash: '0x123...' },
  { id: 2, userId: 2, nftId: 3, tokenId: 'token456', acquiredAt: '2023-06-20T14:15:00Z', transactionHash: '0x456...' },
  { id: 3, userId: 3, nftId: 5, tokenId: 'token789', acquiredAt: '2023-07-25T16:45:00Z', transactionHash: '0x789...' },
  { id: 4, userId: 4, nftId: 7, tokenId: 'token012', acquiredAt: '2023-08-10T11:20:00Z', transactionHash: '0x012...' },
  { id: 5, userId: 5, nftId: 2, tokenId: 'token345', acquiredAt: '2023-09-05T15:10:00Z', transactionHash: '0x345...' },
  { id: 6, userId: 1, nftId: 6, tokenId: 'token678', acquiredAt: '2023-10-15T09:30:00Z', transactionHash: '0x678...' },
  { id: 7, userId: 2, nftId: 8, tokenId: 'token901', acquiredAt: '2023-11-01T13:45:00Z', transactionHash: '0x901...' }
];

// Mock users
const mockUsers = [
  { id: 1, username: 'johndoe', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
  { id: 2, username: 'janesmith', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' },
  { id: 3, username: 'mikebrown', firstName: 'Mike', lastName: 'Brown', email: 'mike.brown@example.com' },
  { id: 4, username: 'sarahjohnson', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@example.com' },
  { id: 5, username: 'davidwilson', firstName: 'David', lastName: 'Wilson', email: 'david.wilson@example.com' }
];

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nft-tabpanel-${index}`}
      aria-labelledby={`nft-tab-${index}`}
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

// NFT Detail Drawer
const NFTDetailDrawer = ({ open, nft, onClose, onEdit, onDelete }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  if (!nft) return null;
  
  // Get users who own this NFT
  const nftOwners = mockUserNFTs
    .filter(userNft => userNft.nftId === nft.id)
    .map(userNft => {
      const user = mockUsers.find(u => u.id === userNft.userId);
      return {
        ...userNft,
        user
      };
    });
  
  // NFT distribution data for pie chart
  const distributionData = [
    { name: 'Issued', value: nft.totalIssued },
    { name: 'Remaining', value: nft.totalAvailable > 0 ? (nft.totalAvailable - nft.totalIssued) : 0 }
  ];
  
  // Colors for pie chart
  const COLORS = [theme.palette.primary.main, theme.palette.grey[300]];
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Get category name
  const getCategoryName = (category) => {
    const cat = nftCategories.find(c => c.value === category);
    return cat ? cat.label : 'Unknown';
  };
  
  // Get rarity name and color
  const getRarityInfo = (rarity) => {
    const rarityInfo = nftRarities.find(r => r.value === rarity);
    return rarityInfo || { label: 'Unknown', color: '#000' };
  };
  
  // Get unlock condition name
  const getUnlockConditionName = (type, id) => {
    if (!type) return 'None';
    
    const condition = unlockConditionTypes.find(c => c.value === type);
    return condition ? `${condition.label} (ID: ${id})` : 'Unknown';
  };
  
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600, md: 800 }, p: 0 }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" component="div">
          NFT Details
        </Typography>
        <Box>
          <IconButton 
            color="primary" 
            onClick={() => onEdit(nft)}
            sx={{ mr: 1 }}
          >
            <EditIcon />
          </IconButton>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* NFT header */}
      <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar
                src={nft.imageUrl}
                alt={nft.name}
                variant="rounded"
                sx={{ 
                  width: 160, 
                  height: 160,
                  boxShadow: 3,
                  border: `2px solid ${getRarityInfo(nft.rarity).color}`
                }}
              >
                <NFTIcon sx={{ fontSize: 80 }} />
              </Avatar>
            </Box>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={getCategoryName(nft.category)}
                color="primary"
                size="small"
              />
              <Chip
                label={getRarityInfo(nft.rarity).label}
                size="small"
                sx={{ 
                  bgcolor: alpha(getRarityInfo(nft.rarity).color, 0.2),
                  color: getRarityInfo(nft.rarity).color,
                  fontWeight: 'bold'
                }}
              />
              {nft.buyable && (
                <Chip
                  label="Buyable"
                  color="secondary"
                  size="small"
                  icon={<ShoppingCartIcon />}
                />
              )}
            </Box>
            <Typography variant="h5" component="h2" fontWeight="bold">
              {nft.name}
            </Typography>
            <Typography variant="body1" sx={{ my: 1 }}>
              {nft.description}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StarsIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {nft.tokenValue} token value
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {nft.totalIssued} issued
                </Typography>
              </Box>
              {nft.minimumPoints > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AssignmentIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Min. {nft.minimumPoints} points
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="nft tabs">
          <Tab label="Overview" id="nft-tab-0" aria-controls="nft-tabpanel-0" />
          <Tab label="Owners" id="nft-tab-1" aria-controls="nft-tabpanel-1" />
          <Tab label="Statistics" id="nft-tab-2" aria-controls="nft-tabpanel-2" />
        </Tabs>
      </Box>
      
      <Box sx={{ p: 3 }}>
        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    NFT Details
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1">
                          {getCategoryName(nft.category)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Rarity
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ color: getRarityInfo(nft.rarity).color, fontWeight: 'bold' }}
                        >
                          {getRarityInfo(nft.rarity).label}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Token Value
                        </Typography>
                        <Typography variant="body1">
                          {nft.tokenValue}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Minimum Points
                        </Typography>
                        <Typography variant="body1">
                          {nft.minimumPoints}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Unlock Condition
                        </Typography>
                        <Typography variant="body1">
                          {getUnlockConditionName(nft.unlockConditionType, nft.unlockConditionId)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Buyable
                        </Typography>
                        <Typography variant="body1">
                          {nft.buyable ? 'Yes' : 'No'}
                        </Typography>
                      </Grid>
                      {nft.buyable && nft.price && (
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Price
                          </Typography>
                          <Typography variant="body1">
                            ${nft.price}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Availability
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Created At
                        </Typography>
                        <Typography variant="body1">
                          {new Date(nft.createdAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Last Issued
                        </Typography>
                        <Typography variant="body1">
                          {new Date(nft.lastIssuedAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Issued
                        </Typography>
                        <Typography variant="body1">
                          {nft.totalIssued}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Available
                        </Typography>
                        <Typography variant="body1">
                          {nft.totalAvailable > 0 
                            ? `${nft.totalAvailable - nft.totalIssued} / ${nft.totalAvailable}`
                            : 'Unlimited'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Owners Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            NFT Owners
          </Typography>
          {nftOwners.length > 0 ? (
            <List>
              {nftOwners.map((owner) => (
                <ListItem key={owner.id} divider>
                  <ListItemAvatar>
                    <Avatar>
                      {owner.user.firstName.charAt(0)}{owner.user.lastName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={`${owner.user.firstName} ${owner.user.lastName}`}
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          @{owner.user.username}
                        </Typography>
                        <br />
                        <Typography variant="body2" color="text.secondary" component="span">
                          Acquired: {new Date(owner.acquiredAt).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                  <Typography variant="body2" color="text.secondary">
                    Token ID: {owner.tokenId}
                  </Typography>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No one has acquired this NFT yet.
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        {/* Statistics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    {nft.totalAvailable > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography variant="body1" color="text.secondary">
                          This NFT has unlimited availability
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Acquisition Rate
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      Detailed acquisition metrics will be available soon
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Drawer>
  );
};

export default function NFTsManagement() {
  const theme = useTheme();
  const [nfts, setNFTs] = useState(mockNFTs);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const [buyableFilter, setBuyableFilter] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [nftToEdit, setNftToEdit] = useState(null);
  const [nftToDelete, setNftToDelete] = useState(null);
  
  // Menu states
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [targetNftId, setTargetNftId] = useState(null);
  
  // Detail drawer
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    category: '',
    rarity: '',
    tokenValue: '',
    unlockConditionType: '',
    unlockConditionId: '',
    minimumPoints: '',
    buyable: false,
    price: '',
    totalAvailable: ''
  });
  
  // View states - list or grid view
  const [viewMode, setViewMode] = useState('grid');
  
  // Handlers for page and rows per page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Search handler
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  // Filter handlers
  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };
  
  const handleRarityFilterChange = (event) => {
    setRarityFilter(event.target.value);
    setPage(0);
  };
  
  const handleBuyableFilterChange = (event) => {
    setBuyableFilter(event.target.value);
    setPage(0);
  };
  
  // Refresh NFTs
  const handleRefreshNFTs = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  // Detail drawer handlers
  const handleOpenDetailDrawer = (nft) => {
    setSelectedNft(nft);
    setDetailDrawerOpen(true);
  };
  
  const handleCloseDetailDrawer = () => {
    setDetailDrawerOpen(false);
    setSelectedNft(null);
  };
  
  // Dialog handlers
  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      category: '',
      rarity: '',
      tokenValue: '',
      unlockConditionType: '',
      unlockConditionId: '',
      minimumPoints: '0',
      buyable: false,
      price: '',
      totalAvailable: '0'
    });
    setAddDialogOpen(true);
  };
  
  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
  };
  
  const handleOpenEditDialog = (nft) => {
    setNftToEdit(nft);
    setFormData({
      name: nft.name,
      description: nft.description,
      imageUrl: nft.imageUrl,
      category: nft.category.toString(),
      rarity: nft.rarity.toString(),
      tokenValue: nft.tokenValue.toString(),
      unlockConditionType: nft.unlockConditionType ? nft.unlockConditionType.toString() : '',
      unlockConditionId: nft.unlockConditionId ? nft.unlockConditionId.toString() : '',
      minimumPoints: nft.minimumPoints.toString(),
      buyable: nft.buyable,
      price: nft.price ? nft.price.toString() : '',
      totalAvailable: nft.totalAvailable.toString()
    });
    setEditDialogOpen(true);
    
    // If opened from detail drawer, close it
    if (detailDrawerOpen) {
      setDetailDrawerOpen(false);
    }
  };
  
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setNftToEdit(null);
  };
  
  const handleOpenDeleteDialog = (nft) => {
    setNftToDelete(nft);
    setDeleteDialogOpen(true);
    
    // If opened from detail drawer, close it
    if (detailDrawerOpen) {
      setDetailDrawerOpen(false);
    }
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setNftToDelete(null);
  };
  
  // Menu handlers
  const handleOpenMenu = (event, nftId) => {
    setMenuAnchorEl(event.currentTarget);
    setTargetNftId(nftId);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setTargetNftId(null);
  };
  
  // Form change handler
  const handleFormChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'buyable' ? checked : value
    }));
  };
  
  // Save NFT
  const handleSaveNFT = () => {
    const newNFT = {
      name: formData.name,
      description: formData.description,
      imageUrl: formData.imageUrl,
      category: parseInt(formData.category),
      rarity: parseInt(formData.rarity),
      tokenValue: parseInt(formData.tokenValue),
      unlockConditionType: formData.unlockConditionType ? parseInt(formData.unlockConditionType) : null,
      unlockConditionId: formData.unlockConditionId ? parseInt(formData.unlockConditionId) : null,
      minimumPoints: parseInt(formData.minimumPoints),
      buyable: formData.buyable,
      price: formData.buyable && formData.price ? parseInt(formData.price) : null,
      totalAvailable: parseInt(formData.totalAvailable),
      totalIssued: 0,
      createdAt: new Date().toISOString(),
      lastIssuedAt: null
    };
    
    if (editDialogOpen && nftToEdit) {
      // Update NFT
      const updatedNFTs = nfts.map(nft => 
        nft.id === nftToEdit.id ? { ...nft, ...newNFT } : nft
      );
      setNFTs(updatedNFTs);
      handleCloseEditDialog();
    } else {
      // Add new NFT
      setNFTs([...nfts, {
        id: Math.max(...nfts.map(nft => nft.id)) + 1,
        ...newNFT
      }]);
      handleCloseAddDialog();
    }
  };
  
  // Delete NFT
  const handleDeleteNFT = () => {
    if (nftToDelete) {
      const updatedNFTs = nfts.filter(nft => nft.id !== nftToDelete.id);
      setNFTs(updatedNFTs);
      handleCloseDeleteDialog();
    }
  };
  
  // Toggle NFT buyable status
  const handleToggleBuyable = (nftId) => {
    const updatedNFTs = nfts.map(nft => 
      nft.id === nftId ? { ...nft, buyable: !nft.buyable } : nft
    );
    setNFTs(updatedNFTs);
    handleCloseMenu();
  };
  
  // View mode toggle
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  // Filter and sort NFTs
  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          nft.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || nft.category === parseInt(categoryFilter);
    const matchesRarity = rarityFilter === '' || nft.rarity === parseInt(rarityFilter);
    const matchesBuyable = buyableFilter === '' || 
                          (buyableFilter === 'true' && nft.buyable) || 
                          (buyableFilter === 'false' && !nft.buyable);
    
    return matchesSearch && matchesCategory && matchesRarity && matchesBuyable;
  });
  
  // Paginated NFTs
  const paginatedNFTs = filteredNFTs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Get category name
  const getCategoryName = (category) => {
    const cat = nftCategories.find(c => c.value === category);
    return cat ? cat.label : 'Unknown';
  };
  
  // Get rarity info (name and color)
  const getRarityInfo = (rarity) => {
    const rarityInfo = nftRarities.find(r => r.value === rarity);
    return rarityInfo || { label: 'Unknown', color: '#000' };
  };
  
  // Get unlock condition name
  const getUnlockConditionName = (type, id) => {
    if (!type) return 'None';
    
    const condition = unlockConditionTypes.find(c => c.value === type);
    return condition ? `${condition.label} (ID: ${id})` : 'Unknown';
  };

  return (
    <Box>
      {/* Page title and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          NFT Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Create NFT
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshNFTs}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Filters and Search */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search NFTs"
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
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={handleCategoryFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              {nftCategories.map((category) => (
                <MenuItem key={category.value} value={category.value.toString()}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Rarity</InputLabel>
            <Select
              value={rarityFilter}
              label="Rarity"
              onChange={handleRarityFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              {nftRarities.map((rarity) => (
                <MenuItem key={rarity.value} value={rarity.value.toString()}>
                  {rarity.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Buyable</InputLabel>
            <Select
              value={buyableFilter}
              label="Buyable"
              onChange={handleBuyableFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Buyable</MenuItem>
              <MenuItem value="false">Not Buyable</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box>
            <Tooltip title="List View">
              <IconButton 
                color={viewMode === 'list' ? 'primary' : 'default'} 
                onClick={() => handleViewModeChange('list')}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Grid View">
              <IconButton 
                color={viewMode === 'grid' ? 'primary' : 'default'} 
                onClick={() => handleViewModeChange('grid')}
              >
                <NFTIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Total: {filteredNFTs.length} NFTs
          </Typography>
        </Box>
      </Paper>
      
      {/* NFTs List View */}
      {viewMode === 'list' && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="nfts table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Rarity</TableCell>
                  <TableCell align="center">Token Value</TableCell>
                  <TableCell align="center">Unlock Condition</TableCell>
                  <TableCell align="center">Issued / Available</TableCell>
                  <TableCell align="center">Buyable</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : paginatedNFTs.length > 0 ? (
                  paginatedNFTs.map((nft) => (
                    <TableRow 
                      key={nft.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={nft.imageUrl}
                            alt={nft.name}
                            variant="rounded"
                            sx={{ 
                              width: 40, 
                              height: 40,
                              border: `2px solid ${getRarityInfo(nft.rarity).color}`
                            }}
                          >
                            <NFTIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {nft.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {nft.description.length > 40 
                                ? `${nft.description.substring(0, 40)}...` 
                                : nft.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{getCategoryName(nft.category)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getRarityInfo(nft.rarity).label} 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(getRarityInfo(nft.rarity).color, 0.2),
                            color: getRarityInfo(nft.rarity).color,
                            fontWeight: 'bold'
                          }} 
                        />
                      </TableCell>
                      <TableCell align="center">{nft.tokenValue}</TableCell>
                      <TableCell align="center">
                        {nft.unlockConditionType ? (
                          <Tooltip title={getUnlockConditionName(nft.unlockConditionType, nft.unlockConditionId)}>
                            <Chip 
                              icon={unlockConditionTypes.find(t => t.value === nft.unlockConditionType)?.icon} 
                              label={unlockConditionTypes.find(t => t.value === nft.unlockConditionType)?.label} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                          </Tooltip>
                        ) : (
                          <Chip label="None" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {nft.totalAvailable > 0 
                          ? `${nft.totalIssued} / ${nft.totalAvailable}`
                          : `${nft.totalIssued} / ∞`}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={nft.buyable ? 'Yes' : 'No'} 
                          color={nft.buyable ? 'secondary' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDetailDrawer(nft)}
                          sx={{ mr: 0.5 }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, nft.id)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1">
                        No NFTs found.
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
            count={filteredNFTs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows per page:"
          />
        </Paper>
      )}
      
      {/* NFTs Grid View */}
      {viewMode === 'grid' && (
        <Box>
          <Grid container spacing={3}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : paginatedNFTs.length > 0 ? (
              paginatedNFTs.map((nft) => (
                <Grid item key={nft.id} xs={12} sm={6} md={4} lg={3}>
                  <Card 
                    elevation={1}
                    sx={{ 
                      height: '100%',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        height: 4, 
                        bgcolor: getRarityInfo(nft.rarity).color 
                      }} 
                    />
                    <CardActionArea 
                      sx={{ flexGrow: 1 }}
                      onClick={() => handleOpenDetailDrawer(nft)}
                    >
                      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          src={nft.imageUrl}
                          alt={nft.name}
                          variant="rounded"
                          sx={{ 
                            width: 140, 
                            height: 140,
                            boxShadow: 2,
                            border: `2px solid ${getRarityInfo(nft.rarity).color}`
                          }}
                        >
                          <NFTIcon sx={{ fontSize: 60 }} />
                        </Avatar>
                      </Box>
                      <CardContent sx={{ pt: 1 }}>
                        <Typography variant="h6" component="div" align="center" gutterBottom>
                          {nft.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                          {nft.description.length > 60 
                            ? `${nft.description.substring(0, 60)}...` 
                            : nft.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Chip 
                            label={getCategoryName(nft.category)} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={getRarityInfo(nft.rarity).label} 
                            size="small" 
                            sx={{ 
                              bgcolor: alpha(getRarityInfo(nft.rarity).color, 0.2),
                              color: getRarityInfo(nft.rarity).color,
                              fontWeight: 'bold'
                            }} 
                          />
                          {nft.buyable && (
                            <Chip 
                              label="Buyable" 
                              size="small" 
                              color="secondary" 
                              icon={<ShoppingCartIcon />}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </CardActionArea>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {nft.tokenValue} token value
                      </Typography>
                      <Box>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditDialog(nft);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          color={nft.buyable ? 'default' : 'secondary'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBuyable(nft.id);
                          }}
                        >
                          {nft.buyable ? (
                            <LockIcon fontSize="small" />
                          ) : (
                            <ShoppingCartIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 4 }}>
                <Typography variant="body1">
                  No NFTs found.
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination
              rowsPerPageOptions={[8, 16, 32]}
              component="div"
              count={filteredNFTs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Items per page:"
            />
          </Box>
        </Box>
      )}
      
      {/* Add/Edit NFT Dialog */}
      <Dialog 
        open={addDialogOpen || editDialogOpen} 
        onClose={addDialogOpen ? handleCloseAddDialog : handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{addDialogOpen ? 'Create New NFT' : 'Edit NFT'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                label="NFT Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleFormChange}
                >
                  {nftCategories.map((category) => (
                    <MenuItem key={category.value} value={category.value.toString()}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Rarity</InputLabel>
                <Select
                  name="rarity"
                  value={formData.rarity}
                  label="Rarity"
                  onChange={handleFormChange}
                >
                  {nftRarities.map((rarity) => (
                    <MenuItem key={rarity.value} value={rarity.value.toString()}>
                      {rarity.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                id="tokenValue"
                label="Token Value"
                name="tokenValue"
                value={formData.tokenValue}
                onChange={handleFormChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                id="minimumPoints"
                label="Minimum Points Required"
                name="minimumPoints"
                value={formData.minimumPoints}
                onChange={handleFormChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Unlock Condition Type</InputLabel>
                <Select
                  name="unlockConditionType"
                  value={formData.unlockConditionType}
                  label="Unlock Condition Type"
                  onChange={handleFormChange}
                >
                  <MenuItem value="">None</MenuItem>
                  {unlockConditionTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value.toString()}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {type.icon}
                        <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                id="unlockConditionId"
                label="Condition ID (Course/Quest ID)"
                name="unlockConditionId"
                value={formData.unlockConditionId}
                onChange={handleFormChange}
                disabled={!formData.unlockConditionType}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="imageUrl"
                label="Image URL"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleFormChange}
                placeholder="/nfts/my-nft.png"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                >
                  Upload Image
                </Button>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.buyable}
                      onChange={handleFormChange}
                      name="buyable"
                      color="secondary"
                    />
                  }
                  label="Buyable"
                />
              </Box>
            </Grid>
            {formData.buyable && (
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  id="price"
                  label="Price"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  InputProps={{
                    inputProps: { min: 0 },
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={formData.buyable ? 6 : 12}>
              <TextField
                fullWidth
                type="number"
                id="totalAvailable"
                label="Total Available (0 for unlimited)"
                name="totalAvailable"
                value={formData.totalAvailable}
                onChange={handleFormChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={addDialogOpen ? handleCloseAddDialog : handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveNFT} 
            variant="contained" 
            disabled={!formData.name || !formData.category || !formData.rarity || !formData.tokenValue}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete NFT Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete NFT</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {nftToDelete && (
              <>
                Are you sure you want to delete the NFT <strong>{nftToDelete.name}</strong>?
                {nftToDelete.totalIssued > 0 && (
                  <Box component="div" sx={{ mt: 2, color: theme.palette.error.main }}>
                    Warning: This NFT has been issued to {nftToDelete.totalIssued} users. Deleting it may affect these users.
                  </Box>
                )}
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteNFT} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* NFT Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          const nft = nfts.find(n => n.id === targetNftId);
          handleOpenDetailDrawer(nft);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const nft = nfts.find(n => n.id === targetNftId);
          handleOpenEditDialog(nft);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleToggleBuyable(targetNftId)}>
          <ListItemIcon>
            {nfts.find(n => n.id === targetNftId)?.buyable ? (
              <LockIcon fontSize="small" />
            ) : (
              <ShoppingCartIcon fontSize="small" color="secondary" />
            )}
          </ListItemIcon>
          <ListItemText>
            {nfts.find(n => n.id === targetNftId)?.buyable ? 'Make Not Buyable' : 'Make Buyable'}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          const nft = nfts.find(n => n.id === targetNftId);
          handleOpenDeleteDialog(nft);
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: theme.palette.error.main }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* NFT Detail Drawer */}
      <NFTDetailDrawer
        open={detailDrawerOpen}
        nft={selectedNft}
        onClose={handleCloseDetailDrawer}
        onEdit={handleOpenEditDialog}
        onDelete={handleOpenDeleteDialog}
      />
    </Box>
  );
}

// This is causing errors in some environments, so replacing with standard component
const MenuIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
};

// This is causing errors in some environments, so replacing with standard component
const CheckCircleIcon = ({ fontSize, color }) => {
  const style = { fontSize: fontSize === 'small' ? 20 : 24, color };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
};