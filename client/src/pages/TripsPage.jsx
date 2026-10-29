import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/AppShell.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmationDialog from '../components/ConfirmationDialog.jsx';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'INR'];
const STYLES = ['BALANCED', 'BUDGET', 'LUXURY', 'FAST_PACED', 'RELAXED'];

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0); // 0: All, 1: Upcoming, 2: Completed, 3: Shared
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedTripForMenu, setSelectedTripForMenu] = useState(null);

  // New Trip Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [primaryDestinationName, setPrimaryDestinationName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [totalBudget, setTotalBudget] = useState(1000);
  const [travelStyle, setTravelStyle] = useState('BALANCED');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trips');
      if (res.data.success) {
        setTrips(res.data.trips);
      }
    } catch (e) {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();

    if (searchParams.get('create') === 'true') {
      const destParam = searchParams.get('destName');
      if (destParam) {
        setPrimaryDestinationName(destParam);
        setTitle(`Trip to ${destParam.split(',')[0]}`);
      }
      // Default dates: tomorrow to +4 days
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const plus4 = new Date(tomorrow);
      plus4.setDate(plus4.getDate() + 4);
      setStartDate(tomorrow.toISOString().split('T')[0]);
      setEndDate(plus4.toISOString().split('T')[0]);

      setCreateDialogOpen(true);
    }
  }, [searchParams]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (new Date(endDate) < new Date(startDate)) {
      setFormError('End date cannot be before start date');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/trips', {
        title,
        description,
        primaryDestinationName,
        startDate,
        endDate,
        currency,
        totalBudget: Number(totalBudget),
        travelStyle
      });

      if (res.data.success) {
        setCreateDialogOpen(false);
        // Clear search params
        setSearchParams({});
        navigate(`/trips/${res.data.trip._id}`);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (trip) => {
    setActionMenuAnchor(null);
    try {
      const res = await api.post(`/trips/${trip._id}/duplicate`);
      if (res.data.success) {
        navigate(`/trips/${res.data.trip._id}`);
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;
    try {
      await api.delete(`/trips/${tripToDelete._id}`);
      setTrips((prev) => prev.filter((t) => t._id !== tripToDelete._id));
      setDeleteConfirmOpen(false);
      setTripToDelete(null);
    } catch (e) {
      // Ignore
    }
  };

  const now = new Date();
  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.primaryDestinationName && t.primaryDestinationName.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    const start = new Date(t.startDate);
    const end = new Date(t.endDate);

    if (tab === 1) return end >= now; // Upcoming/ongoing
    if (tab === 2) return end < now; // Completed
    if (tab === 3) return t.userRole !== 'OWNER'; // Shared
    return true; // All
  });

  return (
    <AppShell>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              My Trips
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Organize, build day-by-day itineraries, and split costs with companions.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const plus4 = new Date(tomorrow);
              plus4.setDate(plus4.getDate() + 4);
              setStartDate(tomorrow.toISOString().split('T')[0]);
              setEndDate(plus4.toISOString().split('T')[0]);
              setCreateDialogOpen(true);
            }}
          >
            Create Trip
          </Button>
        </Box>

        {/* Filter bar */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2, mb: 3 }}>
          <Tabs value={tab} onChange={(e, val) => setTab(val)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label={`All (${trips.length})`} />
            <Tab label="Upcoming & Ongoing" />
            <Tab label="Completed" />
            <Tab label="Shared With Me" />
          </Tabs>

          <TextField
            size="small"
            placeholder="Search trips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              )
            }}
            sx={{ maxWidth: { md: 280 } }}
          />
        </Box>

        {/* Trips Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredTrips.length === 0 ? (
          <EmptyState
            title="No trips found"
            description={search ? "No trips match your search term." : "Start planning your first itinerary with destinations, activities, and budget tracking."}
            actionText="Plan a New Trip"
            onAction={() => setCreateDialogOpen(true)}
          />
        ) : (
          <Grid container spacing={3}>
            {filteredTrips.map((trip) => {
              const imgUrl =
                trip.destinations?.[0]?.imageReferences?.[0] ||
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

              const startStr = new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              const endStr = new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <Grid item xs={12} sm={6} md={4} key={trip._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={imgUrl}
                      alt={trip.title}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/trips/${trip._id}`)}
                    />

                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': { bgcolor: '#ffffff' }
                      }}
                      onClick={(e) => {
                        setSelectedTripForMenu(trip);
                        setActionMenuAnchor(e.currentTarget);
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>

                    <CardContent sx={{ flex: 1, pb: 1, cursor: 'pointer' }} onClick={() => navigate(`/trips/${trip._id}`)}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip label={trip.userRole} size="small" color={trip.userRole === 'OWNER' ? 'primary' : 'secondary'} />
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          {trip.currency} {((trip.totalBudgetMinor || 0) / 100).toFixed(0)} Budget
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
                        {trip.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 1 }}>
                        <CalendarMonthIcon sx={{ fontSize: 16 }} />
                        {startStr} — {endStr}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }} noWrap>
                        <LocationOnIcon sx={{ fontSize: 16 }} />
                        {trip.primaryDestinationName || 'Multiple Locations'}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
                      <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate(`/trips/${trip._id}`)}>
                        Open Itinerary
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Action Menu (Duplicate / Delete) */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={() => setActionMenuAnchor(null)}
          PaperProps={{ sx: { width: 180, borderRadius: 2 } }}
        >
          <MenuItem onClick={() => handleDuplicate(selectedTripForMenu)}>
            <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Duplicate Trip" />
          </MenuItem>
          {selectedTripForMenu?.userRole === 'OWNER' && (
            <MenuItem
              onClick={() => {
                setActionMenuAnchor(null);
                setTripToDelete(selectedTripForMenu);
                setDeleteConfirmOpen(true);
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText primary="Delete Trip" />
            </MenuItem>
          )}
        </Menu>

        {/* Create Trip Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <Box component="form" onSubmit={handleCreateSubmit}>
            <DialogTitle fontWeight={800}>Create New Trip</DialogTitle>
            <DialogContent>
              {formError && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  {formError}
                </Typography>
              )}

              <TextField
                fullWidth
                label="Trip Title"
                placeholder="e.g. Summer in Japan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                sx={{ mb: 2, mt: 1 }}
              />

              <TextField
                fullWidth
                label="Primary Destination"
                placeholder="e.g. Tokyo & Kyoto, Japan"
                value={primaryDestinationName}
                onChange={(e) => setPrimaryDestinationName(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    label="Currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {CURRENCIES.map((curr) => (
                      <MenuItem key={curr} value={curr}>
                        {curr}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Total Target Budget"
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
              </Grid>

              <TextField
                select
                fullWidth
                label="Travel Style"
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                sx={{ mb: 2 }}
              >
                {STYLES.map((st) => (
                  <MenuItem key={st} value={st}>
                    {st}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description & Highlights (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 0 }}>
              <Button onClick={() => setCreateDialogOpen(false)} color="inherit" disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={submitting}>
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Create Trip & Generate Days'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteConfirmOpen}
          title="Delete Trip?"
          message={`Are you sure you want to permanently delete "${tripToDelete?.title}"? All associated itinerary days, activities, expenses, bookings, and team discussions will be removed.`}
          confirmText="Delete Permanently"
          confirmColor="error"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteConfirmOpen(false);
            setTripToDelete(null);
          }}
        />
      </Container>
    </AppShell>
  );
}

