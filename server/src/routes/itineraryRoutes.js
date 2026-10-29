import { Router } from 'express';
import {
  getTripItinerary,
  createDay,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
  optimizeDay,
  applyOptimizedOrder
} from '../controllers/itineraryController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeTrip } from '../middleware/tripAuth.js';
import { validateBody } from '../middleware/validate.js';
import {
  itineraryDaySchemaValidator,
  itineraryItemSchemaValidator,
  reorderItemsSchema
} from '../validators/schemas.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/:tripId/itinerary', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), getTripItinerary);
router.post('/:tripId/itinerary/days', authorizeTrip(['OWNER', 'EDITOR']), validateBody(itineraryDaySchemaValidator), createDay);
router.post('/:tripId/itinerary/items', authorizeTrip(['OWNER', 'EDITOR']), validateBody(itineraryItemSchemaValidator), createItem);
router.patch('/:tripId/itinerary/items/:itemId', authorizeTrip(['OWNER', 'EDITOR']), updateItem);
router.delete('/:tripId/itinerary/items/:itemId', authorizeTrip(['OWNER', 'EDITOR']), deleteItem);
router.post('/:tripId/itinerary/reorder', authorizeTrip(['OWNER', 'EDITOR']), validateBody(reorderItemsSchema), reorderItems);
router.post('/:tripId/itinerary/optimize', authorizeTrip(['OWNER', 'EDITOR']), optimizeDay);
router.post('/:tripId/itinerary/apply-optimize', authorizeTrip(['OWNER', 'EDITOR']), applyOptimizedOrder);

export default router;

