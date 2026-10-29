import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

export default function InviteMemberDialog({ open, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EDITOR');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleReset = () => {
    setEmail('');
    setRole('EDITOR');
    setError('');
    setGeneratedLink('');
    setCopied(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await onSubmit({ email, role });
      if (res && res.invitationToken) {
        const fullLink = `${window.location.origin}/invite/${res.invitationToken}`;
        setGeneratedLink(fullLink);
      } else {
        onClose();
        handleReset();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Dialog open={open} onClose={() => { onClose(); handleReset(); }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle fontWeight={800}>Invite Travel Companion</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {generatedLink ? (
            <Box sx={{ py: 1 }}>
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                Invitation created successfully! Share this link directly with your companion.
              </Alert>

              <TextField
                fullWidth
                label="Direct Invitation Link"
                value={generatedLink}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleCopyLink} edge="end" color="primary">
                        {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {copied && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                  Link copied to clipboard!
                </Typography>
              )}
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Invite a companion by entering their email address and assigning their trip role.
              </Typography>

              <TextField
                fullWidth
                label="Companion Email Address"
                type="email"
                placeholder="companion@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                select
                fullWidth
                label="Permission Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="EDITOR">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>Editor</Typography>
                    <Typography variant="caption" color="text.secondary">Can add/edit activities, log expenses, and vote</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="VIEWER">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>Viewer</Typography>
                    <Typography variant="caption" color="text.secondary">Read-only access to itinerary, budget, and map</Typography>
                  </Box>
                </MenuItem>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { onClose(); handleReset(); }} color="inherit">
            {generatedLink ? 'Done' : 'Cancel'}
          </Button>
          {!generatedLink && (
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {submitting ? <CircularProgress size={24} color="inherit" /> : 'Generate Invite Link'}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}

