import express from 'express';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateJWT);
router.use(authorizeRoles('super_admin', 'sub_admin'));

// ────────────────────────────────────────────────────────────────────────────────
// MASTER LANGUAGES
// ────────────────────────────────────────────────────────────────────────────────

router.get('/languages', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM master_languages ORDER BY sort_order ASC, name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/languages', async (req, res) => {
  const { name, code, is_active, sort_order } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Language name is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO master_languages (name, code, is_active, sort_order) VALUES (?, ?, ?, ?)',
      [name.trim(), code?.trim() || null, is_active ?? 1, sort_order || 0]
    );
    res.status(201).json({ id: result.insertId, name: name.trim(), code, is_active: is_active ?? 1 });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Language already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

router.put('/languages/:id', async (req, res) => {
  const { name, code, is_active, sort_order } = req.body;
  try {
    await pool.query(
      'UPDATE master_languages SET name = COALESCE(?, name), code = ?, is_active = COALESCE(?, is_active), sort_order = COALESCE(?, sort_order) WHERE id = ?',
      [name?.trim() || null, code?.trim() || null, is_active !== undefined ? (is_active ? 1 : 0) : null, sort_order ?? null, req.params.id]
    );
    res.json({ message: 'Language updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/languages/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM master_languages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Language deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ────────────────────────────────────────────────────────────────────────────────
// MASTER QUALIFICATIONS
// ────────────────────────────────────────────────────────────────────────────────

router.get('/qualifications', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM master_qualifications ORDER BY sort_order ASC, level_rank ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/qualifications', async (req, res) => {
  const { name, level_rank, is_active, sort_order } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Qualification name is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO master_qualifications (name, level_rank, is_active, sort_order) VALUES (?, ?, ?, ?)',
      [name.trim(), level_rank ?? 1, is_active ?? 1, sort_order || 0]
    );
    res.status(201).json({ id: result.insertId, name: name.trim(), level_rank: level_rank ?? 1 });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Qualification already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

router.put('/qualifications/:id', async (req, res) => {
  const { name, level_rank, is_active, sort_order } = req.body;
  try {
    await pool.query(
      'UPDATE master_qualifications SET name = COALESCE(?, name), level_rank = COALESCE(?, level_rank), is_active = COALESCE(?, is_active), sort_order = COALESCE(?, sort_order) WHERE id = ?',
      [name?.trim() || null, level_rank ?? null, is_active !== undefined ? (is_active ? 1 : 0) : null, sort_order ?? null, req.params.id]
    );
    res.json({ message: 'Qualification updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/qualifications/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM master_qualifications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Qualification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ────────────────────────────────────────────────────────────────────────────────
// MASTER NOTICE PERIODS (JOINING STATUS)
// ────────────────────────────────────────────────────────────────────────────────

router.get('/notice-periods', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM master_notice_periods ORDER BY sort_order ASC, name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/notice-periods', async (req, res) => {
  const { name, is_active, sort_order } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Notice period name is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO master_notice_periods (name, is_active, sort_order) VALUES (?, ?, ?)',
      [name.trim(), is_active ?? 1, sort_order || 0]
    );
    res.status(201).json({ id: result.insertId, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Notice period already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

router.put('/notice-periods/:id', async (req, res) => {
  const { name, is_active, sort_order } = req.body;
  try {
    await pool.query(
      'UPDATE master_notice_periods SET name = COALESCE(?, name), is_active = COALESCE(?, is_active), sort_order = COALESCE(?, sort_order) WHERE id = ?',
      [name?.trim() || null, is_active !== undefined ? (is_active ? 1 : 0) : null, sort_order ?? null, req.params.id]
    );
    res.json({ message: 'Notice period updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/notice-periods/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM master_notice_periods WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notice period deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
