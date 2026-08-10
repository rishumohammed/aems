import express from 'express';
import { NewsController } from '../controllers/news.controller.js';

const router = express.Router();

router.get('/', NewsController.listPublic);
router.get('/:slug', NewsController.getBySlug);

export default router;
