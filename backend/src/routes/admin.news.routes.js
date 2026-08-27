import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { NewsController } from '../controllers/news.controller.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

const uploadDir = 'uploads/news/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer for news images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'news-' + uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const uploadImage = multer({ storage });

// Admin routes (require super_admin)
router.get('/', authenticateJWT, authorizeRoles('super_admin'), NewsController.listAdmin);
router.post('/', authenticateJWT, authorizeRoles('super_admin'), uploadImage.single('image'), NewsController.create);
router.get('/:id', authenticateJWT, authorizeRoles('super_admin'), NewsController.getById);
router.put('/:id', authenticateJWT, authorizeRoles('super_admin'), uploadImage.single('image'), NewsController.update);
router.delete('/:id', authenticateJWT, authorizeRoles('super_admin'), NewsController.delete);

export default router;
