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
    const uploadPath = 'uploads/notice_board';
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
const isAdmin = authorizeRoles(USER_ROLES.SUPER_ADMIN);

// PUBLIC: Get active notice board items
router.get('/', async (req, res) => {
  try {
    const [notices] = await pool.query(`
      SELECT * FROM notice_board
      WHERE is_active = 1 AND event_date >= NOW()
      ORDER BY event_date ASC
    `);
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Get all notice board items (including inactive/past)
router.get('/manage', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const [notices] = await pool.query('SELECT * FROM notice_board ORDER BY event_date DESC');
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Create new notice
router.post('/manage', authenticateJWT, isAdmin, upload.single('image'), async (req, res) => {
  const { title, event_date, event_type, link, is_active } = req.body;
  const id = uuidv4();
  const image_url = req.file ? `/uploads/notice_board/${req.file.filename}` : null;
  const isActive = is_active === 'true' || is_active === true || is_active === 1;

  try {
    await pool.query(
      `INSERT INTO notice_board (id, title, event_date, event_type, link, image_url, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, title, event_date, event_type, link || null, image_url, isActive]
    );
    res.status(201).json({ id, message: 'Notice created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Update notice
router.put('/manage/:id', authenticateJWT, isAdmin, upload.single('image'), async (req, res) => {
  const { title, event_date, event_type, link, is_active } = req.body;
  const noticeId = req.params.id;
  const isActive = is_active === 'true' || is_active === true || is_active === 1 || is_active === '1';
  
  try {
    const fields = ['title', 'event_date', 'event_type', 'link', 'is_active'];
    let updateStr = fields.filter(f => req.body[f] !== undefined).map(f => `${f} = ?`).join(', ');
    
    let values = [];
    if (req.body.title !== undefined) values.push(title);
    if (req.body.event_date !== undefined) values.push(event_date);
    if (req.body.event_type !== undefined) values.push(event_type);
    if (req.body.link !== undefined) values.push(link || null);
    if (req.body.is_active !== undefined) values.push(isActive);

    if (req.file) {
      updateStr += (updateStr ? ', ' : '') + 'image_url = ?';
      values.push(`/uploads/notice_board/${req.file.filename}`);
    }

    if (updateStr) {
      await pool.query(`UPDATE notice_board SET ${updateStr} WHERE id = ?`, [...values, noticeId]);
    }
    
    res.json({ message: 'Notice updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN: Delete notice
router.delete('/manage/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM notice_board WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
