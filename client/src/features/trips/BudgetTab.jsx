import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
  Stack,
  LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PaidIcon from '@mui/icons-material/Paid';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../../lib/axios.js';
import ExpenseDialog from './ExpenseDialog.jsx';
import RecordSettlementDialog from './RecordSettlementDialog.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const CHART_COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export default function BudgetTab({
  trip,
  members = [],
  userRole = 'VIEWER',
  currentUserId
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);
  const [selectedSettlementForRecord, setSelectedSettlementForRecord] = useState(null);

  const canEdit = userRole === 'OWNER' || userRole === 'EDITOR';

  const fetchExpensesData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/trips/${trip._id}/expenses`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (e) {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesData();
  }, [trip._id]);

  const handleCreateExpense = async (payload) => {
    await api.post(`/trips/${trip._id}/expenses`, payload);
    fetchExpensesData();
  };

  const handleDeleteExpense = async (expId) => {
    await api.delete(`/trips/${trip._id}/expenses/${expId}`);
    fetchExpensesData();
  };

  const handleRecordSettlement = async (payload) => {
    await api.post(`/trips/${trip._id}/settlements`, payload);
    fetchExpensesData();
  };

  const handleDownloadPdf = () => {
    window.open(`${api.defaults.baseURL}/trips/${trip._id}/export/expenses.pdf`, '_blank');
  };

  const totalBudget = data?.totalBudget || (trip.totalBudgetMinor / 100) || 0;
  const totalSpent = data?.totalSpent || 0;
  const budgetRemaining = totalBudget - totalSpent;
  const spendingPct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  const expenses = data?.expenses || [];
  const netBalances = data?.netBalances || [];
  const settlementSuggestions = data?.settlementSuggestions || [];
  const categoryTotals = data?.categoryTotals || {};

  const pieData = Object.entries(categoryTotals).map(([cat, amt]) => ({
    name: cat.toUpperCase(),
    value: amt
  }));

  return (
    <Box>
      {/* Header Actions */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Budget Tracking & Expense Splitting
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep group bills organized, view real-time net balances, and minimize settlement transfers.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPdf}
          >
            Export Expenses PDF
          </Button>
          {canEdit && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setExpenseDialogOpen(true)}
            >
              Log Expense
            </Button>
          )}
        </Stack>
      </Box>

      {/* Overview Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Target Trip Budget
              </Typography>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                {trip.currency} {totalBudget.toFixed(2)}
              </Typography>
              <Box sx={{ mt: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Budget used</Typography>
                  <Typography variant="caption" fontWeight={700}>{spendingPct}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={spendingPct}
                  color={spendingPct > 90 ? 'error' : 'primary'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Total Recorded Spending
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                {trip.currency} {totalSpent.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                {expenses.length} recorded bill(s)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Remaining Balance
              </Typography>
              <Typography
                variant="h4"
                fontWeight={800}
                color={budgetRemaining >= 0 ? 'secondary.main' : 'error.main'}
              >
                {trip.currency} {budgetRemaining.toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                {budgetRemaining >= 0 ? 'Within target budget' : 'Over budget'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Net Balances & Suggested Settlements */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Net Balances */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Member Net Balances
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Positive balance indicates amount to receive (+); negative balance indicates amount owed (-).
              </Typography>

              {netBalances.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No balance records yet.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {netBalances.map((b) => {
                    const isPositive = b.netBalance > 0;
                    const isNegative = b.netBalance < 0;

                    return (
                      <Box
                        key={b.user._id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'action.hover'
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={700}>
                          {b.user.name} {b.user._id === currentUserId ? '(You)' : ''}
                        </Typography>
                        <Chip
                          label={
                            isPositive
                              ? `+${trip.currency} ${b.netBalance.toFixed(2)}`
                              : isNegative
                              ? `-${trip.currency} ${Math.abs(b.netBalance).toFixed(2)}`
                              : 'Settled ($0.00)'
                          }
                          color={isPositive ? 'secondary' : isNegative ? 'error' : 'default'}
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Suggested Settlements */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Suggested Settlements (Minimizing Cash Flow)
                </Typography>
                <Chip label="Optimal Transfers" size="small" color="primary" variant="outlined" />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Recommendations to settle all member balances with the fewest transactions.
              </Typography>

              {settlementSuggestions.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <CheckCircleOutlineIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle2" fontWeight={700}>
                    All balances are settled!
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    No companion owes any money to another member.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {settlementSuggestions.map((s, idx) => {
                    const payerMember = members.find((m) => m.user?._id === s.payer);
                    const receiverMember = members.find((m) => m.user?._id === s.receiver);

                    return (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            <strong>{payerMember?.user?.name || 'Member'}</strong> pays{' '}
                            <strong>{receiverMember?.user?.name || 'Member'}</strong>
                          </Typography>
                          <Typography variant="caption" color="secondary.main" fontWeight={800}>
                            {trip.currency} {s.amount.toFixed(2)}
                          </Typography>
                        </Box>

                        {canEdit && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<PaidIcon />}
                            onClick={() => {
                              setSelectedSettlementForRecord(s);
                              setSettlementDialogOpen(true);
                            }}
                          >
                            Record Payment
                          </Button>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Breakdown & Expense Table */}
      <Grid container spacing={3}>
        {pieData.length > 0 && (
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', p: 1 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Spending by Category
                </Typography>
                <Box sx={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${trip.currency} ${Number(value).toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={pieData.length > 0 ? 8 : 12}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Expense Records Ledger
              </Typography>

              {expenses.length === 0 ? (
                <EmptyState
                  title="No expenses logged yet"
                  description="Keep receipts, dining bills, and activity tickets recorded here for clear group splitting."
                  actionText={canEdit ? 'Log First Expense' : undefined}
                  onAction={() => setExpenseDialogOpen(true)}
                />
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mt: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Paid By</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Split Mode</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                        {canEdit && <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.map((exp) => (
                        <TableRow key={exp._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {exp.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(exp.expenseDate).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>{exp.payer?.name}</TableCell>
                          <TableCell>
                            <Chip label={exp.category} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" fontWeight={600}>
                              {exp.splitMethod} ({exp.shares?.length} shares)
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2" fontWeight={700}>
                              {exp.currency} {((exp.amountMinor || 0) / 100).toFixed(2)}
                            </Typography>
                          </TableCell>
                          {canEdit && (
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteExpense(exp._id)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Expense Modal */}
      <ExpenseDialog
        open={expenseDialogOpen}
        onClose={() => setExpenseDialogOpen(false)}
        onSubmit={handleCreateExpense}
        members={members}
        currency={trip.currency}
        currentUserId={currentUserId}
      />

      {/* Record Settlement Modal */}
      <RecordSettlementDialog
        open={settlementDialogOpen}
        onClose={() => {
          setSettlementDialogOpen(false);
          setSelectedSettlementForRecord(null);
        }}
        onSubmit={handleRecordSettlement}
        members={members}
        currency={trip.currency}
        initialPayerId={selectedSettlementForRecord?.payer}
        initialReceiverId={selectedSettlementForRecord?.receiver}
        initialAmount={selectedSettlementForRecord?.amount}
      />
    </Box>
  );
}

