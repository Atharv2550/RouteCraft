import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Divider,
  Stack,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HotelIcon from '@mui/icons-material/Hotel';
import FlightIcon from '@mui/icons-material/Flight';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../lib/axios.js';
import ReservationDialog from './ReservationDialog.jsx';
import EmptyState from '../../components/EmptyState.jsx';

function getReservationIcon(type) {
  switch (type) {
    case 'HOTEL': return HotelIcon;
    case 'FLIGHT': return FlightIcon;
    case 'TRAIN': return TrainIcon;
    case 'BUS': return DirectionsBusIcon;
    case 'CAR_RENTAL': return DirectionsCarIcon;
    case 'RESTAURANT': return RestaurantIcon;
    default: return ConfirmationNumberIcon;
  }
}

export default function ReservationsTab({ trip, userRole = 'VIEWER' }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [conflictNotice, setConflictNotice] = useState('');

  const canEdit = userRole === 'OWNER' || userRole === 'EDITOR';

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/trips/${trip._id}/reservations`);
      if (res.data.success) {
        setReservations(res.data.reservations);
      }
    } catch (e) {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [trip._id]);

  const handleOpenAdd = () => {
    setEditingReservation(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (res) => {
    setEditingReservation(res);
    setDialogOpen(true);
  };

  const handleDelete = async (resId) => {
    try {
      await api.delete(`/trips/${trip._id}/reservations/${resId}`);
      fetchReservations();
    } catch (e) {
      // Quiet fail
    }
  };

  const handleSave = async (payload) => {
    if (editingReservation) {
      await api.patch(`/trips/${trip._id}/reservations/${editingReservation._id}`, payload);
    } else {
      const res = await api.post(`/trips/${trip._id}/reservations`, payload);
      if (res.data.conflicts?.length > 0) {
        setConflictNotice(res.data.conflicts.join(' '));
      } else {
        setConflictNotice('');
      }
    }
    fetchReservations();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Reservations & Travel Bookings Ledger
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep track of flights, hotels, trains, and dining confirmations in one place.
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
          >
            Add Booking
          </Button>
        )}
      </Box>

      {conflictNotice && (
        <Alert severity="warning" onClose={() => setConflictNotice('')} sx={{ mb: 3, borderRadius: 2 }}>
          {conflictNotice}
        </Alert>
      )}

      {reservations.length === 0 ? (
        <EmptyState
          icon={ConfirmationNumberIcon}
          title="No reservations tracked yet"
          description="Log flight itineraries, hotel confirmation codes, or rental cars to prevent travel schedule conflicts."
          actionText={canEdit ? 'Add First Booking' : undefined}
          onAction={handleOpenAdd}
        />
      ) : (
        <Grid container spacing={3}>
          {reservations.map((res) => {
            const Icon = getReservationIcon(res.type);
            const startStr = new Date(res.startDateTime).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            });
            const endStr = res.endDateTime
              ? new Date(res.endDateTime).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })
              : null;

            return (
              <Grid item xs={12} md={6} key={res._id}>
                <Card sx={{ height: '100%', p: 1.5, position: 'relative' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2.5,
                            bgcolor: 'primary.light',
                            color: 'primary.dark',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Icon />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {res.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Provider: {res.providerName}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        label={res.status}
                        size="small"
                        color={res.status === 'CONFIRMED' ? 'secondary' : 'default'}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Stack spacing={0.8} sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Starts:</strong> {startStr}
                      </Typography>
                      {endStr && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Ends:</strong> {endStr}
                        </Typography>
                      )}
                      {res.bookingReference && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Ref #:</strong> <code>{res.bookingReference}</code>
                        </Typography>
                      )}
                      {res.location && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          <strong>Location:</strong> {res.location}
                        </Typography>
                      )}
                      {res.costMinor > 0 && (
                        <Typography variant="body2" color="secondary.main" fontWeight={700}>
                          Cost: {res.currency} {((res.costMinor || 0) / 100).toFixed(2)}
                        </Typography>
                      )}
                      {res.notes && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                          Notes: {res.notes}
                        </Typography>
                      )}
                    </Stack>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                      {res.externalUrl ? (
                        <Button
                          size="small"
                          endIcon={<OpenInNewIcon />}
                          href={res.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Booking Link
                        </Button>
                      ) : <Box />}

                      {canEdit && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleOpenEdit(res)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(res._id)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Reservation Dialog Modal */}
      <ReservationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSave}
        currency={trip.currency}
        initialData={editingReservation}
      />
    </Box>
  );
}

