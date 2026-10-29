import { Router } from 'express';
import {
  getExpensesAndBudget,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expenseController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeTrip } from '../middleware/tripAuth.js';
import { validateBody } from '../middleware/validate.js';
import { expenseSchemaValidator } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/trips/:tripId/expenses', authorizeTrip(['OWNER', 'EDITOR', 'VIEWER']), getExpensesAndBudget);
router.post('/trips/:tripId/expenses', authorizeTrip(['OWNER', 'EDITOR']), validateBody(expenseSchemaValidator), createExpense);
router.patch('/trips/:tripId/expenses/:expenseId', authorizeTrip(['OWNER', 'EDITOR']), updateExpense);
router.delete('/trips/:tripId/expenses/:expenseId', authorizeTrip(['OWNER', 'EDITOR']), deleteExpense);

export default router;

