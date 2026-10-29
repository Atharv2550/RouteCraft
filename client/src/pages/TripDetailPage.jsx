import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Avatar,
  AvatarGroup,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  useTheme
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import PlaceIcon from '@mui/icons-material/Place';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import GroupIcon from '@mui/icons-material/Group';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios.js';
import { getSocket } from '../lib/socket.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/AppShell.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ItineraryTab from '../features/trips/ItineraryTab.jsx';
import TripMapTab from '../features/trips/TripMapTab.jsx';
import BudgetTab from '../features/trips/BudgetTab.jsx';
import ReservationsTab from '../features/trips/ReservationsTab.jsx';
import CollaborationTab from '../features/trips/CollaborationTab.jsx';
import WeatherTab from '../features/trips/WeatherTab.jsx';
import TripSettingsTab from '../features/trips/TripSettingsTab.jsx';

export default function TripDetailPage() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [trip, setTrip] = useState(null);
  const [days, setDays] = useState([]);
  const [itemsByDay, setItemsByDay] = useState({});
  const [allItems, setAllItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTripDetails = useCallback(async () => {
    try {
      const [tripRes, itinRes, membersRes] = await Promise.all([
        api.get(`/trips/${tripId}`),
        api.get(`/trips/${tripId}/itinerary`),
        api.get(`/trips/${tripId}/members`)
      ]);

      if (tripRes.data.success) {
        setTrip(tripRes.data.trip);
      }
      if (itinRes.data.success) {
        setDays(itinRes.data.days || []);
        setItemsByDay(itinRes.data.itemsByDay || {});
        setAllItems(itinRes.data.items || []);
        setSuggestions(itinRes.data.suggestions || []);
      }
      if (membersRes.data.success) {
        setMembers(membersRes.data.members || []);
      }
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate('/trips');
      }
    } finally {
      setLoading(false);
    }
  }, [tripId, navigate]);

  useEffect(() => {
    fetchTripDetails();

    // Socket.IO real-time collaboration
    const socket = getSocket();
    if (socket) {
      socket.emit('join:trip', tripId);

      socket.on('itinerary:item-created', () => fetchTripDetails());
      socket.on('itinerary:item-updated', () => fetchTripDetails());
      socket.on('itinerary:item-deleted', () => fetchTripDetails());
      socket.on('itinerary:reordered', () => fetchTripDetails());
      socket.on('trip:updated', () => fetchTripDetails());

      return () => {
        socket.emit('leave:trip', tripId);
        socket.off('itinerary:item-created');
        socket.off('itinerary:item-updated');
        socket.off('itinerary:item-deleted');
        socket.off('itinerary:reordered');
        socket.off('trip:updated');
      };
    }
  }, [tripId, fetchTripDetails]);

  if (loading || !trip) {
    return (
      <AppShell>
        <LoadingScreen message="Loading trip itinerary..." />
      </AppShell>
    );
  }

  const userRole = trip.userRole || 'VIEWER';

  const startStr = new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endStr = new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <AppShell>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/dashboard" underline="hover" color="inherit">
            Dashboard
          </MuiLink>
          <MuiLink component={Link} to="/trips" underline="hover" color="inherit">
            Trips
          </MuiLink>
          <Typography color="text.primary" fontWeight={600}>
            {trip.title}
          </Typography>
        </Breadcrumbs>

        {/* Trip Banner Header */}
        <Box
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 3.5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1 }}>
                <Typography variant="h4" fontWeight={800}>
                  {trip.title}
                </Typography>
                <Chip
                  label={userRole}
                  size="small"
                  color={userRole === 'OWNER' ? 'primary' : userRole === 'EDITOR' ? 'secondary' : 'default'}
                  sx={{ fontWeight: 700 }}
                />
                <Chip
                  label={trip.status}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" sx={{ color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <CalendarMonthIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" fontWeight={600}>
                    {startStr} — {endStr} ({days.length} Days)
                  </Typography>
                </Box>
                {trip.primaryDestinationName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <PlaceIcon sx={{ fontSize: 18 }} />
                    <Typography variant="body2" fontWeight={600}>
                      {trip.primaryDestinationName}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" fontWeight={600}>
                    Target Budget: {trip.currency} {((trip.totalBudgetMinor || 0) / 100).toFixed(0)}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Companions Avatars */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AvatarGroup max={4}>
                {members.map((m) => {
                  const u = m.user;
                  if (!u) return null;
                  return (
                    <Avatar
                      key={m._id}
                      src={u.avatarUrl}
                      alt={u.name}
                      sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 700 }}
                    >
                      {u.name?.[0] || 'U'}
                    </Avatar>
                  );
                })}
              </AvatarGroup>
            </Box>
          </Box>
        </Box>

        {/* Trip Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<MapIcon />} iconPosition="start" label="Day-Wise Itinerary" sx={{ fontWeight: 600 }} />
            <Tab icon={<PlaceIcon />} iconPosition="start" label="Interactive Map" sx={{ fontWeight: 600 }} />
            <Tab icon={<AccountBalanceWalletIcon />} iconPosition="start" label="Budget & Expenses" sx={{ fontWeight: 600 }} />
            <Tab icon={<ConfirmationNumberIcon />} iconPosition="start" label="Bookings & Reservations" sx={{ fontWeight: 600 }} />
            <Tab icon={<GroupIcon />} iconPosition="start" label="Collaboration & Voting" sx={{ fontWeight: 600 }} />
            <Tab icon={<CloudQueueIcon />} iconPosition="start" label="Weather Forecast" sx={{ fontWeight: 600 }} />
            <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" sx={{ fontWeight: 600 }} />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        {activeTab === 0 && (
          <ItineraryTab
            trip={trip}
            days={days}
            itemsByDay={itemsByDay}
            suggestions={suggestions}
            userRole={userRole}
            onRefresh={fetchTripDetails}
          />
        )}

        {activeTab === 1 && (
          <TripMapTab
            trip={trip}
            days={days}
            items={allItems}
          />
        )}

        {activeTab === 2 && (
          <BudgetTab
            trip={trip}
            members={members}
            userRole={userRole}
            currentUserId={user?._id}
          />
        )}

        {activeTab === 3 && (
          <ReservationsTab
            trip={trip}
            userRole={userRole}
          />
        )}

        {activeTab === 4 && (
          <CollaborationTab
            trip={trip}
            members={members}
            userRole={userRole}
            currentUserId={user?._id}
            onRefresh={fetchTripDetails}
          />
        )}

        {activeTab === 5 && (
          <WeatherTab trip={trip} />
        )}

        {activeTab === 6 && (
          <TripSettingsTab
            trip={trip}
            userRole={userRole}
            onRefresh={fetchTripDetails}
          />
        )}
      </Container>
    </AppShell>
  );
}

