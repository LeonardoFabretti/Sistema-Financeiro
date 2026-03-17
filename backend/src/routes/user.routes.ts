/**
 * User Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as userController from '../controllers/user.controller';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.delete('/account', userController.deleteAccount);
router.get('/sessions', userController.getSessions);
router.delete('/sessions/:id', userController.deleteSession);

export default router;
