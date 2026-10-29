import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme
} from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import MapIcon from '@mui/icons-material/Map';
import GroupIcon from '@mui/icons-material/Group';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RouteIcon from '@mui/icons-material/Route';
import HotelIcon from '@mui/icons-material/Hotel';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/AppShell.jsx';

export default function LandingPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const handleQuickDemoLogin = async () => {
    try {
      await login('demo@routecraft.com', 'password123');
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  const FEATURES = [
    {
      icon: MapIcon,
      title: 'Day-Wise Itinerary Builder',
      desc: 'Build chronological activity timelines with estimated costs, durations, categories, and custom notes.'
    },
    {
      icon: RouteIcon,
      title: 'Rule-Based Route Optimization',
      desc: 'Smart 2-Opt and nearest-neighbor heuristics that minimize travel distance without machine learning.'
    },
    {
      icon: AccountBalanceWalletIcon,
      title: 'Expense Splitting & Balances',
      desc: 'Split bills equally, by custom amounts, or percentages. Automatically computes optimal settlement transfers.'
    },
    {
      icon: GroupIcon,
      title: 'Real-Time Group Collaboration',
      desc: 'Plan together with friends using Owner, Editor, and Viewer permissions, live voting, and instant sync.'
    },
    {
      icon: HotelIcon,
      title: 'Reservations & Booking Tracker',
      desc: 'Keep flights, hotels, trains, and dining bookings organized with conflict warning indicators.'
    },
    {
      icon: PictureAsPdfIcon,
      title: 'Professional PDF Export',
      desc: 'Export beautifully formatted day-by-day itineraries and full financial settlement summaries offline.'
    }
  ];

  const WORKFLOW_STEPS = [
    { step: '01', title: 'Pick Your Destination', desc: 'Browse curated world destinations or define custom coordinates.' },
    { step: '02', title: 'Craft the Day-by-Day', desc: 'Add attractions, dining spots, and bookings with interactive map markers.' },
    { step: '03', title: 'Optimize Your Route', desc: 'One-click rule-based route ordering saves travel time and transit fatigue.' },
    { step: '04', title: 'Split Costs & Travel', desc: 'Log expenses, split shares fairly, and generate settlement summaries.' }
  ];

  return (
    <AppShell showSidebar={false}>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="md">
          <Chip
            icon={<FlashOnIcon sx={{ fontSize: 16 }} />}
            label="Intelligent Travel Planning & Fair Cost Splitting"
            color="primary"
            variant="outlined"
            sx={{ mb: 3, fontWeight: 700, borderRadius: 3 }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.2rem' },
              fontWeight: 800,
              lineHeight: 1.15,
              mb: 3
            }}
          >
            Craft Your{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Perfect Itinerary
            </Box>
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 4, maxWidth: 680, mx: 'auto' }}>
            RouteCraft gives solo travelers and groups the superpowers to build day-wise schedules, optimize routes, collaborate in real-time, and split expenses seamlessly.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 4 }}>
            {isAuthenticated ? (
              <Button
                variant="contained"
                size="large"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{ py: 1.5, px: 4, fontSize: '1.05rem', fontWeight: 700 }}
              >
                Go to My Dashboard
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ py: 1.5, px: 4, fontSize: '1.05rem', fontWeight: 700 }}
                >
                  Start Planning Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  color="secondary"
                  onClick={handleQuickDemoLogin}
                  sx={{ py: 1.5, px: 3, fontSize: '1rem', fontWeight: 700 }}
                >
                  Quick Demo Login
                </Button>
              </>
            )}
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <CheckCircleOutlineIcon color="secondary" fontSize="small" />
              <Typography variant="body2" color="text.secondary">100% Free manual planning</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <CheckCircleOutlineIcon color="secondary" fontSize="small" />
              <Typography variant="body2" color="text.secondary">No hidden booking fees</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <CheckCircleOutlineIcon color="secondary" fontSize="small" />
              <Typography variant="body2" color="text.secondary">Deterministic rule-based logic</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Feature Highlights Grid */}
      <Box sx={{ py: 8, bgcolor: 'background.paper', borderRadius: 4, my: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Everything You Need for Effortless Journeys
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Engineered for precision, clarity, and peace of mind during travel with friends and family.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card sx={{ height: '100%', p: 1, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                    <CardContent>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 3,
                          bgcolor: 'primary.light',
                          color: 'primary.dark',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}
                      >
                        <Icon />
                      </Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {f.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {f.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Trip Planning Workflow */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              How RouteCraft Works
            </Typography>
            <Typography variant="body1" color="text.secondary">
              From initial idea to seamless execution in four straightforward steps.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {WORKFLOW_STEPS.map((s, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{ p: 2, height: '100%', bgcolor: 'background.paper' }}>
                  <CardContent>
                    <Typography variant="h2" fontWeight={800} color="primary.light" sx={{ mb: 1, opacity: 0.5 }}>
                      {s.step}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      {s.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {s.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Box */}
      <Box
        sx={{
          py: 8,
          px: 4,
          my: 6,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
          color: '#ffffff',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Ready to Craft Your Next Adventure?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of travelers who plan smarter trips, prevent scheduling conflicts, and settle group expenses fairly.
          </Typography>
          <Button
            component={Link}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#ffffff',
              color: '#0284c7',
              fontWeight: 800,
              py: 1.5,
              px: 4,
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            Create Your Trip Now
          </Button>
        </Container>
      </Box>
    </AppShell>
  );
}

