import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { USER_ROLES } from '@aems/shared';

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/thumbnails';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Role Gates
const isAdmin = authorizeRoles(USER_ROLES.SUPER_ADMIN, USER_ROLES.CRM_USER);

// PUBLIC: Get all highlights
router.get('/', async (req, res) => {
  try {
    const [highlights] = await pool.query(`
      SELECT * 
      FROM highlights
      ORDER BY created_at DESC
    `);
    res.json(highlights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Create new highlight
router.post('/manage', authenticateJWT, isAdmin, upload.single('thumbnail'), async (req, res) => {
  const { title, description } = req.body;
  const id = uuidv4();
  const image_url = req.file ? `/uploads/thumbnails/${req.file.filename}` : null;

  try {
    await pool.query(
      `INSERT INTO highlights (id, title, description, image_url) 
       VALUES (?, ?, ?, ?)`,
      [id, title, description || null, image_url]
    );
    res.status(201).json({ id, message: 'Highlight created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Update highlight
router.put('/manage/:id', authenticateJWT, isAdmin, upload.single('thumbnail'), async (req, res) => {
  const { title, description } = req.body;
  const highlightId = req.params.id;
  
  try {
    const fields = ['title', 'description'];
    let updateStr = fields.filter(f => req.body[f] !== undefined).map(f => `${f} = ?`).join(', ');
    let values = fields.filter(f => req.body[f] !== undefined).map(f => req.body[f]);

    if (req.file) {
      updateStr += (updateStr ? ', ' : '') + 'image_url = ?';
      values.push(`/uploads/thumbnails/${req.file.filename}`);
    }

    if (updateStr) {
      await pool.query(`UPDATE highlights SET ${updateStr} WHERE id = ?`, [...values, highlightId]);
    }
    
    res.json({ message: 'Highlight updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Delete highlight
router.delete('/manage/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM highlights WHERE id = ?', [req.params.id]);
    res.json({ message: 'Highlight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
