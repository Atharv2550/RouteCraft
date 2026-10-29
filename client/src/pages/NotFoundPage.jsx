import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import ExploreOffIcon from '@mui/icons-material/ExploreOff';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';

export default function NotFoundPage() {
  return (
    <AppShell showSidebar={false}>
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3
          }}
        >
          <ExploreOffIcon sx={{ fontSize: 44, color: 'text.secondary' }} />
        </Box>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Lost Off the Route? (404)
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page or trip you are searching for does not exist or has been relocated.
        </Typography>
        <Button component={Link} to="/" variant="contained" color="primary" size="large">
          Return to Home
        </Button>
      </Container>
    </AppShell>
  );
}

