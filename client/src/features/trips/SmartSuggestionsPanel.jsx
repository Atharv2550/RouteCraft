import React from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Chip,
  Stack,
  Button
} from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function SmartSuggestionsPanel({ suggestions = [] }) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <Box sx={{ p: 2.5, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LightbulbOutlinedIcon color="secondary" />
          <Typography variant="subtitle2" fontWeight={700} color="secondary.main">
            Smart Pacing & Schedule Insights
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Your itinerary currently has balanced daily pacing with no detected scheduling overlaps or budget overruns.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <LightbulbOutlinedIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={700}>
          Smart Planning Suggestions ({suggestions.length})
        </Typography>
        <Chip label="Rule-Based (No AI)" size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
      </Box>

      <Stack spacing={1.5}>
        {suggestions.map((sug) => {
          const severity = sug.type === 'warning' ? 'warning' : sug.type === 'budget' ? 'error' : 'info';

          return (
            <Alert
              key={sug.id}
              severity={severity}
              sx={{
                borderRadius: 2.5,
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              <AlertTitle sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {sug.title}
              </AlertTitle>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {sug.message}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                <strong>Why this is suggested:</strong> {sug.explanation}
              </Typography>
            </Alert>
          );
        })}
      </Stack>
    </Box>
  );
}

