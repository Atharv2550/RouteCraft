import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Wishlist } from '../models/Wishlist.js';
import { Destination } from '../models/Destination.js';

export async function getProfile(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user.toSafeObject()
  });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, avatarUrl, preferredCurrency, timezone } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (preferredCurrency) user.preferredCurrency = preferredCurrency;
    if (timezone) user.timezone = timezone;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    next(err);
  }
}

export async function getWishlist(req, res, next) {
  try {
    const items = await Wishlist.find({ user: req.user._id })
      .populate('destination')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      wishlist: items
    });
  } catch (err) {
    next(err);
  }
}

export async function addToWishlist(req, res, next) {
  try {
    const { destinationId, notes } = req.body;
    if (!destinationId) {
      return res.status(400).json({ success: false, message: 'Destination ID is required' });
    }

    const dest = await Destination.findById(destinationId);
    if (!dest) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const item = await Wishlist.findOneAndUpdate(
      { user: req.user._id, destination: destinationId },
      { user: req.user._id, destination: destinationId, notes: notes || '' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('destination');

    return res.status(201).json({
      success: true,
      message: 'Destination added to wishlist',
      item
    });
  } catch (err) {
    next(err);
  }
}

export async function removeFromWishlist(req, res, next) {
  try {
    const { destinationId } = req.params;

    await Wishlist.findOneAndDelete({
      user: req.user._id,
      destination: destinationId
    });

    return res.status(200).json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (err) {
    next(err);
  }
}
