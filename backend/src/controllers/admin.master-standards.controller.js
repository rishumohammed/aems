import { pool as db } from '../db/connection.js';
import slugify from 'slugify';

export const getStandards = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM master_standards ORDER BY sort_order ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching standards:', error);
    res.status(500).json({ message: 'Failed to fetch standards' });
  }
};

export const createStandard = async (req, res) => {
  const { name, sub, slug, icon, color, description, banner_image, meta_description, scope, compliance_info, highlights_json, benefits_json, is_active, sort_order } = req.body;
  try {
    const cleanSlug = slug?.trim() 
      ? slugify(slug.trim(), { lower: true, strict: true })
      : slugify(name, { lower: true, strict: true });

    const highlightsStr = typeof highlights_json === 'object' ? JSON.stringify(highlights_json) : (highlights_json || null);
    const benefitsStr = typeof benefits_json === 'object' ? JSON.stringify(benefits_json) : (benefits_json || null);

    const [result] = await db.query(
      'INSERT INTO master_standards (name, sub, slug, icon, color, description, banner_image, meta_description, scope, compliance_info, highlights_json, benefits_json, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, sub, cleanSlug, icon, color, description || null, banner_image || null, meta_description || null, scope || 'International Standard', compliance_info || 'GFSI & ISO Aligned', highlightsStr, benefitsStr, is_active ?? true, sort_order ?? 0]
    );
    res.status(201).json({ id: result.insertId, slug: cleanSlug, message: 'Standard created successfully' });
  } catch (error) {
    console.error('Error creating standard:', error);
    res.status(500).json({ message: error.message || 'Failed to create standard' });
  }
};

export const updateStandard = async (req, res) => {
  const { id } = req.params;
  const { name, sub, slug, icon, color, description, banner_image, meta_description, scope, compliance_info, highlights_json, benefits_json, is_active, sort_order } = req.body;
  try {
    const cleanSlug = slug?.trim() 
      ? slugify(slug.trim(), { lower: true, strict: true })
      : slugify(name, { lower: true, strict: true });

    const highlightsStr = typeof highlights_json === 'object' ? JSON.stringify(highlights_json) : (highlights_json || null);
    const benefitsStr = typeof benefits_json === 'object' ? JSON.stringify(benefits_json) : (benefits_json || null);

    await db.query(
      'UPDATE master_standards SET name = ?, sub = ?, slug = ?, icon = ?, color = ?, description = ?, banner_image = ?, meta_description = ?, scope = ?, compliance_info = ?, highlights_json = ?, benefits_json = ?, is_active = ?, sort_order = ? WHERE id = ?',
      [name, sub, cleanSlug, icon, color, description || null, banner_image || null, meta_description || null, scope || 'International Standard', compliance_info || 'GFSI & ISO Aligned', highlightsStr, benefitsStr, is_active ? 1 : 0, sort_order, id]
    );
    res.json({ message: 'Standard updated successfully' });
  } catch (error) {
    console.error('Error updating standard:', error);
    res.status(500).json({ message: error.message || 'Failed to update standard' });
  }
};

export const deleteStandard = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM master_standards WHERE id = ?', [id]);
    res.json({ message: 'Standard deleted successfully' });
  } catch (error) {
    console.error('Error deleting standard:', error);
    res.status(500).json({ message: 'Failed to delete standard' });
  }
};
