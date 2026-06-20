import express from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateJWT);

router.get('/counts', DashboardController.getGlobalCounts);
router.get('/admin-master', authorizeRoles('super_admin', 'sub_admin', 'lms_user', 'placement_coordinator', 'finance_staff'), DashboardController.getAdminMasterStats);
router.get('/placement-stats', authorizeRoles('super_admin', 'placement_coordinator'), DashboardController.getPlacementDashboardStats);
router.get('/lms-stats', authorizeRoles('super_admin', 'lms_user'), DashboardController.getLmsDashboardStats);

export default router;
