import { Expense } from '../models/Expense.js';
import { Settlement } from '../models/Settlement.js';
import { TripMember } from '../models/TripMember.js';
import {
  toMinorUnits,
  toMajorUnits,
  splitEqually,
  splitByPercentages,
  calculateNetBalances,
  generateSettlementSuggestions
} from '../utils/moneyMath.js';
import { logActivityAndNotify } from '../services/activityLogger.js';
import { emitToTrip } from '../services/socketService.js';

export async function getExpensesAndBudget(req, res, next) {
  try {
    const trip = req.trip;

    const [expenses, settlements, members] = await Promise.all([
      Expense.find({ trip: trip._id })
        .populate('payer', 'name avatarUrl email')
        .populate('shares.user', 'name avatarUrl email')
        .sort({ expenseDate: -1 }),
      Settlement.find({ trip: trip._id })
        .populate('payer', 'name avatarUrl email')
        .populate('receiver', 'name avatarUrl email'),
      TripMember.find({ trip: trip._id, status: 'ACTIVE' })
        .populate('user', 'name avatarUrl email')
    ]);

    // Active members list for balances
    const allMembers = members.map((m) => m.user).filter(Boolean);

    // Calculate Net Balances
    const netBalancesMap = calculateNetBalances(expenses, settlements, allMembers);

    // Calculate optimal settlement suggestions
    const settlementSuggestions = generateSettlementSuggestions(netBalancesMap);

    // Spending metrics
    let totalSpentMinor = 0;
    const categoryTotals = {};

    expenses.forEach((e) => {
      totalSpentMinor += e.amountMinor;
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + toMajorUnits(e.amountMinor);
    });

    const totalBudgetMajor = toMajorUnits(trip.totalBudgetMinor || 0);
    const totalSpentMajor = toMajorUnits(totalSpentMinor);
    const budgetRemainingMajor = parseFloat((totalBudgetMajor - totalSpentMajor).toFixed(2));

    // Convert net balances map to clean array for frontend
    const netBalancesArray = [];
    allMembers.forEach((m) => {
      const uId = m._id.toString();
      const balMinor = netBalancesMap.get(uId) || 0;
      netBalancesArray.push({
        user: {
          _id: m._id,
          name: m.name,
          email: m.email,
          avatarUrl: m.avatarUrl
        },
        netBalance: toMajorUnits(balMinor),
        netBalanceMinor: balMinor
      });
    });

    return res.status(200).json({
      success: true,
      currency: trip.currency,
      totalBudget: totalBudgetMajor,
      totalSpent: totalSpentMajor,
      budgetRemaining: budgetRemainingMajor,
      categoryTotals,
      expenses,
      settlements,
      netBalances: netBalancesArray,
      settlementSuggestions
    });
  } catch (err) {
    next(err);
  }
}

