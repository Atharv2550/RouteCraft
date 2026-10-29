import React from 'react';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import AppShell from '../components/AppShell.jsx';

export default function PrivacyPolicyPage() {
  return (
    <AppShell showSidebar={false}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card sx={{ p: 3 }}>
          <CardContent>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Privacy Policy
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
              [Placeholder - Content requires legal team final review]
            </Typography>

            <Typography variant="body1" paragraph>
              RouteCraft ("we", "our", or "us") is dedicated to protecting your privacy while you organize trips, explore destinations, and split expenses.
            </Typography>

            <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
              1. Information We Collect
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We collect information you directly provide to us, such as your name, email address, password hash, preferred currency, trip titles, itinerary items, and expense records. We do not process live credit card payments or store sensitive banking credentials.
            </Typography>

            <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
              2. How We Use Your Data
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your data is solely used to deliver trip scheduling, calculate financial settlements among your designated travel companions, provide weather forecasts, and maintain synchronized real-time collaboration.
            </Typography>

            <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 1 }}>
              3. Data Sharing & Security
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Private trip itineraries and financial records are restricted to authenticated members of your trip. We apply industry-standard password hashing (bcrypt) and session controls.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </AppShell>
  );
}

