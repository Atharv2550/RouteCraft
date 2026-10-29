import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import RouteIcon from '@mui/icons-material/Route';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TimerIcon from '@mui/icons-material/Timer';

export default function OptimizeRouteDialog({
  open,
  onClose,
  proposal,
  dayNumber,
  onApply,
  applying
}) {
  if (!proposal) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RouteIcon color="primary" />
          <Typography variant="h6" fontWeight={800}>
            Route Optimization Proposal for Day {dayNumber}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Rule-based 2-Opt and Nearest Neighbor heuristic minimizing total travel distance
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {proposal.warnings?.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {proposal.warnings.map((w, idx) => (
              <Alert severity="warning" key={idx} sx={{ mb: 1, borderRadius: 2 }}>
                {w}
              </Alert>
            ))}
          </Box>
        )}

        {/* Distance & Time Comparison Summary */}
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Original Route</Typography>
              <Typography variant="h5" fontWeight={700}>
                {proposal.originalTotalDistanceKm} km
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="secondary.main" fontWeight={700}>Proposed Sequence</Typography>
              <Typography variant="h5" fontWeight={800} color="secondary.main">
                {proposal.proposedTotalDistanceKm} km
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Chip
                icon={<CheckCircleIcon />}
                label={`Saves ~${proposal.savedDistanceKm} km (${proposal.savedTimeMinutes} min)`}
                color="secondary"
                sx={{ fontWeight: 700 }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Order Comparison */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
              Current Sequence:
            </Typography>
            <List dense sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              {proposal.originalOrder.map((it, idx) => (
                <ListItem key={it._id || idx} divider={idx < proposal.originalOrder.length - 1}>
                  <ListItemText
                    primary={`${idx + 1}. ${it.title}`}
                    secondary={it.startTime ? `Time: ${it.startTime}` : 'Flexible timing'}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight={700} color="primary" gutterBottom>
              Proposed Optimal Sequence:
            </Typography>
            <List dense sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
              {proposal.proposedOrder.map((it, idx) => (
                <ListItem key={it._id || idx} divider={idx < proposal.proposedOrder.length - 1}>
                  <ListItemText
                    primary={<Typography variant="body2" fontWeight={600} color="primary.dark">{`${idx + 1}. ${it.title}`}</Typography>}
                    secondary={it.startTime ? `Time: ${it.startTime}` : 'Optimized proximity'}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={applying}>
          Reject Proposal
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onApply}
          disabled={applying || !proposal.canOptimize}
        >
          {applying ? <CircularProgress size={24} color="inherit" /> : 'Apply Proposed Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

