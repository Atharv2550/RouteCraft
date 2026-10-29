import { Router } from 'express';
import { getVotes, createProposal, toggleVote, closeVote } from '../controllers/voteController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeTrip } from '../middleware/tripAuth.js';
import { validateBody } from '../middleware/validate.js';
import { voteProposalSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/trips/:tripId/votes', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), getVotes);
router.post('/trips/:tripId/votes', authorizeTrip(['OWNER', 'EDITOR']), validateBody(voteProposalSchema), createProposal);
router.post('/trips/:tripId/votes/:voteId/toggle', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), toggleVote);
router.post('/trips/:tripId/votes/:voteId/close', authorizeTrip(['OWNER', 'EDITOR']), closeVote);

export default router;

