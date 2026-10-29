import { Router } from 'express';
import {
  getTripMembers,
  inviteMember,
  acceptInvitation,
  rejectInvitation,
  updateMemberRole,
  removeMember
} from '../controllers/memberController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeTrip } from '../middleware/tripAuth.js';
import { validateBody } from '../middleware/validate.js';
import { inviteMemberSchema, updateMemberRoleSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

// Public invitation acceptance/rejection (authenticated user accepts an invite token)
router.post('/invitations/:token/accept', acceptInvitation);
router.post('/invitations/:token/reject', rejectInvitation);

// Trip membership routes
router.get('/trips/:tripId/members', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), getTripMembers);
router.post('/trips/:tripId/invitations', authorizeTrip(['OWNER', 'EDITOR']), validateBody(inviteMemberSchema), inviteMember);
router.patch('/trips/:tripId/members/:memberId', authorizeTrip(['OWNER']), validateBody(updateMemberRoleSchema), updateMemberRole);
router.delete('/trips/:tripId/members/:memberId', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), removeMember);

export default router;

