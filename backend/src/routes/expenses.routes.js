import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { pool } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const isAdmin = authorizeRoles('super_admin');

// Admin: List Expenses
router.get('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { month, category, type } = req.query;
    let query = 'SELECT * FROM expenses WHERE deleted_at IS NULL';
    const params = [];

    if (month) {
      query += ' AND DATE_FORMAT(date, "%Y-%m") = ?';
      params.push(month);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Expense Summary (Monthly totals by category)
router.get('/summary', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const [rows] = await pool.query(`
      SELECT 
        category,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE -amount END) as total
      FROM expenses
      WHERE deleted_at IS NULL AND DATE_FORMAT(date, "%Y-%m") = ?
      GROUP BY category
    `, [month || new Date().toISOString().slice(0, 7)]);
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Add Expense
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  const { category, amount, type, description, payment_mode, reference_number, date } = req.body;
  try {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO expenses (id, category, amount, type, description, payment_mode, reference_number, date, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, category, amount, type, description, payment_mode, reference_number, date, req.user.id]
    );
    res.status(201).json({ id, message: 'Expense recorded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Edit Expense
router.put('/:id', authenticateJWT, isAdmin, async (req, res) => {
  const { category, amount, type, description, payment_mode, reference_number, date } = req.body;
  try {
    await pool.query(
      `UPDATE expenses 
       SET category = ?, amount = ?, type = ?, description = ?, payment_mode = ?, reference_number = ?, date = ?
       WHERE id = ? AND deleted_at IS NULL`,
      [category, amount, type, description, payment_mode, reference_number, date, req.params.id]
    );
    res.json({ message: 'Expense updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Soft Delete Expense
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE expenses SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