export async function createExpense(req, res, next) {
  try {
    const trip = req.trip;
    const {
      title,
      description,
      amount,
      currency,
      category,
      payerId,
      expenseDate,
      splitMethod = 'EQUAL',
      shares = [],
      notes
    } = req.body;

    const totalMinor = toMinorUnits(amount);

    if (totalMinor <= 0) {
      return res.status(400).json({ success: false, message: 'Expense amount must be greater than zero' });
    }

    let calculatedShares = [];

    if (splitMethod === 'EQUAL') {
      const participantCount = shares.length;
      if (participantCount === 0) {
        return res.status(400).json({ success: false, message: 'At least one participant is required' });
      }
      const splitAmounts = splitEqually(totalMinor, participantCount);
      calculatedShares = shares.map((s, idx) => ({
        user: s.userId,
        amountMinor: splitAmounts[idx],
        percentage: parseFloat((100 / participantCount).toFixed(2))
      }));
    } else if (splitMethod === 'EXACT') {
      let sumMinor = 0;
      calculatedShares = shares.map((s) => {
        const m = toMinorUnits(s.amount || 0);
        sumMinor += m;
        return {
          user: s.userId,
          amountMinor: m,
          percentage: totalMinor > 0 ? parseFloat(((m / totalMinor) * 100).toFixed(2)) : 0
        };
      });

      if (sumMinor !== totalMinor) {
        return res.status(400).json({
          success: false,
          message: `The sum of shares (${toMajorUnits(sumMinor)}) does not match the expense total (${toMajorUnits(totalMinor)}).`
        });
      }
    } else if (splitMethod === 'PERCENTAGE') {
      const percentages = shares.map((s) => s.percentage || 0);
      const totalPct = percentages.reduce((a, b) => a + b, 0);

      if (Math.abs(totalPct - 100) > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Percentages must add up to 100% (currently ${totalPct}%).`
        });
      }

      const splitAmounts = splitByPercentages(totalMinor, percentages);
      calculatedShares = shares.map((s, idx) => ({
        user: s.userId,
        amountMinor: splitAmounts[idx],
        percentage: s.percentage
      }));
    }

    const expense = await Expense.create({
      trip: trip._id,
      title,
      description: description || '',
      amountMinor: totalMinor,
      currency: currency || trip.currency || 'USD',
      category: category || 'other',
      payer: payerId,
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      splitMethod,
      shares: calculatedShares,
      notes: notes || '',
      createdBy: req.user._id
    });

    const populated = await Expense.findById(expense._id)
      .populate('payer', 'name avatarUrl email')
      .populate('shares.user', 'name avatarUrl email');

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'EXPENSE_ADDED',
      resourceType: 'EXPENSE',
      resourceId: expense._id,
      summary: `${req.user.name} logged an expense: "${title}" (${trip.currency} ${amount.toFixed(2)}).`,
      notificationTitle: 'New Trip Expense'
    });

    emitToTrip(trip._id, 'expense:created', populated);

    return res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      expense: populated
    });
  } catch (err) {
    next(err);
  }
}

export async function updateExpense(req, res, next) {
  try {
    const trip = req.trip;
    const { expenseId } = req.params;

    const expense = await Expense.findOne({ _id: expenseId, trip: trip._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const {
      title,
      description,
      amount,
      currency,
      category,
      payerId,
      expenseDate,
      splitMethod = expense.splitMethod,
      shares = [],
      notes
    } = req.body;

    const totalMinor = amount !== undefined ? toMinorUnits(amount) : expense.amountMinor;

    if (totalMinor <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
    }

    let calculatedShares = expense.shares;

    if (shares.length > 0) {
      if (splitMethod === 'EQUAL') {
        const splitAmounts = splitEqually(totalMinor, shares.length);
        calculatedShares = shares.map((s, idx) => ({
          user: s.userId,
          amountMinor: splitAmounts[idx],
          percentage: parseFloat((100 / shares.length).toFixed(2))
        }));
      } else if (splitMethod === 'EXACT') {
        let sumMinor = 0;
        calculatedShares = shares.map((s) => {
          const m = toMinorUnits(s.amount || 0);
          sumMinor += m;
          return {
            user: s.userId,
            amountMinor: m,
            percentage: parseFloat(((m / totalMinor) * 100).toFixed(2))
          };
        });

        if (sumMinor !== totalMinor) {
          return res.status(400).json({
            success: false,
            message: `The sum of shares does not match total amount.`
          });
        }
      } else if (splitMethod === 'PERCENTAGE') {
        const percentages = shares.map((s) => s.percentage || 0);
        const splitAmounts = splitByPercentages(totalMinor, percentages);
        calculatedShares = shares.map((s, idx) => ({
          user: s.userId,
          amountMinor: splitAmounts[idx],
          percentage: s.percentage
        }));
      }
    }

    if (title !== undefined) expense.title = title;
    if (description !== undefined) expense.description = description;
    expense.amountMinor = totalMinor;
    if (currency !== undefined) expense.currency = currency;
    if (category !== undefined) expense.category = category;
    if (payerId !== undefined) expense.payer = payerId;
    if (expenseDate !== undefined) expense.expenseDate = new Date(expenseDate);
    expense.splitMethod = splitMethod;
    expense.shares = calculatedShares;
    if (notes !== undefined) expense.notes = notes;

    await expense.save();

    const populated = await Expense.findById(expense._id)
      .populate('payer', 'name avatarUrl email')
      .populate('shares.user', 'name avatarUrl email');

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'EXPENSE_UPDATED',
      resourceType: 'EXPENSE',
      resourceId: expense._id,
      summary: `${req.user.name} updated expense "${expense.title}".`,
      notificationTitle: 'Expense Updated'
    });

    emitToTrip(trip._id, 'expense:updated', populated);

    return res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      expense: populated
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteExpense(req, res, next) {
  try {
    const trip = req.trip;
    const { expenseId } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: expenseId, trip: trip._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'EXPENSE_DELETED',
      resourceType: 'EXPENSE',
      resourceId: expense._id,
      summary: `${req.user.name} deleted expense "${expense.title}".`,
      notificationTitle: 'Expense Removed'
    });

    emitToTrip(trip._id, 'expense:deleted', { expenseId });

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
