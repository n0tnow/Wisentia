'use client';

import {
  Avatar,
  Box,
  Chip,
  Typography,
} from '@mui/material';

import {
  DateRange as DateRangeIcon,
  School as SchoolIcon,
  VideoLibrary as VideoIcon,
  Token as TokenIcon,
  EmojiEvents as QuestIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

// Format date for display
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Format time elapsed
const getTimeElapsed = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays} days ago`;
  if (diffHours > 0) return `${diffHours} hours ago`;
  if (diffMins > 0) return `${diffMins} minutes ago`;
  return 'Just now';
};

// Activity colors based on type
const ACTIVITY_COLORS = {
  course_completion: '#4caf50',
  course_start: '#2196f3',
  nft_earned: '#9c27b0',
  quest_completion: '#ff9800',
  subscription: '#3f51b5'
};

// This custom component replaces the ListItem with ListItemText to avoid hydration errors
export default function ActivityCard({ activity }) {
  return (
    <Box
      sx={{
        display: 'flex',
        py: 1.5,
        px: 3,
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        borderLeft: '4px solid',
        borderLeftColor: ACTIVITY_COLORS[activity.ActivityType] || 'grey.300',
      }}
    >
      {/* Activity Icon */}
      <Box sx={{ mr: 2 }}>
        <Avatar sx={{ 
          bgcolor: `${ACTIVITY_COLORS[activity.ActivityType]}20`,
          color: ACTIVITY_COLORS[activity.ActivityType] || 'grey.600',
          width: 36,
          height: 36
        }}>
          {activity.ActivityType === 'course_completion' && <SchoolIcon fontSize="small" />}
          {activity.ActivityType === 'course_start' && <VideoIcon fontSize="small" />}
          {activity.ActivityType === 'nft_earned' && <TokenIcon fontSize="small" />}
          {activity.ActivityType === 'quest_completion' && <QuestIcon fontSize="small" />}
          {activity.ActivityType === 'subscription' && <AssignmentIcon fontSize="small" />}
        </Avatar>
      </Box>
      
      {/* Activity Content */}
      <Box sx={{ width: '100%' }}>
        {/* Username */}
        <Typography variant="body2" fontWeight="medium">
          {activity.Username}
        </Typography>
        
        {/* Description */}
        <Typography variant="body2" color="textPrimary">
          {activity.Description}
        </Typography>
        
        {/* Time Info */}
        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Formatted Date */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DateRangeIcon sx={{ fontSize: 14, mr: 0.5 }} />
            <Typography variant="caption" color="textSecondary">
              {formatDate(activity.Timestamp)}
            </Typography>
          </Box>
          
          {/* Time Elapsed */}
          <Chip
            label={getTimeElapsed(activity.Timestamp)}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: 'rgba(0,0,0,0.05)',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}