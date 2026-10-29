import { Router } from 'express';
import { getComments, createComment, deleteComment } from '../controllers/commentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeTrip } from '../middleware/tripAuth.js';
import { validateBody } from '../middleware/validate.js';
import { commentSchemaValidator } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/trips/:tripId/comments', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), getComments);
router.post('/trips/:tripId/comments', authorizeTrip(['OWNER', 'EDITOR']), validateBody(commentSchemaValidator), createComment);
router.delete('/trips/:tripId/comments/:commentId', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), deleteComment);

export default router;

