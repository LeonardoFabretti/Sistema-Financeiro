/**
 * Finance Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as financeController from '../controllers/finance.controller';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Meses financeiros
router.get('/months', financeController.getMonths);
router.get('/months/:year/:month', financeController.getMonth);
router.post('/months', financeController.createMonth);
router.put('/months/:id', financeController.updateMonth);
router.delete('/months/:id', financeController.deleteMonth);

// Backup/Export
router.post('/export', financeController.exportData);
router.post('/import', financeController.importData);

export default router;
