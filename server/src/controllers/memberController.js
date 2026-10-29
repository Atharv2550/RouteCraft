import crypto from 'crypto';
import { TripMember } from '../models/TripMember.js';
import { User } from '../models/User.js';
import { logActivityAndNotify } from '../services/activityLogger.js';
import { emitToTrip } from '../services/socketService.js';

export async function getTripMembers(req, res, next) {
  try {
    const trip = req.trip;

    const members = await TripMember.find({ trip: trip._id })
      .populate('user', 'name email avatarUrl')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      members
    });
  } catch (err) {
    next(err);
  }
}

export async function inviteMember(req, res, next) {
  try {
    const trip = req.trip;
    const { email, role = 'VIEWER' } = req.body;

    // Check if target user already exists
    const existingUser = await User.findOne({ email });

    // Check if member already in trip
    const existingMembership = await TripMember.findOne({
      trip: trip._id,
      $or: [
        { invitedEmail: email },
        ...(existingUser ? [{ user: existingUser._id }] : [])
      ]
    });

    if (existingMembership) {
      if (existingMembership.status === 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'User is already an active member of this trip'
        });
      }
      // If already invited, regenerate token
    }

    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    let membership;
    if (existingMembership) {
      existingMembership.invitationToken = invitationToken;
      existingMembership.invitationExpiresAt = invitationExpiresAt;
      existingMembership.role = role;
      existingMembership.status = 'INVITED';
      await existingMembership.save();
      membership = existingMembership;
    } else {
      membership = await TripMember.create({
        trip: trip._id,
        user: existingUser ? existingUser._id : null,
        invitedEmail: email,
        role,
        status: 'INVITED',
        invitationToken,
        invitationExpiresAt
      });
    }

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'MEMBER_INVITED',
      resourceType: 'MEMBER',
      resourceId: membership._id,
      summary: `${req.user.name} invited ${email} to the trip as ${role}.`,
      notificationTitle: 'Trip Invitation Sent'
    });

    return res.status(201).json({
      success: true,
      message: 'Invitation generated successfully',
      invitationToken,
      invitationLink: `/invite/${invitationToken}`,
      member: membership
    });
  } catch (err) {
    next(err);
  }
}

export async function acceptInvitation(req, res, next) {
  try {
    const { token } = req.params;

    const membership = await TripMember.findOne({
      invitationToken: token,
      status: 'INVITED',
      invitationExpiresAt: { $gt: new Date() }
    }).populate('trip');

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation token'
      });
    }

    membership.user = req.user._id;
    membership.status = 'ACTIVE';
    membership.joinedAt = new Date();
    membership.invitationToken = null; // Clear single-use token
    await membership.save();

    await logActivityAndNotify({
      tripId: membership.trip._id,
      actor: req.user,
      action: 'MEMBER_JOINED',
      resourceType: 'MEMBER',
      resourceId: membership._id,
      summary: `${req.user.name} accepted the invitation and joined the trip.`,
      notificationTitle: 'New Companion Joined!'
    });

    emitToTrip(membership.trip._id, 'member:joined', {
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl
      },
      role: membership.role
    });

    return res.status(200).json({
      success: true,
      message: 'You have successfully joined the trip!',
      trip: membership.trip
    });
  } catch (err) {
    next(err);
  }
}

export async function rejectInvitation(req, res, next) {
  try {
    const { token } = req.params;

    const membership = await TripMember.findOne({
      invitationToken: token,
      status: 'INVITED'
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    membership.status = 'DECLINED';
    membership.invitationToken = null;
    await membership.save();

    return res.status(200).json({
      success: true,
      message: 'Invitation declined'
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMemberRole(req, res, next) {
  try {
    const trip = req.trip;
    const { memberId } = req.params;
    const { role } = req.body;

    // Only owner can update roles
    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only trip owner can change member roles' });
    }

    const member = await TripMember.findOne({ _id: memberId, trip: trip._id }).populate('user');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Trip member not found' });
    }

    if (member.role === 'OWNER') {
      return res.status(400).json({ success: false, message: 'Cannot modify the owner role' });
    }

    member.role = role;
    await member.save();

    emitToTrip(trip._id, 'member:updated', member);

    return res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      member
    });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req, res, next) {
  try {
    const trip = req.trip;
    const { memberId } = req.params;
    const currentUserId = req.user._id.toString();

    const member = await TripMember.findOne({ _id: memberId, trip: trip._id });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const isOwner = trip.owner.toString() === currentUserId;
    const isSelf = member.user && member.user.toString() === currentUserId;

    if (!isOwner && !isSelf) {
      return res.status(403).json({ success: false, message: 'Unauthorized to remove this member' });
    }

    if (member.role === 'OWNER') {
      return res.status(400).json({ success: false, message: 'Trip owner cannot be removed' });
    }

    await TripMember.findByIdAndDelete(memberId);

    await logActivityAndNotify({
      tripId: trip._id,
      actor: req.user,
      action: 'MEMBER_REMOVED',
      resourceType: 'MEMBER',
      summary: `${req.user.name} removed a member from the trip.`
    });

    emitToTrip(trip._id, 'member:removed', { memberId });

    return res.status(200).json({
      success: true,
      message: 'Member removed from trip'
    });
  } catch (err) {
    next(err);
  }
}
