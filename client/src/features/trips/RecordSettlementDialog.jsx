import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';

export default function RecordSettlementDialog({
  open,
  onClose,
  onSubmit,
  members = [],
  currency = 'USD',
  initialPayerId = '',
  initialReceiverId = '',
  initialAmount = 0
}) {
  const [payerId, setPayerId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPayerId(initialPayerId || members[0]?.user?._id || '');
      setReceiverId(initialReceiverId || members[1]?.user?._id || '');
      setAmount(initialAmount ? initialAmount.toString() : '');
      setNotes('Direct settlement transfer');
      setError('');
    }
  }, [open, initialPayerId, initialReceiverId, initialAmount, members]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmt = parseFloat(amount);
    if (!numAmt || numAmt <= 0) {
      setError('Amount must be positive');
      return;
    }

    if (payerId === receiverId) {
      setError('Payer and receiver cannot be the same member');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        payerId,
        receiverId,
        amount: numAmt,
        currency,
        notes
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record settlement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle fontWeight={800}>Record Debt Settlement</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="caption">
              This records a completed transfer (cash, bank, Venmo, Revolut) into the trip ledger to update member balances.
            </Typography>
          </Alert>

          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <TextField
            select
            fullWidth
            label="Who Paid (Debtor)"
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            required
            sx={{ mb: 2 }}
          >
            {members.map((m) => {
              const u = m.user;
              if (!u) return null;
              return (
                <MenuItem key={u._id} value={u._id}>
                  {u.name}
                </MenuItem>
              );
            })}
          </TextField>

          <TextField
            select
            fullWidth
            label="Who Received (Creditor)"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            required
            sx={{ mb: 2 }}
          >
            {members.map((m) => {
              const u = m.user;
              if (!u) return null;
              return (
                <MenuItem key={u._id} value={u._id}>
                  {u.name}
                </MenuItem>
              );
            })}
          </TextField>

          <TextField
            fullWidth
            label={`Amount Transferred (${currency})`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            InputProps={{ inputProps: { min: 0.01, step: 'any' } }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Payment Method / Notes"
            placeholder="e.g. Paid via Bank Transfer / Revolut"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="secondary" disabled={submitting}>
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm Settlement'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

