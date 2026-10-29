import { Settlement } from '../models/Settlement.js';
import { toMinorUnits } from '../utils/moneyMath.js';
import { logActivityAndNotify } from '../services/activityLogger.js';
import { emitToTrip } from '../services/socketService.js';

export async function getSettlements(req, res, next) {
  try {
    const trip = req.trip;

    const settlements = await Settlement.find({ trip: trip._id })
      .populate('payer', 'name avatarUrl email')
      .populate('receiver', 'name avatarUrl email')
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      settlements
    });
  } catch (err) {
    next(err);
  }
}

export async function recordSettlement(req, res, next) {
  try {
    const trip = req.trip;
    const { payerId, receiverId, amount, currency, notes } = req.body;

    const amountMinor = toMinorUnits(amount);
    if (amountMinor <= 0) {
      return res.status(400).json({ success: false, message: 'Settlement amount must be positive' });
    }

    if (payerId === receiverId) {
      return res.status(400).json({ success: false, message: 'Payer and receiver cannot be the same member' });
    }

    const settlement = await Settlement.create({
      trip: trip._id,
      payer: payerId,
      receiver: receiverId,
      amountMinor,
      currency: currency || trip.currency || 'USD',
      status: 'RECORDED',
      notes: notes || '',
      recordedBy: req.user._id,
      completedAt: new Date()
    });

    const populated = await Settlement.findById(settlement._id)
      .populate('payer', 'name avatarUrl email')
      .populate('receiver', 'name avatarUrl email')
      .populate('recordedBy', 'name');

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'SETTLEMENT_RECORDED',
      resourceType: 'SETTLEMENT',
      resourceId: settlement._id,
      summary: `${req.user.name} recorded a settlement payment of ${trip.currency} ${amount.toFixed(2)} from ${populated.payer.name} to ${populated.receiver.name}.`,
      notificationTitle: 'Settlement Recorded'
    });

    emitToTrip(trip._id, 'settlement:recorded', populated);

    return res.status(201).json({
      success: true,
      message: 'Settlement recorded successfully',
      settlement: populated
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSettlementStatus(req, res, next) {
  try {
    const trip = req.trip;
    const { settlementId } = req.params;
    const { status, notes } = req.body;

    const settlement = await Settlement.findOne({ _id: settlementId, trip: trip._id });
    if (!settlement) {
      return res.status(404).json({ success: false, message: 'Settlement not found' });
    }

    if (status) settlement.status = status;
    if (notes !== undefined) settlement.notes = notes;
    if (status === 'COMPLETED' && !settlement.completedAt) {
      settlement.completedAt = new Date();
    }

    await settlement.save();

    const populated = await Settlement.findById(settlement._id)
      .populate('payer', 'name avatarUrl email')
      .populate('receiver', 'name avatarUrl email');

    emitToTrip(trip._id, 'settlement:updated', populated);

    return res.status(200).json({
      success: true,
      message: 'Settlement updated successfully',
      settlement: populated
    });
  } catch (err) {
    next(err);
  }
}
