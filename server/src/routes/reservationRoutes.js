import { Router } from 'express';
import {
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation
} from '../controllers/reservationController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeTrip } from '../middleware/tripAuth.js';
import { validateBody } from '../middleware/validate.js';
import { reservationSchemaValidator } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/trips/:tripId/reservations', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), getReservations);
router.post('/trips/:tripId/reservations', authorizeTrip(['OWNER', 'EDITOR']), validateBody(reservationSchemaValidator), createReservation);
router.patch('/trips/:tripId/reservations/:reservationId', authorizeTrip(['OWNER', 'EDITOR']), updateReservation);
router.delete('/trips/:tripId/reservations/:reservationId', authorizeTrip(['OWNER', 'EDITOR']), deleteReservation);

export default router;

