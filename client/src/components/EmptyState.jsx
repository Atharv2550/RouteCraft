import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function EmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 4,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        maxWidth: 500,
        mx: 'auto',
        my: 4
      }}
    >
      {Icon && (
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'primary.light',
            color: 'primary.dark',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            opacity: 0.9
          }}
        >
          <Icon sx={{ fontSize: 32 }} />
        </Box>
      )}
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mb: actionText ? 3 : 0 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="contained" color="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
}

