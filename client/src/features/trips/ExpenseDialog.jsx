import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  Divider,
  CircularProgress
} from '@mui/material';

const EXPENSE_CATEGORIES = [
  { value: 'accommodation', label: 'Accommodation / Lodging' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'transport', label: 'Transportation & Flights' },
  { value: 'activities', label: 'Activities & Sightseeing' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other Miscellaneous' }
];

export default function ExpenseDialog({
  open,
  onClose,
  onSubmit,
  members = [],
  currency = 'USD',
  currentUserId,
  initialData = null
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [payerId, setPayerId] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [splitMethod, setSplitMethod] = useState('EQUAL'); // EQUAL, EXACT, PERCENTAGE
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [customShares, setCustomShares] = useState({}); // userId -> amount or percentage
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setAmount(initialData.amountMinor ? (initialData.amountMinor / 100).toString() : '');
      setCategory(initialData.category || 'other');
      setPayerId(initialData.payer?._id || initialData.payer || currentUserId);
      setExpenseDate(initialData.expenseDate ? initialData.expenseDate.split('T')[0] : new Date().toISOString().split('T')[0]);
      setSplitMethod(initialData.splitMethod || 'EQUAL');
      const ids = new Set(initialData.shares?.map((s) => s.user?._id || s.user));
      setSelectedUserIds(ids);
      const cShares = {};
      initialData.shares?.forEach((s) => {
        const uId = s.user?._id || s.user;
        cShares[uId] = initialData.splitMethod === 'PERCENTAGE' ? s.percentage : (s.amountMinor / 100);
      });
      setCustomShares(cShares);
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCategory('food');
      setPayerId(currentUserId || (members[0]?.user?._id || ''));
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setSplitMethod('EQUAL');
      // Default: select all active members
      const allIds = new Set(members.map((m) => m.user?._id).filter(Boolean));
      setSelectedUserIds(allIds);
      setCustomShares({});
      setNotes('');
    }
    setError('');
  }, [initialData, open, members, currentUserId]);

  const handleToggleUser = (userId) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        if (next.size > 1) next.delete(userId); // At least 1 member required
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleCustomShareChange = (userId, val) => {
    setCustomShares((prev) => ({
      ...prev,
      [userId]: parseFloat(val) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid expense amount greater than 0');
      return;
    }

    if (selectedUserIds.size === 0) {
      setError('At least one participant must share this expense');
      return;
    }

    const shares = Array.from(selectedUserIds).map((userId) => {
      if (splitMethod === 'EXACT') {
        return {
          userId,
          amount: customShares[userId] || 0
        };
      }
      if (splitMethod === 'PERCENTAGE') {
        return {
          userId,
          percentage: customShares[userId] || 0
        };
      }
      return { userId }; // Equal split handled by backend integer arithmetic
    });

    if (splitMethod === 'EXACT') {
      const totalCustom = shares.reduce((sum, s) => sum + (s.amount || 0), 0);
      if (Math.abs(totalCustom - numAmount) > 0.05) {
        setError(`Sum of custom amounts ($${totalCustom.toFixed(2)}) must equal total ($${numAmount.toFixed(2)})`);
        return;
      }
    }

    if (splitMethod === 'PERCENTAGE') {
      const totalPct = shares.reduce((sum, s) => sum + (s.percentage || 0), 0);
      if (Math.abs(totalPct - 100) > 0.1) {
        setError(`Percentages must sum to 100% (currently ${totalPct}%)`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title,
        amount: numAmount,
        currency,
        category,
        payerId,
        expenseDate,
        splitMethod,
        shares,
        notes
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle fontWeight={800}>
          {initialData ? 'Edit Expense' : 'Record Trip Expense'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <TextField
            fullWidth
            label="Expense Description / Title"
            placeholder="e.g. Sushi Dinner, Hotel Tax, or Train Pass"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={`Total Amount (${currency})`}
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                InputProps={{ inputProps: { min: 0.01, step: 'any' } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Paid By"
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                required
              >
                {members.map((m) => {
                  const u = m.user;
                  if (!u) return null;
                  return (
                    <MenuItem key={u._id} value={u._id}>
                      {u.name} {u._id === currentUserId ? '(You)' : ''}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expense Date"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Split Mode Selector */}
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            How should this expense be split?
          </Typography>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {['EQUAL', 'EXACT', 'PERCENTAGE'].map((m) => (
              <Grid item xs={4} key={m}>
                <Button
                  fullWidth
                  variant={splitMethod === m ? 'contained' : 'outlined'}
                  color="primary"
                  size="small"
                  onClick={() => setSplitMethod(m)}
                  sx={{ py: 0.8 }}
                >
                  {m === 'EQUAL' ? 'Split Equally' : m === 'EXACT' ? 'Exact Amounts' : 'Percentages'}
                </Button>
              </Grid>
            ))}
          </Grid>

          {/* Participants list */}
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Select participants sharing this bill:
          </Typography>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, mb: 2 }}>
            {members.map((m) => {
              const u = m.user;
              if (!u) return null;
              const isChecked = selectedUserIds.has(u._id);

              return (
                <Box
                  key={u._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 0.8,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleToggleUser(u._id)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={600}>
                        {u.name}
                      </Typography>
                    }
                  />

                  {isChecked && splitMethod === 'EXACT' && (
                    <TextField
                      size="small"
                      type="number"
                      label={`Amount (${currency})`}
                      value={customShares[u._id] || ''}
                      onChange={(e) => handleCustomShareChange(u._id, e.target.value)}
                      sx={{ width: 130 }}
                      InputProps={{ inputProps: { min: 0, step: 'any' } }}
                    />
                  )}

                  {isChecked && splitMethod === 'PERCENTAGE' && (
                    <TextField
                      size="small"
                      type="number"
                      label="Share (%)"
                      value={customShares[u._id] || ''}
                      onChange={(e) => handleCustomShareChange(u._id, e.target.value)}
                      sx={{ width: 110 }}
                      InputProps={{ inputProps: { min: 0, max: 100 } }}
                    />
                  )}

                  {isChecked && splitMethod === 'EQUAL' && amount && (
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {currency} {(parseFloat(amount) / selectedUserIds.size).toFixed(2)}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          <TextField
            fullWidth
            label="Notes / Receipt reference (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Save Expense'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

