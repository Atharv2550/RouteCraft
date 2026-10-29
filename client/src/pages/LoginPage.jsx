import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GroupIcon from '@mui/icons-material/Group';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/AppShell.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, 'password123');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in with demo user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell showSidebar={false}>
      <Container maxWidth="xs" sx={{ py: 8 }}>
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  mb: 1.5,
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                }}
              >
                <ExploreIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h5" fontWeight={800}>
                Welcome to RouteCraft
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to manage and collaborate on your trips
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ py: 1.2, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                OR TEST WITH SEEDED DEMO ACCOUNTS
              </Typography>
            </Divider>

            <Stack spacing={1.5}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<PersonOutlineIcon />}
                onClick={() => handleDemoLogin('demo@routecraft.com')}
                disabled={loading}
              >
                Sign In as Sarah (Trip Owner)
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                startIcon={<GroupIcon />}
                onClick={() => handleDemoLogin('alex@routecraft.com')}
                disabled={loading}
              >
                Sign In as Alex (Travel Companion)
              </Button>
            </Stack>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account yet?{' '}
                <Button component={Link} to="/register" sx={{ fontWeight: 700, p: 0 }}>
                  Register here
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </AppShell>
  );
}

