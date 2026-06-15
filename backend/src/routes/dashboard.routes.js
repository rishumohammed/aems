import express from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/counts', DashboardController.getGlobalCounts);
router.get('/admin-master', authorizeRoles('super_admin'), DashboardController.getAdminMasterStats);

export default router;
