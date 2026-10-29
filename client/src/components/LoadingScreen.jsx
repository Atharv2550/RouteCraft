import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingScreen({ message = 'Loading RouteCraft...' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2
      }}
    >
      <CircularProgress size={44} thickness={4} color="primary" />
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
    </Box>
  );
}

