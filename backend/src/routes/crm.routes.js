import express from 'express';
import { CRMController } from '../controllers/crm.controller.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All CRM routes require authentication
router.use(authenticateJWT);
// Accessible by crm_agent and super_admin
router.use(authorizeRoles('crm_agent', 'super_admin'));

router.get('/agents', CRMController.getAgents);
router.get('/leads', CRMController.getLeads);
router.post('/leads', CRMController.createLead);
router.get('/leads/:id', CRMController.getLeadDetail);
router.put('/leads/:id', CRMController.updateLead);
router.patch('/leads/:id/status', CRMController.updateLeadStatus);
router.post('/leads/:id/activities', CRMController.addActivity);
router.post('/leads/:id/followup', CRMController.scheduleFollowup);
router.get('/followups', CRMController.getAllFollowups);
router.get('/followups/today', CRMController.getTodayFollowups);
router.patch('/followups/:id/complete', CRMController.completeFollowup);
router.get('/stats', CRMController.getCRMStats);
router.post('/leads/:id/convert', CRMController.convertLead);
router.delete('/leads/:id', CRMController.deleteLead);

export default router;
