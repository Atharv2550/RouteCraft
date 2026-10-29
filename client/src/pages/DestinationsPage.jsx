import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  MenuItem,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MapIcon from '@mui/icons-material/Map';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/AppShell.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [selectedDest, setSelectedDest] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [addToTripDialogOpen, setAddToTripDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (regionFilter) params.region = regionFilter;

      const res = await api.get('/destinations', { params });
      if (res.data.success) {
        setDestinations(res.data.destinations);
        if (res.data.filters) {
          setAvailableCategories(res.data.filters.categories || []);
          setAvailableRegions(res.data.filters.regions || []);
        }
      }
    } catch (err) {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/users/me/wishlist');
      if (res.data.success) {
        const idSet = new Set(res.data.wishlist.map((w) => w.destination?._id));
        setWishlistIds(idSet);
      }
    } catch (e) {
      // Ignore
    }
  };

  const fetchUserTrips = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/trips');
      if (res.data.success) {
        setUserTrips(res.data.trips);
      }
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchDestinations, 300);
    return () => clearTimeout(timeout);
  }, [search, categoryFilter, regionFilter]);

  useEffect(() => {
    fetchWishlist();
    fetchUserTrips();
  }, [isAuthenticated]);

  const toggleWishlist = async (destId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const isSaved = wishlistIds.has(destId);
    try {
      if (isSaved) {
        await api.delete(`/users/me/wishlist/${destId}`);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(destId);
          return next;
        });
        setSnackbar({ open: true, message: 'Removed from wishlist', severity: 'info' });
      } else {
        await api.post('/users/me/wishlist', { destinationId: destId });
        setWishlistIds((prev) => new Set(prev).add(destId));
        setSnackbar({ open: true, message: 'Added to wishlist!', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update wishlist', severity: 'error' });
    }
  };

  const handleOpenAddToTrip = (dest) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedDest(dest);
    setAddToTripDialogOpen(true);
  };

  const handleConfirmAddToTrip = async () => {
    if (!selectedTripId || !selectedDest) return;
    try {
      // Add destination to trip
      await api.patch(`/trips/${selectedTripId}`, {
        primaryDestinationName: `${selectedDest.name}, ${selectedDest.country}`
      });
      setSnackbar({ open: true, message: `Updated destination for trip!`, severity: 'success' });
      setAddToTripDialogOpen(false);
      navigate(`/trips/${selectedTripId}`);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to link destination to trip', severity: 'error' });
    }
  };

  return (
    <AppShell>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Explore Destinations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover curated cities, cultural wonders, and breathtaking natural sites around the world.
          </Typography>
        </Box>

        {/* Filter & Search Bar */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search by city, country, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3.5}>
            <TextField
              select
              fullWidth
              label="Filter by Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {availableCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3.5}>
            <TextField
              select
              fullWidth
              label="Filter by Region"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <MenuItem value="">All Regions</MenuItem>
              {availableRegions.map((reg) => (
                <MenuItem key={reg} value={reg}>
                  {reg}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Destinations Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : destinations.length === 0 ? (
          <EmptyState
            title="No destinations match your search"
            description="Try clearing your filters or search query to view all available destinations."
            actionText="Clear Filters"
            onAction={() => {
              setSearch('');
              setCategoryFilter('');
              setRegionFilter('');
            }}
          />
        ) : (
          <Grid container spacing={3}>
            {destinations.map((dest) => {
              const isSaved = wishlistIds.has(dest._id);
              const imgUrl =
                dest.imageReferences?.[0] ||
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={dest._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="190"
                        image={imgUrl}
                        alt={dest.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        onClick={() => toggleWishlist(dest._id)}
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                          color: isSaved ? 'error.main' : 'action.active',
                          '&:hover': { bgcolor: '#ffffff' }
                        }}
                      >
                        {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                      <Chip
                        label={dest.country}
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          left: 10,
                          bgcolor: 'rgba(15, 23, 42, 0.85)',
                          color: '#ffffff',
                          fontWeight: 700
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flex: 1, pb: 1 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
                        {dest.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {dest.description}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 2 }}>
                        {dest.categories?.slice(0, 3).map((cat) => (
                          <Chip key={cat} label={cat} size="small" variant="outlined" />
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                          <CalendarMonthIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" fontWeight={600}>
                            {dest.recommendedDurationDays || 3} days
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'secondary.main' }}>
                          <AttachMoneyIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" fontWeight={700}>
                            ${Math.round((dest.averageCostPerDayMinor || 15000) / 100)}/day
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
                      <Button size="small" onClick={() => setSelectedDest(dest)}>
                        Details
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenAddToTrip(dest)}
                      >
                        Plan Trip
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Destination Detail Dialog */}
        {selectedDest && (
          <Dialog
            open={Boolean(selectedDest)}
            onClose={() => setSelectedDest(null)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="220"
                image={selectedDest.imageReferences?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                alt={selectedDest.name}
              />
            </Box>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" fontWeight={800}>
                {selectedDest.name}, {selectedDest.country}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Region: {selectedDest.region || 'International'}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedDest.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {selectedDest.categories?.map((cat) => (
                  <Chip key={cat} label={cat} color="primary" variant="outlined" size="small" />
                ))}
              </Box>

              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Recommended</Typography>
                  <Typography variant="subtitle2" fontWeight={700}>{selectedDest.recommendedDurationDays || 3} Days</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Estimated Budget</Typography>
                  <Typography variant="subtitle2" fontWeight={700}>${Math.round((selectedDest.averageCostPerDayMinor || 15000) / 100)} / day</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Coordinates</Typography>
                  <Typography variant="subtitle2" fontWeight={700}>{selectedDest.latitude?.toFixed(2)}, {selectedDest.longitude?.toFixed(2)}</Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 0 }}>
              <Button onClick={() => setSelectedDest(null)} color="inherit">
                Close
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  const d = selectedDest;
                  setSelectedDest(null);
                  handleOpenAddToTrip(d);
                }}
              >
                Plan Trip to {selectedDest.name}
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Add to Trip Dialog */}
        <Dialog
          open={addToTripDialogOpen}
          onClose={() => setAddToTripDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle fontWeight={700}>Add {selectedDest?.name} to Trip</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose an existing trip to set this as the primary destination, or create a brand new trip.
            </Typography>

            {userTrips.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You don't have any trips yet.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    setAddToTripDialogOpen(false);
                    navigate(`/trips?create=true&destName=${encodeURIComponent(selectedDest?.name + ', ' + selectedDest?.country)}`);
                  }}
                >
                  Create Trip for {selectedDest?.name}
                </Button>
              </Box>
            ) : (
              <Box>
                <TextField
                  select
                  fullWidth
                  label="Select Trip"
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  {userTrips.map((t) => (
                    <MenuItem key={t._id} value={t._id}>
                      {t.title}
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setAddToTripDialogOpen(false);
                    navigate(`/trips?create=true&destName=${encodeURIComponent(selectedDest?.name + ', ' + selectedDest?.country)}`);
                  }}
                >
                  Or Start a New Trip
                </Button>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setAddToTripDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            {userTrips.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                disabled={!selectedTripId}
                onClick={handleConfirmAddToTrip}
              >
                Add to Trip
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Toast Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </AppShell>
  );
}

