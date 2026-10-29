import { Router } from 'express';
import {
  getSettlements,
  recordSettlement,
  updateSettlementStatus
} from '../controllers/settlementController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeTrip } from '../middleware/tripAuth.js';
import { validateBody } from '../middleware/validate.js';
import { settlementSchemaValidator } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/trips/:tripId/settlements', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), getSettlements);
router.post('/trips/:tripId/settlements', authorizeTrip(['OWNER', 'EDITOR']), validateBody(settlementSchemaValidator), recordSettlement);
router.patch('/trips/:tripId/settlements/:settlementId', authorizeTrip(['OWNER', 'EDITOR']), updateSettlementStatus);

export default router;

