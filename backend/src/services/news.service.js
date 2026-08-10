import pool from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';

export class NewsService {
  static async create(data) {
    const id = uuidv4();
    let slug = slugify(data.title, { lower: true, strict: true });
    
    // Ensure slug uniqueness
    let counter = 1;
    let originalSlug = slug;
    while (true) {
      const [existing] = await pool.query('SELECT id FROM news WHERE slug = ?', [slug]);
      if (existing.length === 0) break;
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    const query = `
      INSERT INTO news (id, title, slug, content, image_url, is_published, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const isPublished = data.is_published ? 1 : 0;
    const publishedAt = isPublished ? new Date() : null;

    await pool.query(query, [
      id, data.title, slug, data.content || '', data.image_url || null, isPublished, publishedAt
    ]);

    return this.getById(id);
  }

  static async update(id, data) {
    const current = await this.getById(id);
    if (!current) throw new Error('News not found');

    let slug = current.slug;
    if (data.title && data.title !== current.title) {
      slug = slugify(data.title, { lower: true, strict: true });
      let counter = 1;
      let originalSlug = slug;
      while (true) {
        const [existing] = await pool.query('SELECT id FROM news WHERE slug = ? AND id != ?', [slug, id]);
        if (existing.length === 0) break;
        slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }

    const updates = [];
    const values = [];

    if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
    if (slug !== current.slug) { updates.push('slug = ?'); values.push(slug); }
    if (data.content !== undefined) { updates.push('content = ?'); values.push(data.content); }
    if (data.image_url !== undefined) { updates.push('image_url = ?'); values.push(data.image_url); }
    if (data.is_published !== undefined) { 
      updates.push('is_published = ?'); 
      values.push(data.is_published ? 1 : 0);
      if (data.is_published && !current.is_published) {
        updates.push('published_at = ?');
        values.push(new Date());
      } else if (!data.is_published) {
        updates.push('published_at = ?');
        values.push(null);
      }
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE news SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    return this.getById(id);
  }

  static async delete(id) {
    await pool.query('DELETE FROM news WHERE id = ?', [id]);
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM news WHERE id = ?', [id]);
    return rows[0];
  }

  static async getBySlug(slug) {
    const [rows] = await pool.query('SELECT * FROM news WHERE slug = ?', [slug]);
    return rows[0];
  }

  static async listAdmin(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    let countQuery = 'SELECT COUNT(*) as total FROM news';
    let dataQuery = 'SELECT * FROM news';
    const params = [];

    if (search) {
      const searchPattern = `%${search}%`;
      countQuery += ' WHERE title LIKE ?';
      dataQuery += ' WHERE title LIKE ?';
      params.push(searchPattern);
    }

    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    
    const [countResult] = await pool.query(countQuery, search ? params : []);
    const [data] = await pool.query(dataQuery, [...params, parseInt(limit), parseInt(offset)]);

    return {
      total: countResult[0].total,
      news: data
    };
  }

  static async listPublic(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM news WHERE is_published = 1');
    const [data] = await pool.query('SELECT * FROM news WHERE is_published = 1 ORDER BY published_at DESC LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);

    return {
      total: countResult[0].total,
      news: data
    };
  }
}
