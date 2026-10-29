import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip, Button } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import RouteIcon from '@mui/icons-material/Route';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import HotelIcon from '@mui/icons-material/Hotel';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';

export default function FeaturesPage() {
  const MODULES = [
    {
      title: 'Day-Wise Itinerary Architecture',
      icon: MapIcon,
      badge: 'Core Planning',
      points: [
        'Automatic calendar day generation matching your trip start and end dates',
        'Time slot validation with automatic overlap warnings',
        'Categorized activities (sightseeing, food, transport, culture, lodging)',
        'Estimated cost tracking compared against planned daily budgets',
        'Direct links to Google Maps navigation coordinates'
      ]
    },
    {
      title: 'Deterministic Route Optimization',
      icon: RouteIcon,
      badge: 'Smart Heuristics',
      points: [
        'Nearest Neighbor and 2-Opt local search heuristics minimize total distance',
        'Respects fixed-time bookings and locked activities',
        'Visual preview comparison of original vs. proposed route distance (km)',
        'Transparent and reviewable: never silently changes your itinerary',
        'Calculates estimated transit times for walking and driving'
      ]
    },
    {
      title: 'Expense Splitting & Cash Flow Settlements',
      icon: AccountBalanceWalletIcon,
      badge: 'Financial Engine',
      points: [
        'Multiple splitting models: Equal Split, Custom Exact amounts, and Percentages',
        'Integer minor unit arithmetic prevents floating point rounding discrepancies',
        'Real-time Net Balance calculation for every trip companion',
        'Minimizing Cash Flow algorithm generates minimal transfer recommendations',
        'Record confirmed payments to update balances in real-time'
      ]
    },
    {
      title: 'Destination Voting & Group Consensus',
      icon: HowToVoteIcon,
      badge: 'Collaboration',
      points: [
        'Propose candidate spots and day trips for group feedback',
        'One-member-one-vote validation preventing duplicate votes',
        'Live percentage progress bars and real-time Socket.IO sync',
        'Poll closure and direct selection into the active itinerary'
      ]
    },
    {
      title: 'Manual Reservation & Booking Ledger',
      icon: HotelIcon,
      badge: 'Organization',
      points: [
        'Track Hotels, Flights, Trains, Rental Cars, and Dining bookings',
        'Automatic conflict detection if overlapping bookings are detected',
        'Stores booking confirmation numbers, addresses, and external links',
        'Clearly marks records as user-managed without false booking claims'
      ]
    },
    {
      title: 'Executive PDF Exports',
      icon: PictureAsPdfIcon,
      badge: 'Offline Utility',
      points: [
        'Itinerary PDF export with branded layout, days, activities, and notes',
        'Expense PDF export with category totals, member shares, and settlements',
        'Authorized server-side streaming protecting private trip data'
      ]
    }
  ];

  return (
    <AppShell showSidebar={false}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip label="Platform Capabilities" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 700 }} />
          <Typography variant="h2" fontWeight={800} gutterBottom>
            Engineered for Stress-Free Travel Planning
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650, mx: 'auto' }}>
            Explore the comprehensive suite of tools built into RouteCraft to organize, optimize, and share travel plans.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <Grid item xs={12} md={6} key={i}>
                <Card sx={{ height: '100%', p: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
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
                        <Typography variant="h6" fontWeight={700}>
                          {mod.title}
                        </Typography>
                      </Box>
                      <Chip label={mod.badge} size="small" color="secondary" />
                    </Box>

                    <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                      {mod.points.map((pt, idx) => (
                        <Typography component="li" variant="body2" color="text.secondary" key={idx} sx={{ mb: 1 }}>
                          {pt}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Button component={Link} to="/register" variant="contained" color="primary" size="large" sx={{ px: 5, py: 1.5, fontWeight: 700 }}>
            Start Planning Now
          </Button>
        </Box>
      </Container>
    </AppShell>
  );
}

