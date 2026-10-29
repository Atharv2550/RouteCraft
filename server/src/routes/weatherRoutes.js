import { Router } from 'express';
import { getTripWeather } from '../controllers/weatherController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeTrip } from '../middleware/tripAuth.js';

const router = Router();

router.use(authenticate);

router.get('/trips/:tripId/weather', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), getTripWeather);

export default router;

