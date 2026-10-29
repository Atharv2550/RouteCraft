import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  useTheme
} from '@mui/material';
import LuggageIcon from '@mui/icons-material/Luggage';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupIcon from '@mui/icons-material/Group';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaidIcon from '@mui/icons-material/Paid';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/AppShell.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function DashboardPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/summary');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        // Quiet fail
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <LoadingScreen message="Loading your travel dashboard..." />
      </AppShell>
    );
  }

  const stats = data?.stats || {
    totalTrips: 0,
    upcomingTripsCount: 0,
    totalPlannedBudget: 0,
    userNetBalance: 0,
    currency: user?.preferredCurrency || 'USD'
  };

  const upcomingTrips = data?.upcomingTrips || [];
  const ongoingTrips = data?.ongoingTrips || [];
  const sharedTrips = data?.sharedTrips || [];
  const recentExpenses = data?.recentExpenses || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <AppShell>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Welcome Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here is an overview of your active journeys, group settlements, and upcoming itineraries.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<TravelExploreIcon />}
              onClick={() => navigate('/destinations')}
            >
              Explore Places
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => navigate('/trips?create=true')}
            >
              New Trip
            </Button>
          </Stack>
        </Box>

        {/* Metric Cards Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', p: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Upcoming Trips
                  </Typography>
                  <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LuggageIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={800}>
                  {stats.upcomingTripsCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.totalTrips} total planned trips
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', p: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Planned Budget
                  </Typography>
                  <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: 'secondary.light', color: 'secondary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AccountBalanceWalletIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={800}>
                  {stats.currency} {stats.totalPlannedBudget.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Across all active itineraries
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', p: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Net Group Balance
                  </Typography>
                  <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: stats.userNetBalance >= 0 ? 'secondary.light' : 'error.light', color: stats.userNetBalance >= 0 ? 'secondary.dark' : 'error.dark', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PaidIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={800} color={stats.userNetBalance > 0 ? 'secondary.main' : stats.userNetBalance < 0 ? 'error.main' : 'text.primary'}>
                  {stats.userNetBalance >= 0 ? `+${stats.currency} ${stats.userNetBalance.toFixed(2)}` : `-${stats.currency} ${Math.abs(stats.userNetBalance).toFixed(2)}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.userNetBalance > 0 ? 'You are owed by companions' : stats.userNetBalance < 0 ? 'You owe companions' : 'All balances settled up'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', p: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Shared Group Trips
                  </Typography>
                  <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.dark', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GroupIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight={800}>
                  {stats.sharedTripsCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Trips with active travel partners
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Ongoing / Upcoming Trips Section */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight={700}>
              Upcoming & Ongoing Trips
            </Typography>
            <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate('/trips')}>
              View All Trips
            </Button>
          </Box>

          {upcomingTrips.length === 0 && ongoingTrips.length === 0 ? (
            <EmptyState
              icon={LuggageIcon}
              title="No upcoming trips planned yet"
              description="Start crafting your first trip itinerary or browse destinations for ideas."
              actionText="Create a Trip"
              onAction={() => navigate('/trips?create=true')}
            />
          ) : (
            <Grid container spacing={3}>
              {[...ongoingTrips, ...upcomingTrips].slice(0, 3).map((trip) => {
                const imgUrl =
                  trip.destinations?.[0]?.imageReferences?.[0] ||
                  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80';

                const startStr = new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                const endStr = new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

                return (
                  <Grid item xs={12} md={4} key={trip._id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                      }}
                      onClick={() => navigate(`/trips/${trip._id}`)}
                    >
                      <CardMedia component="img" height="160" image={imgUrl} alt={trip.title} />
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Chip label={trip.userRole || 'OWNER'} size="small" color="primary" variant="outlined" />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {trip.currency} {((trip.totalBudgetMinor || 0) / 100).toFixed(0)} Budget
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
                          {trip.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 16 }} />
                          {startStr} — {endStr}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {trip.primaryDestinationName || 'Multiple Destinations'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>

        {/* Split Section: Recent Activity & Recent Expenses */}
        <Grid container spacing={4}>
          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', p: 1 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Recent Collaboration Activity
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {recentActivity.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No recent team activity yet. Invite companions to plan together!
                  </Typography>
                ) : (
                  <List disablePadding>
                    {recentActivity.slice(0, 5).map((log) => (
                      <ListItem key={log._id} disableGutters sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar src={log.actor?.avatarUrl} sx={{ width: 36, height: 36, bgcolor: 'primary.light', color: 'primary.dark' }}>
                            {log.actor?.name?.[0] || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600}>
                              {log.summary}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.disabled">
                              {log.trip?.title} • {new Date(log.createdAt).toLocaleDateString()}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Expenses */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', p: 1 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Recent Recorded Expenses
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {recentExpenses.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No expenses recorded yet. Track shared costs inside any trip!
                  </Typography>
                ) : (
                  <List disablePadding>
                    {recentExpenses.slice(0, 5).map((exp) => (
                      <ListItem
                        key={exp._id}
                        disableGutters
                        secondaryAction={
                          <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                            {exp.currency} {((exp.amountMinor || 0) / 100).toFixed(2)}
                          </Typography>
                        }
                        sx={{ py: 1 }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600}>
                              {exp.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              Paid by {exp.payer?.name} • {exp.trip?.title} • {exp.category}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </AppShell>
  );
}

