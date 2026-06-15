import { LeadService } from '../services/lead.service.js';

export const LeadController = {
  async submitLead(req, res) {
    try {
      const { name, email, phone, source, form_id, custom_fields } = req.body;

      // Basic validation
      if (!name || !phone) {
        return res.status(400).json({ message: 'Name and Phone are required' });
      }

      await LeadService.createLead({
        name,
        email,
        phone,
        source: source || 'website',
        form_id,
        custom_fields
      });

      res.status(200).json({ 
        success: true, 
        message: 'We will contact you shortly' 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
