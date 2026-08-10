import { NewsService } from '../services/news.service.js';

export class NewsController {
  static async create(req, res) {
    const data = req.body;
    if (req.file) {
      data.image_url = `/uploads/news/${req.file.filename}`;
    }
    const news = await NewsService.create(data);
    res.status(201).json(news);
  }

  static async update(req, res) {
    const { id } = req.params;
    const data = req.body;
    
    // Handle specific fields boolean coercion if needed
    if (data.is_published !== undefined) {
      data.is_published = data.is_published === 'true' || data.is_published === true || data.is_published === 1;
    }

    if (req.file) {
      data.image_url = `/uploads/news/${req.file.filename}`;
    }

    const news = await NewsService.update(id, data);
    res.json(news);
  }

  static async delete(req, res) {
    const { id } = req.params;
    await NewsService.delete(id);
    res.status(204).send();
  }

  static async getById(req, res) {
    const { id } = req.params;
    const news = await NewsService.getById(id);
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json(news);
  }

  static async getBySlug(req, res) {
    const { slug } = req.params;
    const news = await NewsService.getBySlug(slug);
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json(news);
  }

  static async listAdmin(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await NewsService.listAdmin(page, limit, search);
    res.json(result);
  }

  static async listPublic(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await NewsService.listPublic(page, limit);
    res.json(result);
  }
}
