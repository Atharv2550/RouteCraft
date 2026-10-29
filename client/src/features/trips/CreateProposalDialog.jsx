import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

export default function CreateProposalDialog({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        destinationName,
        country,
        description,
        imageUrl
      });
      onClose();
      setTitle('');
      setDestinationName('');
      setCountry('');
      setDescription('');
      setImageUrl('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create voting proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle fontWeight={800}>Propose Spot for Group Vote</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <TextField
            fullWidth
            label="Proposal Question / Topic"
            placeholder="e.g. Day 4 Excursion: Deer Park or Food Crawl?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Candidate Destination Name"
            placeholder="e.g. Nara Deer Park"
            value={destinationName}
            onChange={(e) => setDestinationName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Country / Region"
            placeholder="e.g. Japan"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Image URL (Optional)"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Why should the group visit?"
            placeholder="Describe what makes this spot worth visiting..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Create Proposal'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

