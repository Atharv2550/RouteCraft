import { Router } from 'express';
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  duplicateTrip
} from '../controllers/tripController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeTrip } from '../middleware/tripAuth.js';
import { validateBody } from '../middleware/validate.js';
import { tripSchemaValidator } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', getTrips);
router.post('/', validateBody(tripSchemaValidator), createTrip);
router.get('/:tripId', getTripById);
router.patch('/:tripId', authorizeTrip(['OWNER', 'EDITOR']), updateTrip);
router.delete('/:tripId', authorizeTrip(['OWNER']), deleteTrip);
router.post('/:tripId/duplicate', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), duplicateTrip);

export default router;

