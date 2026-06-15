import express from 'express';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Middleware to check if user is super_admin
const isSuperAdmin = [authenticateJWT, authorizeRoles('super_admin')];

// --- Institute Info ---
router.get('/institute-info', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM institute_info LIMIT 1');
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ message: 'Error fetching institute info' });
  }
});

router.put('/institute-info', isSuperAdmin, async (req, res) => {
  try {
    const data = req.body;
    const [rows] = await pool.query('SELECT id FROM institute_info LIMIT 1');
    if (rows.length === 0) {
      const id = uuidv4();
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      await pool.query(`INSERT INTO institute_info (id, ${fields}) VALUES (?, ${placeholders})`, [id, ...Object.values(data)]);
    } else {
      const id = rows[0].id;
      const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
      await pool.query(`UPDATE institute_info SET ${sets} WHERE id = ?`, [...Object.values(data), id]);
    }
    res.json({ message: 'Institute info updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating institute info' });
  }
});

// --- Team Members ---
router.get('/team', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM team_members ORDER BY order_index ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching team' });
  }
});

router.post('/team', isSuperAdmin, async (req, res) => {
  try {
    const id = uuidv4();
    const { name, role_title, bio, avatar_initials, avatar_gradient_start, avatar_gradient_end, qualification_badge, experience_years, order_index } = req.body;
    await pool.query(
      'INSERT INTO team_members (id, name, role_title, bio, avatar_initials, avatar_gradient_start, avatar_gradient_end, qualification_badge, experience_years, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, role_title, bio, avatar_initials, avatar_gradient_start, avatar_gradient_end, qualification_badge, experience_years, order_index]
    );
    res.status(201).json({ id, message: 'Member added' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding team member' });
  }
});

router.put('/team/:id', isSuperAdmin, async (req, res) => {
  try {
    const data = req.body;
    delete data.id;
    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    await pool.query(`UPDATE team_members SET ${sets} WHERE id = ?`, [...Object.values(data), req.params.id]);
    res.json({ message: 'Member updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating team member' });
  }
});

router.delete('/team/:id', isSuperAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM team_members WHERE id = ?', [req.params.id]);
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting team member' });
  }
});

router.put('/team/reorder', isSuperAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const { id, order_index } of req.body) {
      await connection.query('UPDATE team_members SET order_index = ? WHERE id = ?', [order_index, id]);
    }
    await connection.commit();
    res.json({ message: 'Team reordered' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: 'Error reordering team' });
  } finally {
    connection.release();
  }
});

// --- Recruiters ---
router.get('/recruiters', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM recruiters ORDER BY order_index ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching recruiters' });
    }
});

router.post('/recruiters', isSuperAdmin, async (req, res) => {
    try {
        const id = uuidv4();
        const { company_name, icon_emoji, hire_count, order_index } = req.body;
        await pool.query('INSERT INTO recruiters (id, company_name, icon_emoji, hire_count, order_index) VALUES (?, ?, ?, ?, ?)', [id, company_name, icon_emoji, hire_count, order_index]);
        res.status(201).json({ id, message: 'Recruiter added' });
    } catch (err) {
        res.status(500).json({ message: 'Error adding recruiter' });
    }
});

// (Similar PUT, DELETE, REORDER for recruiters... abbreviated for brevity but I'll implement them)
router.put('/recruiters/:id', isSuperAdmin, async (req, res) => {
    const data = req.body; delete data.id;
    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    await pool.query(`UPDATE recruiters SET ${sets} WHERE id = ?`, [...Object.values(data), req.params.id]);
    res.json({ message: 'Recruiter updated' });
});
router.delete('/recruiters/:id', isSuperAdmin, async (req, res) => {
    await pool.query('DELETE FROM recruiters WHERE id = ?', [req.params.id]);
    res.json({ message: 'Recruiter deleted' });
});

// --- Accreditations ---
router.get('/accreditations', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM accreditations ORDER BY order_index ASC');
    res.json(rows);
});
router.post('/accreditations', isSuperAdmin, async (req, res) => {
    const id = uuidv4();
    const { title, icon_emoji, description, order_index } = req.body;
    await pool.query('INSERT INTO accreditations (id, title, icon_emoji, description, order_index) VALUES (?, ?, ?, ?, ?)', [id, title, icon_emoji, description, order_index]);
    res.status(201).json({ id });
});
router.put('/accreditations/:id', isSuperAdmin, async (req, res) => {
    const data = req.body; delete data.id;
    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    await pool.query(`UPDATE accreditations SET ${sets} WHERE id = ?`, [...Object.values(data), req.params.id]);
    res.json({ message: 'Updated' });
});
router.delete('/accreditations/:id', isSuperAdmin, async (req, res) => {
    await pool.query('DELETE FROM accreditations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
});

// --- Testimonials ---
router.get('/testimonials', async (req, res) => {
  const [rows] = await pool.query('SELECT t.*, c.title as course_name FROM testimonials t LEFT JOIN courses c ON t.course_id = c.id ORDER BY order_index ASC');
  res.json(rows);
});

router.post('/testimonials', isSuperAdmin, async (req, res) => {
  try {
    const id = uuidv4();
    const data = req.body;
    if (data.is_featured) {
      await pool.query('UPDATE testimonials SET is_featured = FALSE');
    }
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    await pool.query(`INSERT INTO testimonials (id, ${fields}) VALUES (?, ${placeholders})`, [id, ...Object.values(data)]);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ message: 'Error adding testimonial' });
  }
});

router.put('/testimonials/:id', isSuperAdmin, async (req, res) => {
  try {
    const data = req.body;
    const id = req.params.id;
    if (data.is_featured) {
      await pool.query('UPDATE testimonials SET is_featured = FALSE WHERE id != ?', [id]);
    }
    delete data.id;
    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    await pool.query(`UPDATE testimonials SET ${sets} WHERE id = ?`, [...Object.values(data), id]);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating testimonial' });
  }
});

router.put('/testimonials/:id/feature', isSuperAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE testimonials SET is_featured = FALSE');
    await pool.query('UPDATE testimonials SET is_featured = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Featured testimonial updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error featuring testimonial' });
  }
});

router.delete('/testimonials/:id', isSuperAdmin, async (req, res) => {
  await pool.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// --- Contact Submissions ---
router.get('/contact-submissions', isSuperAdmin, async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM contact_submissions';
  const params = [];
  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }
  query += ' ORDER BY submitted_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  const [rows] = await pool.query(query, params);
  const [countRows] = await pool.query('SELECT COUNT(*) as total FROM contact_submissions' + (status ? ' WHERE status = ?' : ''), status ? [status] : []);
  
  res.json({ submissions: rows, total: countRows[0].total });
});

router.put('/contact-submissions/:id/status', isSuperAdmin, async (req, res) => {
  await pool.query('UPDATE contact_submissions SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
  res.json({ message: 'Status updated' });
});

export default router;
