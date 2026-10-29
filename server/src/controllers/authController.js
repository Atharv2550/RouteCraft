import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { config } from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export async function register(req, res, next) {
  try {
    const { name, email, password, preferredCurrency } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      preferredCurrency: preferredCurrency || 'USD'
    });

    const token = signToken({ userId: user._id });

    res.cookie('rc_token', token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.accountStatus !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account is suspended. Please contact support.'
      });
    }

    const token = signToken({ userId: user._id });

    res.cookie('rc_token', token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('rc_token', {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax'
  });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}

export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user.toSafeObject()
  });
}
