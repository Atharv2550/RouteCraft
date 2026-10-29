import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress
} from '@mui/material';

const CATEGORIES = [
  { value: 'sightseeing', label: 'Sightseeing & Attractions' },
  { value: 'culture', label: 'Culture & History' },
  { value: 'nature', label: 'Nature & Parks' },
  { value: 'food', label: 'Dining & Food' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'transport', label: 'Transportation' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other Activity' }
];

export default function ActivityDialog({
  open,
  onClose,
  onSubmit,
  dayId,
  initialData = null,
  currency = 'USD'
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [category, setCategory] = useState('sightseeing');
  const [status, setStatus] = useState('PLANNED');
  const [isFixedTime, setIsFixedTime] = useState(false);
  const [notes, setNotes] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setLocationName(initialData.locationName || '');
      setLatitude(initialData.latitude != null ? initialData.latitude.toString() : '');
      setLongitude(initialData.longitude != null ? initialData.longitude.toString() : '');
      setStartTime(initialData.startTime || '');
      setEndTime(initialData.endTime || '');
      setDurationMinutes(initialData.durationMinutes || 60);
      setEstimatedCost(initialData.estimatedCostMinor ? initialData.estimatedCostMinor / 100 : 0);
      setCategory(initialData.category || 'sightseeing');
      setStatus(initialData.status || 'PLANNED');
      setIsFixedTime(!!initialData.isFixedTime);
      setNotes(initialData.notes || '');
      setExternalUrl(initialData.externalUrl || '');
    } else {
      setTitle('');
      setDescription('');
      setLocationName('');
      setLatitude('');
      setLongitude('');
      setStartTime('10:00');
      setEndTime('11:30');
      setDurationMinutes(90);
      setEstimatedCost(0);
      setCategory('sightseeing');
      setStatus('PLANNED');
      setIsFixedTime(false);
      setNotes('');
      setExternalUrl('');
    }
    setError('');
  }, [initialData, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (startTime && endTime && endTime <= startTime) {
      setError('End time must follow start time');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        dayId,
        title,
        description,
        locationName,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        startTime: startTime || null,
        endTime: endTime || null,
        durationMinutes: parseInt(durationMinutes, 10) || 60,
        estimatedCost: parseFloat(estimatedCost) || 0,
        currency,
        category,
        status,
        isFixedTime,
        notes,
        externalUrl
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save activity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle fontWeight={800}>
          {initialData ? 'Edit Activity' : 'Add Activity to Itinerary'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <TextField
            fullWidth
            label="Activity Title"
            placeholder="e.g. Shibuya Crossing or Louvre Museum"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={`Estimated Cost (${currency})`}
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 'any' } }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Location Name / Address"
            placeholder="e.g. 1-1 Chiyoda, Chiyoda City, Tokyo"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Latitude (e.g. 35.6762)"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="35.6762"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Longitude (e.g. 139.6503)"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="139.6503"
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Website or Navigation Link"
            placeholder="https://..."
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Notes & Tips"
            placeholder="e.g. Buy tickets in advance, dress code required"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isFixedTime}
                onChange={(e) => setIsFixedTime(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Lock / Fixed Time Slot
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Prevents route optimization from reordering this activity (e.g. booked flights, shows, tours).
                </Typography>
              </Box>
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Save Activity'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

