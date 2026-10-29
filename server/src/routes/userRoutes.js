import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.patch('/me', validateBody(updateProfileSchema), updateProfile);
router.patch('/me/password', validateBody(changePasswordSchema), changePassword);

router.get('/me/wishlist', getWishlist);
router.post('/me/wishlist', addToWishlist);
router.delete('/me/wishlist/:destinationId', removeFromWishlist);

export default router;

