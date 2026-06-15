import express from 'express';
import { FormController } from '../controllers/form.controller.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Admin only routes
router.use(authenticateJWT);
router.use(authorizeRoles('super_admin'));

router.post('/', FormController.createConfig);
router.put('/:id', FormController.updateConfig);
router.get('/:id', FormController.getConfig);
router.get('/', FormController.listConfigs);

export default router;
