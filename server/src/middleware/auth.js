import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

export async function authenticate(req, res, next) {
  try {
    let token = null;

    // Check HttpOnly cookie
    if (req.cookies && req.cookies.rc_token) {
      token = req.cookies.rc_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.accountStatus !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'User account not found or suspended.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
