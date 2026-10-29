import { Router } from 'express';
import { exportItineraryPdf, exportExpensesPdf } from '../controllers/exportController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeTrip } from '../middleware/tripAuth.js';

const router = Router();

router.use(authenticate);

router.get('/trips/:tripId/export/itinerary.pdf', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), exportItineraryPdf);
router.get('/trips/:tripId/export/expenses.pdf', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), exportExpensesPdf);

export default router;

