import express from 'express';
import { ConfigService } from '../services/config.service.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { pool } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all config
router.get('/', authenticateJWT, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const config = await ConfigService.getAll();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch configuration' });
  }
});

// Update multiple config keys
router.put('/', authenticateJWT, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const configMap = req.body; // { key1: value1, key2: value2 }
    await ConfigService.updateMultiple(configMap);
    res.json({ message: 'Configuration updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update configuration' });
  }
});

// Test Email Config
router.post('/test-email', authenticateJWT, authorizeRoles('super_admin'), async (req, res) => {
    // This would use a mail service to send a test email
    // For now, just a placeholder
    res.json({ message: 'Test email sent successfully' });
});

// --- Dynamic Social Platforms Management ---

// Get all social platforms
router.get('/social-platforms', authenticateJWT, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const [platforms] = await pool.query('SELECT * FROM social_platforms ORDER BY created_at ASC');
    res.json(platforms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch social platforms', error: error.message });
  }
});

// Create new social platform
router.post('/social-platforms', authenticateJWT, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const { name, icon, color, url, is_active } = req.body;
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO social_platforms (id, name, icon, color, url, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, icon, color, url || '', is_active ? 1 : 0]
    );
    res.status(201).json({ id, name, icon, color, url, is_active });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create social platform', error: error.message });
  }
});

// Update social platform
router.put('/social-platforms/:id', authenticateJWT, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color, url, is_active } = req.body;
    
    await pool.query(
      'UPDATE social_platforms SET name = ?, icon = ?, color = ?, url = ?, is_active = ? WHERE id = ?',
      [name, icon, color, url || '', is_active ? 1 : 0, id]
    );
    res.json({ message: 'Social platform updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update social platform', error: error.message });
  }
});

// Delete social platform
router.delete('/social-platforms/:id', authenticateJWT, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM social_platforms WHERE id = ?', [id]);
    res.json({ message: 'Social platform deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete social platform', error: error.message });
  }
});

// GET /api/admin/config/terms-privacy-acceptances
router.get('/terms-privacy-acceptances', authenticateJWT, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT tpa.*, c.name as candidate_name, c.email as candidate_email, e.name as exam_name
      FROM terms_privacy_acceptances tpa
      JOIN public_exam_candidates c ON tpa.candidate_id = c.id
      JOIN public_exams e ON c.exam_id = e.id
      ORDER BY tpa.accepted_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch terms/privacy acceptance history' });
  }
});

export default router;
