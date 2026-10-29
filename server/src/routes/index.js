import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import destinationRoutes from './destinationRoutes.js';
import tripRoutes from './tripRoutes.js';
import itineraryRoutes from './itineraryRoutes.js';
import memberRoutes from './memberRoutes.js';
import commentRoutes from './commentRoutes.js';
import voteRoutes from './voteRoutes.js';
import expenseRoutes from './expenseRoutes.js';
import settlementRoutes from './settlementRoutes.js';
import reservationRoutes from './reservationRoutes.js';
import weatherRoutes from './weatherRoutes.js';
import exportRoutes from './exportRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/destinations', destinationRoutes);
apiRouter.use('/trips', tripRoutes);
apiRouter.use('/trips', itineraryRoutes);
apiRouter.use('/', memberRoutes);
apiRouter.use('/', commentRoutes);
apiRouter.use('/', voteRoutes);
apiRouter.use('/', expenseRoutes);
apiRouter.use('/', settlementRoutes);
apiRouter.use('/', reservationRoutes);
apiRouter.use('/', weatherRoutes);
apiRouter.use('/', exportRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

export default apiRouter;

