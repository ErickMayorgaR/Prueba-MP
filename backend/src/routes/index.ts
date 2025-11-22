import { Router, Request, Response } from 'express'; // ← AGREGADO Request, Response
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import expedienteRoutes from './expediente.routes';
import indicioRoutes from './indicio.routes';
import statsRoutes from './stats.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/expedientes', expedienteRoutes);
router.use('/indicios', indicioRoutes);
router.use('/stats', statsRoutes);

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;