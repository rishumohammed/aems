import { LeadService } from '../services/lead.service.js';

export const LeadController = {
  async submitLead(req, res) {
    try {
      const { 
        name, 
        email, 
        phone, 
        source, 
        form_id, 
        course_interest_ids,
        education_level,
        college_name,
        gender,
        date_of_birth,
        address,
        notes,
        custom_fields 
      } = req.body;

      // Basic validation
      if (!name || (!phone && !email)) {
        return res.status(400).json({ message: 'Name and either Phone or Email are required' });
      }

      const selected_courses = course_interest_ids || custom_fields?.course_interest_ids || [];
      if (custom_fields?.course_interest_ids) delete custom_fields.course_interest_ids;

      await LeadService.createLead({
        name,
        email: email || null,
        phone: phone || '',
        source: source || 'website',
        form_id: form_id || null,
        course_interest_ids: selected_courses,
        education_level: education_level || custom_fields?.education_level || null,
        college_name: college_name || custom_fields?.college_name || null,
        gender: gender || custom_fields?.gender || null,
        date_of_birth: date_of_birth || custom_fields?.date_of_birth || null,
        address: address || custom_fields?.address || null,
        notes: notes || null,
        custom_fields
      });

      res.status(200).json({ 
        success: true, 
        message: 'Your registration has been submitted successfully. Our team will contact you shortly.' 
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
