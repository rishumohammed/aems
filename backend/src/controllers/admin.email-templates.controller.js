import emailTemplateService from '../services/email-template.service.js';

export const AdminEmailTemplatesController = {
  // GET /api/admin/config/email-templates
  async getTemplates(req, res) {
    try {
      const { category, search, activeOnly } = req.query;
      const templates = await emailTemplateService.getAllTemplates({
        category,
        search,
        activeOnly: activeOnly === 'true'
      });
      res.json(templates);
    } catch (error) {
      console.error('getTemplates error:', error);
      res.status(500).json({ message: 'Failed to fetch email templates', error: error.message });
    }
  },

  // GET /api/admin/config/email-templates/:id
  async getTemplate(req, res) {
    try {
      const template = await emailTemplateService.getTemplateById(req.params.id);
      if (!template) {
        return res.status(404).json({ message: 'Email template not found' });
      }
      res.json(template);
    } catch (error) {
      console.error('getTemplate error:', error);
      res.status(500).json({ message: 'Failed to fetch email template', error: error.message });
    }
  },

  // POST /api/admin/config/email-templates
  async createTemplate(req, res) {
    try {
      const { code, name, description, category, subject, body_html, placeholders } = req.body;
      if (!name || !subject || !body_html) {
        return res.status(400).json({ message: 'Name, subject, and body_html are required' });
      }

      const created = await emailTemplateService.createTemplate({
        code,
        name,
        description,
        category,
        subject,
        body_html,
        placeholders
      });
      res.status(201).json({ message: 'Template created successfully', template: created });
    } catch (error) {
      console.error('createTemplate error:', error);
      res.status(500).json({ message: error.message || 'Failed to create email template' });
    }
  },

  // PUT /api/admin/config/email-templates/:id
  async updateTemplate(req, res) {
    try {
      const { name, description, category, subject, body_html, placeholders, is_active } = req.body;
      const updated = await emailTemplateService.updateTemplate(req.params.id, {
        name,
        description,
        category,
        subject,
        body_html,
        placeholders,
        is_active
      });
      res.json({ message: 'Template updated successfully', template: updated });
    } catch (error) {
      console.error('updateTemplate error:', error);
      res.status(500).json({ message: error.message || 'Failed to update email template' });
    }
  },

  // DELETE /api/admin/config/email-templates/:id
  async deleteTemplate(req, res) {
    try {
      await emailTemplateService.deleteTemplate(req.params.id);
      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('deleteTemplate error:', error);
      res.status(400).json({ message: error.message || 'Failed to delete email template' });
    }
  },

  // POST /api/admin/config/email-templates/:id/reset
  async resetTemplate(req, res) {
    try {
      const reset = await emailTemplateService.resetTemplate(req.params.id);
      res.json({ message: 'Template successfully reset to factory default', template: reset });
    } catch (error) {
      console.error('resetTemplate error:', error);
      res.status(400).json({ message: error.message || 'Failed to reset email template' });
    }
  },

  // POST /api/admin/config/email-templates/preview
  async previewTemplate(req, res) {
    try {
      const { id, code, subject, body_html, variables } = req.body;
      const preview = await emailTemplateService.previewTemplate({
        id,
        code,
        subject,
        body_html,
        variables
      });
      res.json(preview);
    } catch (error) {
      console.error('previewTemplate error:', error);
      res.status(500).json({ message: 'Failed to generate preview', error: error.message });
    }
  },

  // POST /api/admin/config/email-templates/:id/test
  async sendTestTemplate(req, res) {
    try {
      const { recipient, subject, body_html, variables } = req.body;
      const targetEmail = recipient || req.user?.email || 'admin@brixify.online';

      const result = await emailTemplateService.sendTestEmail({
        id: req.params.id,
        subject,
        body_html,
        recipient: targetEmail,
        variables
      });

      if (result && result.simulated) {
        return res.json({
          message: `Brevo is currently simulated (no API key). Test email was logged to backend console for ${targetEmail}.`,
          simulated: true,
          details: result
        });
      }

      if (result && result.error) {
        return res.status(400).json({
          message: `Brevo dispatch error: ${result.error}`,
          error: result.error,
          details: result
        });
      }

      res.json({
        message: `Test email successfully dispatched to ${targetEmail} via Brevo!`,
        result
      });
    } catch (error) {
      console.error('sendTestTemplate error:', error);
      res.status(500).json({ message: 'Failed to send test email: ' + error.message });
    }
  }
};
