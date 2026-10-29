import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

const RESERVATION_TYPES = [
  { value: 'HOTEL', label: 'Hotel & Lodging' },
  { value: 'FLIGHT', label: 'Flight' },
  { value: 'TRAIN', label: 'Train & Rail' },
  { value: 'BUS', label: 'Bus / Coach' },
  { value: 'CAR_RENTAL', label: 'Rental Car' },
  { value: 'RESTAURANT', label: 'Restaurant Booking' },
  { value: 'ACTIVITY', label: 'Tour / Ticket' },
  { value: 'OTHER', label: 'Other Booking' }
];

export default function ReservationDialog({
  open,
  onClose,
  onSubmit,
  currency = 'USD',
  initialData = null
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('HOTEL');
  const [providerName, setProviderName] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [cost, setCost] = useState(0);
  const [externalUrl, setExternalUrl] = useState('');
  const [status, setStatus] = useState('CONFIRMED');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setType(initialData.type || 'HOTEL');
      setProviderName(initialData.providerName || '');
      setBookingReference(initialData.bookingReference || '');
      setStartDateTime(initialData.startDateTime ? initialData.startDateTime.slice(0, 16) : '');
      setEndDateTime(initialData.endDateTime ? initialData.endDateTime.slice(0, 16) : '');
      setLocation(initialData.location || '');
      setLatitude(initialData.latitude != null ? initialData.latitude.toString() : '');
      setLongitude(initialData.longitude != null ? initialData.longitude.toString() : '');
      setCost(initialData.costMinor ? initialData.costMinor / 100 : 0);
      setExternalUrl(initialData.externalUrl || '');
      setStatus(initialData.status || 'CONFIRMED');
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setType('HOTEL');
      setProviderName('');
      setBookingReference('');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      setStartDateTime(tomorrow.toISOString().slice(0, 16));
      setEndDateTime('');
      setLocation('');
      setLatitude('');
      setLongitude('');
      setCost(0);
      setExternalUrl('');
      setStatus('CONFIRMED');
      setNotes('');
    }
    setError('');
  }, [initialData, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setSubmitting(true);
    try {
      await onSubmit({
        title,
        type,
        providerName,
        bookingReference,
        startDateTime,
        endDateTime: endDateTime || null,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        cost: parseFloat(cost) || 0,
        currency,
        externalUrl,
        status,
        notes
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle fontWeight={800}>
          {initialData ? 'Edit Reservation' : 'Add Reservation / Booking Record'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <TextField
            fullWidth
            label="Reservation Title"
            placeholder="e.g. Hotel Gracery Shinjuku or Flight AF128"
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
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {RESERVATION_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Provider Name"
                placeholder="e.g. Booking.com / Delta"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                required
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Booking / Confirmation Reference"
                placeholder="e.g. BK-948291"
                value={bookingReference}
                onChange={(e) => setBookingReference(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={`Recorded Cost (${currency})`}
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 'any' } }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date & Time"
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date & Time (Optional)"
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Location / Address"
            placeholder="e.g. 1-19-1 Kabukicho, Shinjuku, Tokyo"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Booking Management URL"
            placeholder="https://..."
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Booking Notes & Instructions"
            placeholder="e.g. Confirmation in email, passport required at check-in"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Save Reservation'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

