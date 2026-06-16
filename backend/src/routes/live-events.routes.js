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
const isHost = authorizeRoles(USER_ROLES.TUTOR, USER_ROLES.SUPER_ADMIN);

// PUBLIC: Get all upcoming/live events
router.get('/', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, u.name as host_name 
      FROM live_events e
      JOIN users u ON e.host_id = u.id
      WHERE e.status IN ('upcoming', 'live')
      ORDER BY e.scheduled_at ASC
    `);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TUTOR/ADMIN: Get their own events (or all for admin)
router.get('/manage', authenticateJWT, isHost, async (req, res) => {
  try {
    let query = `
      SELECT e.*, u.name as host_name 
      FROM live_events e
      JOIN users u ON e.host_id = u.id
    `;
    const params = [];

    if (req.user.role === USER_ROLES.TUTOR) {
      query += ` WHERE e.host_id = ?`;
      params.push(req.user.id);
    }
    
    query += ` ORDER BY e.scheduled_at DESC`;
    
    const [events] = await pool.query(query, params);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TUTOR/ADMIN: Create new event
router.post('/manage', authenticateJWT, isHost, upload.single('thumbnail'), async (req, res) => {
  const { title, description, scheduled_at, duration_minutes, meet_link } = req.body;
  const id = uuidv4();
  const host_id = req.user.id;
  const thumbnail_url = req.file ? `/uploads/thumbnails/${req.file.filename}` : null;

  try {
    await pool.query(
      `INSERT INTO live_events (id, title, description, thumbnail_url, scheduled_at, duration_minutes, meet_link, host_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description || null, thumbnail_url, scheduled_at, duration_minutes || 60, meet_link, host_id]
    );
    res.status(201).json({ id, message: 'Live event created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TUTOR/ADMIN: Update event
router.put('/manage/:id', authenticateJWT, isHost, upload.single('thumbnail'), async (req, res) => {
  const { title, description, scheduled_at, duration_minutes, meet_link, status } = req.body;
  const eventId = req.params.id;
  
  try {
    // Check ownership
    if (req.user.role === USER_ROLES.TUTOR) {
      const [check] = await pool.query('SELECT id FROM live_events WHERE id = ? AND host_id = ?', [eventId, req.user.id]);
      if (check.length === 0) return res.status(403).json({ message: 'Forbidden' });
    }

    const fields = ['title', 'description', 'scheduled_at', 'duration_minutes', 'meet_link', 'status'];
    let updateStr = fields.filter(f => req.body[f] !== undefined).map(f => `${f} = ?`).join(', ');
    let values = fields.filter(f => req.body[f] !== undefined).map(f => req.body[f]);

    if (req.file) {
      updateStr += (updateStr ? ', ' : '') + 'thumbnail_url = ?';
      values.push(`/uploads/thumbnails/${req.file.filename}`);
    }

    if (updateStr) {
      await pool.query(`UPDATE live_events SET ${updateStr} WHERE id = ?`, [...values, eventId]);
    }
    
    res.json({ message: 'Live event updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TUTOR/ADMIN: Delete event
router.delete('/manage/:id', authenticateJWT, isHost, async (req, res) => {
  try {
    if (req.user.role === USER_ROLES.TUTOR) {
      const [check] = await pool.query('SELECT id FROM live_events WHERE id = ? AND host_id = ?', [req.params.id, req.user.id]);
      if (check.length === 0) return res.status(403).json({ message: 'Forbidden' });
    }
    await pool.query('DELETE FROM live_events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Live event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
