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
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios.js';
import AppShell from '../components/AppShell.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/me/wishlist');
      if (res.data.success) {
        setWishlist(res.data.wishlist);
      }
    } catch (e) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (destId) => {
    try {
      await api.delete(`/users/me/wishlist/${destId}`);
      setWishlist((prev) => prev.filter((item) => item.destination?._id !== destId));
    } catch (e) {
      // Ignore
    }
  };

  return (
    <AppShell>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            My Saved Wishlist
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Keep track of dreamy destinations you want to craft itineraries for in the future.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : wishlist.length === 0 ? (
          <EmptyState
            title="Your wishlist is empty"
            description="Explore our world destination catalog and click the heart icon on places that inspire you."
            actionText="Discover Destinations"
            onAction={() => navigate('/destinations')}
          />
        ) : (
          <Grid container spacing={3}>
            {wishlist.map((item) => {
              const dest = item.destination;
              if (!dest) return null;
              const imgUrl =
                dest.imageReferences?.[0] ||
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={dest._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={imgUrl}
                      alt={dest.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" fontWeight={700}>
                          {dest.name}
                        </Typography>
                        <Chip label={dest.country} size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {dest.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleRemove(dest._id)}
                        title="Remove from wishlist"
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() =>
                          navigate(
                            `/trips?create=true&destName=${encodeURIComponent(
                              dest.name + ', ' + dest.country
                            )}`
                          )
                        }
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
      </Container>
    </AppShell>
  );
}

