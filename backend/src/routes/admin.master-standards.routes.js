import express from 'express';
import { getStandards, createStandard, updateStandard, deleteStandard } from '../controllers/admin.master-standards.controller.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateJWT);
router.use(authorizeRoles('super_admin'));

router.get('/', getStandards);
router.post('/', createStandard);
router.put('/:id', updateStandard);
router.delete('/:id', deleteStandard);

export default router;
