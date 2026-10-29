import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios.js';
import ConfirmationDialog from '../../components/ConfirmationDialog.jsx';

const STYLES = ['BALANCED', 'BUDGET', 'LUXURY', 'FAST_PACED', 'RELAXED'];
const STATUSES = ['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'];

export default function TripSettingsTab({ trip, userRole = 'VIEWER', onRefresh }) {
  const [title, setTitle] = useState(trip.title || '');
  const [description, setDescription] = useState(trip.description || '');
  const [primaryDestinationName, setPrimaryDestinationName] = useState(trip.primaryDestinationName || '');
  const [totalBudget, setTotalBudget] = useState(trip.totalBudgetMinor ? trip.totalBudgetMinor / 100 : 0);
  const [travelStyle, setTravelStyle] = useState(trip.preferences?.travelStyle || 'BALANCED');
  const [status, setStatus] = useState(trip.status || 'PLANNING');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'success' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const navigate = useNavigate();
  const isOwner = userRole === 'OWNER';
  const canEdit = isOwner || userRole === 'EDITOR';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setMessage({ text: '', severity: 'success' });

    try {
      await api.patch(`/trips/${trip._id}`, {
        title,
        description,
        primaryDestinationName,
        totalBudget: Number(totalBudget),
        travelStyle,
        status
      });
      setMessage({ text: 'Trip settings updated successfully', severity: 'success' });
      onRefresh();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update trip', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrip = async () => {
    try {
      await api.delete(`/trips/${trip._id}`);
      navigate('/trips');
    } catch (e) {
      // Ignore
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Card sx={{ p: 2, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            General Trip Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage the overall parameters, target budget, and status of this journey.
          </Typography>

          {message.text && (
            <Alert severity={message.severity} sx={{ mb: 3, borderRadius: 2 }}>
              {message.text}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSave}>
            <TextField
              fullWidth
              label="Trip Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!canEdit}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Primary Destination Name"
              value={primaryDestinationName}
              onChange={(e) => setPrimaryDestinationName(e.target.value)}
              disabled={!canEdit}
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={`Total Target Budget (${trip.currency})`}
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  disabled={!canEdit}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Travel Pace / Style"
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  disabled={!canEdit}
                >
                  {STYLES.map((st) => (
                    <MenuItem key={st} value={st}>
                      {st}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              select
              fullWidth
              label="Trip Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={!canEdit}
              sx={{ mb: 2 }}
            >
              {STATUSES.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Trip Description & Objectives"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canEdit}
              sx={{ mb: 3 }}
            />

            {canEdit && (
              <Button type="submit" variant="contained" color="primary" disabled={saving}>
                {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Danger Zone: Delete Trip */}
      {isOwner && (
        <Card sx={{ p: 2, border: '1px solid', borderColor: 'error.light', borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} color="error.main" gutterBottom>
              Danger Zone
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Deleting this trip will permanently remove all associated itinerary days, activities, expense records, settlements, and bookings.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Permanently Delete Trip
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Delete Trip Permanently?"
        message={`Are you sure you want to delete "${trip.title}"? This action is irreversible and cascades to all associated records.`}
        confirmText="Yes, Delete It"
        confirmColor="error"
        onConfirm={handleDeleteTrip}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </Box>
  );
}

