"use client";

import { useState } from 'react';
import { 
  Button, Stack, Box, Typography, Container, Paper, Tabs, Tab, Divider,
  Card, CardContent, CardActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import QueueIcon from '@mui/icons-material/Queue';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Link from 'next/link';
import AIQuestQueue from '@/components/admin/AIQuestQueue';
import AIAutoQuestGenerator from '@/components/admin/AIAutoQuestGenerator';

export default function QuestsPage() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quest Management
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Create, manage and generate quests for your platform.
        </Typography>
        
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ mb: 4, mt: 3 }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            href="/admin/content/quests/create"
            sx={{ fontWeight: 'bold' }}
          >
            Create Quest Manually
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ListAltIcon />}
            component={Link}
            href="/admin/content/quests"
            sx={{ fontWeight: 'bold' }}
          >
            View All Quests
          </Button>
        </Stack>
      </Box>
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab 
          icon={<QueueIcon />} 
          label="Quest Generation Queue" 
          iconPosition="start" 
        />
        <Tab 
          icon={<AutoAwesomeIcon />} 
          label="Auto Generator" 
          iconPosition="start" 
        />
      </Tabs>
      
      {/* Tab content */}
      <div role="tabpanel" hidden={activeTab !== 0}>
        {activeTab === 0 && <AIQuestQueue />}
      </div>
      
      <div role="tabpanel" hidden={activeTab !== 1}>
        {activeTab === 1 && (
          <Box sx={{ mb: 4 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                AI Quest Auto-Generation
              </Typography>
              
              <Typography variant="body2" paragraph color="text.secondary">
                Let AI automatically generate complete quests based on your database content. 
                The AI will analyze courses, videos, and quizzes to create meaningful quests.
              </Typography>
              
              <AIAutoQuestGenerator />
            </Paper>
          </Box>
        )}
      </div>
    </Container>
  );
} 