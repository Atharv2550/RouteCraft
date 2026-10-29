import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/AppShell.jsx';

export default function InviteAcceptPage() {
  const { token } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/invite/${token}` } } });
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/invitations/${token}/accept`);
      if (res.data.success) {
        navigate(`/trips/${res.data.trip._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    try {
      await api.post(`/invitations/${token}/reject`);
      navigate('/dashboard');
    } catch (e) {
      navigate('/dashboard');
    }
  };

  return (
    <AppShell showSidebar={false}>
      <Container maxWidth="xs" sx={{ py: 12 }}>
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <CardContent>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                color: 'primary.dark',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <GroupAddIcon sx={{ fontSize: 32 }} />
            </Box>

            <Typography variant="h5" fontWeight={800} gutterBottom>
              Trip Companion Invitation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You have been invited to collaborate on a travel itinerary in RouteCraft!
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={handleAccept}
              disabled={loading}
              sx={{ py: 1.2, fontWeight: 700, mb: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Accept & Join Trip'}
            </Button>

            <Button
              fullWidth
              color="inherit"
              onClick={handleDecline}
              disabled={loading}
            >
              Decline Invitation
            </Button>
          </CardContent>
        </Card>
      </Container>
    </AppShell>
  );
}

