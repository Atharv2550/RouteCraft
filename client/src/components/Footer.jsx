import React from 'react';
import { Box, Container, Typography, Link as MuiLink, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="space-between" alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" fontWeight={800} color="primary.main">
              RouteCraft
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Craft your perfect itinerary. Smart planning & collaboration platform.
            </Typography>
            <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
              © {new Date().getFullYear()} RouteCraft. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', gap: 3, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <MuiLink component={Link} to="/features" color="text.secondary" underline="hover" variant="body2">
              Features
            </MuiLink>
            <MuiLink component={Link} to="/destinations" color="text.secondary" underline="hover" variant="body2">
              Destinations
            </MuiLink>
            <MuiLink component={Link} to="/privacy" color="text.secondary" underline="hover" variant="body2">
              Privacy Policy
            </MuiLink>
            <MuiLink component={Link} to="/terms" color="text.secondary" underline="hover" variant="body2">
              Terms of Service
            </MuiLink>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

