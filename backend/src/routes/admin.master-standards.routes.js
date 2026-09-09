import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getStandards, createStandard, updateStandard, deleteStandard } from '../controllers/admin.master-standards.controller.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/standards';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.use(authenticateJWT);
router.use(authorizeRoles('super_admin'));

router.get('/', getStandards);
router.post('/', createStandard);
router.put('/:id', updateStandard);
router.delete('/:id', deleteStandard);

router.post('/upload-banner', upload.single('banner'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const url = `/uploads/standards/${req.file.filename}`;
  res.json({ url, message: 'Banner uploaded successfully' });
});

export default router;
