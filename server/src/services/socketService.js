import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { Trip } from '../models/Trip.js';
import { TripMember } from '../models/TripMember.js';
import { logger } from '../utils/logger.js';

let ioInstance = null;

export function initSocketIO(httpServer, clientUrl) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: clientUrl || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Socket authentication middleware
  ioInstance.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid or expired socket credentials'));
    }
  });

  ioInstance.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id} (User: ${socket.user.name})`);

    // Handle joining a trip room with server-side authorization check
    socket.on('join:trip', async (tripId) => {
      try {
        if (!tripId) return;

        const trip = await Trip.findById(tripId);
        if (!trip) {
          return socket.emit('error', { message: 'Trip not found' });
        }

        const isOwner = trip.owner.toString() === socket.user._id.toString();
        const isMember = isOwner || await TripMember.exists({
          trip: tripId,
          user: socket.user._id,
          status: 'ACTIVE'
        });

        if (!isMember) {
          return socket.emit('error', { message: 'Unauthorized: You are not a member of this trip' });
        }

        const room = `trip:${tripId}`;
        socket.join(room);
        logger.debug(`User ${socket.user.name} joined room ${room}`);

        socket.to(room).emit('user:joined', {
          userId: socket.user._id,
          name: socket.user.name,
          avatarUrl: socket.user.avatarUrl
        });
      } catch (err) {
        logger.error(`Error joining trip room: ${err.message}`);
      }
    });

    socket.on('leave:trip', (tripId) => {
      if (tripId) {
        const room = `trip:${tripId}`;
        socket.leave(room);
        logger.debug(`User ${socket.user.name} left room ${room}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

export function emitToTrip(tripId, event, data) {
  if (ioInstance) {
    ioInstance.to(`trip:${tripId}`).emit(event, data);
  }
}

export function getIO() {
  return ioInstance;
}
