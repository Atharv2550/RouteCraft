import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Card sx={{ maxWidth: 500, p: 2, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'error.light' }}>
            <CardContent>
              <ErrorOutlineIcon sx={{ fontSize: 52, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" fontWeight={800} gutterBottom>
                Something went wrong
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                We encountered an unexpected error while rendering this page.
              </Typography>
              <Button variant="contained" color="primary" onClick={this.handleReload}>
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

