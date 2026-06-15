import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { USER_ROLES } from '@aems/shared';

const router = express.Router();

// Middleware to ensure only admins can manage these
router.use(authenticateJWT);
router.use(authorizeRoles(USER_ROLES.SUPER_ADMIN));

// Get all categories (including inactive ones for admin)
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT c.*, (SELECT COUNT(*) FROM courses WHERE category_id = c.id) as course_count 
      FROM course_categories c 
      ORDER BY c.order_index ASC
    `);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new category
router.post('/', async (req, res) => {
  const { name, slug, icon, description, parent_id, is_active } = req.body;
  const id = uuidv4();
  try {
    // Get max order_index
    const [maxOrder] = await pool.query('SELECT MAX(order_index) as max_order FROM course_categories');
    const nextOrder = (maxOrder[0].max_order || 0) + 1;

    await pool.query(
      'INSERT INTO course_categories (id, name, slug, icon, description, parent_id, is_active, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, slug, icon, description, parent_id || null, is_active ?? true, nextOrder]
    );
    res.status(201).json({ id, message: 'Category created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  const { name, slug, icon, description, parent_id, is_active } = req.body;
  try {
    await pool.query(
      'UPDATE course_categories SET name = ?, slug = ?, icon = ?, description = ?, parent_id = ?, is_active = ? WHERE id = ?',
      [name, slug, icon, description, parent_id || null, is_active, req.params.id]
    );
    res.json({ message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reorder categories
router.put('/reorder/bulk', async (req, res) => {
  const { orders } = req.body; // Array of { id, order_index }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const item of orders) {
      await connection.query('UPDATE course_categories SET order_index = ? WHERE id = ?', [item.order_index, item.id]);
    }
    await connection.commit();
    res.json({ message: 'Order updated' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    // Check if category has courses
    const [courses] = await pool.query('SELECT id FROM courses WHERE category_id = ? LIMIT 1', [req.params.id]);
    if (courses.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category with associated courses' });
    }
    await pool.query('DELETE FROM course_categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
