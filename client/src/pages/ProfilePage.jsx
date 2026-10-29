import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  Avatar,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockResetIcon from '@mui/icons-material/LockReset';
import api from '../lib/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppShell from '../components/AppShell.jsx';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'INR', 'SGD'];
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Australia/Sydney',
  'UTC'
];

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || 'USD');
  const [timezone, setTimezone] = useState(user?.timezone || 'America/New_York');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: '', severity: 'success' });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: '', severity: 'success' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage({ text: '', severity: 'success' });
    try {
      const res = await api.patch('/users/me', {
        name,
        avatarUrl,
        preferredCurrency,
        timezone
      });
      if (res.data.success) {
        updateUserProfile(res.data.user);
        setProfileMessage({ text: 'Profile updated successfully!', severity: 'success' });
      }
    } catch (err) {
      setProfileMessage({ text: err.response?.data?.message || 'Failed to update profile', severity: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'New passwords do not match', severity: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ text: 'New password must be at least 8 characters', severity: 'error' });
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage({ text: '', severity: 'success' });
    try {
      const res = await api.patch('/users/me/password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        setPasswordMessage({ text: 'Password changed successfully!', severity: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordMessage({ text: err.response?.data?.message || 'Failed to change password', severity: 'error' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <AppShell>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Account Profile & Preferences
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your personal traveler details, home currency, and security credentials.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Personal Info */}
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    src={avatarUrl}
                    sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 800 }}
                  >
                    {name?.[0] || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>

                {profileMessage.text && (
                  <Alert severity={profileMessage.severity} sx={{ mb: 2, borderRadius: 2 }}>
                    {profileMessage.text}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleUpdateProfile}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        value={user?.email || ''}
                        disabled
                        helperText="Email cannot be changed"
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Avatar Image URL (Optional)"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Preferred Currency"
                        value={preferredCurrency}
                        onChange={(e) => setPreferredCurrency(e.target.value)}
                      >
                        {CURRENCIES.map((c) => (
                          <MenuItem key={c} value={c}>
                            {c}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Timezone"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                      >
                        {TIMEZONES.map((tz) => (
                          <MenuItem key={tz} value={tz}>
                            {tz}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>

                  <Button type="submit" variant="contained" color="primary" disabled={profileSaving}>
                    {profileSaving ? <CircularProgress size={24} color="inherit" /> : 'Save Profile'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Change Password */}
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LockResetIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    Security & Password
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                  Ensure your account uses a secure password of at least 8 characters.
                </Typography>

                {passwordMessage.text && (
                  <Alert severity={passwordMessage.severity} sx={{ mb: 2, borderRadius: 2 }}>
                    {passwordMessage.text}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleChangePassword}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                  />

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </Grid>
                  </Grid>

                  <Button type="submit" variant="outlined" color="primary" disabled={passwordSaving}>
                    {passwordSaving ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </AppShell>
  );
}

