import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import { pool } from '../db/connection.js';
import brevoService from '../services/brevo.service.js';
import { checkAndSendEventReminders } from '../jobs/event-reminder.job.js';

// Helper to compute event and registration status
export const computeEventStatus = (event) => {
  const now = new Date();
  const regStart = new Date(event.registration_start);
  const regEnd = new Date(event.registration_end);
  const eventStart = new Date(event.event_start);
  const eventEnd = event.event_end ? new Date(event.event_end) : new Date(eventStart.getTime() + 4 * 60 * 60 * 1000); // 4h default duration

  let registrationStatus = 'open';
  if (now < regStart) {
    registrationStatus = 'upcoming';
  } else if (now > regEnd) {
    registrationStatus = 'closed';
  }

  let eventStatus = 'upcoming';
  if (now >= eventStart && now <= eventEnd) {
    eventStatus = 'live';
  } else if (now > eventEnd) {
    eventStatus = 'completed';
  }

  // Exact button logic:
  // 1. If registration is open: "register"
  // 2. If registration is over, but event not started yet: "waiting_to_start" (disabled button)
  // 3. If event time start: "join_event" (enabled Join Event button)
  // 4. If event completed: "concluded"
  let buttonState = 'register';
  let buttonText = 'Register Now';
  let isButtonDisabled = false;

  if (registrationStatus === 'upcoming') {
    buttonState = 'reg_not_started';
    buttonText = 'Registration Soon';
    isButtonDisabled = true;
  } else if (registrationStatus === 'open') {
    buttonState = 'register';
    buttonText = 'Register Now';
    isButtonDisabled = false;
  } else if (registrationStatus === 'closed' && eventStatus === 'upcoming') {
    buttonState = 'waiting_to_start';
    buttonText = 'Join Event';
    isButtonDisabled = true; // Disabled until event start time!
  } else if (eventStatus === 'live') {
    buttonState = 'join_event';
    buttonText = 'Join Event';
    isButtonDisabled = false; // Enabled when event time starts!
  } else if (eventStatus === 'completed') {
    buttonState = 'concluded';
    buttonText = 'Event Concluded';
    isButtonDisabled = true;
  }

  return {
    ...event,
    registration_status: registrationStatus,
    event_status: eventStatus,
    button_state: buttonState,
    button_text: buttonText,
    is_button_disabled: isButtonDisabled
  };
};

/**
 * PUBLIC: Get all published events
 */
export const getPublicEvents = async (req, res) => {
  try {
    const { filter = 'all' } = req.query;

    let query = `
      SELECT 
        e.*,
        COUNT(DISTINCT r.id) as registrations_count
      FROM events e
      LEFT JOIN event_registrations r ON e.id = r.event_id AND r.is_verified = TRUE
      WHERE e.status = 'published'
      GROUP BY e.id
      ORDER BY e.event_start ASC
    `;

    const [rows] = await pool.query(query);

    const computed = rows.map(computeEventStatus);

    let filtered = computed;
    if (filter === 'upcoming') {
      filtered = computed.filter(e => e.event_status === 'upcoming' || e.event_status === 'live');
    } else if (filter === 'past') {
      filtered = computed.filter(e => e.event_status === 'completed');
    } else if (filter === 'open_registration') {
      filtered = computed.filter(e => e.registration_status === 'open');
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error in getPublicEvents:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

/**
 * PUBLIC: Get single event by slug or ID
 */
export const getPublicEventByIdOrSlug = async (req, res) => {
  const { identifier } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        e.*,
        COUNT(DISTINCT r.id) as registrations_count
      FROM events e
      LEFT JOIN event_registrations r ON e.id = r.event_id AND r.is_verified = TRUE
      WHERE (e.id = ? OR e.slug = ?) AND e.status = 'published'
      GROUP BY e.id
    `, [identifier, identifier]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Event not found or not published' });
    }

    res.json(computeEventStatus(rows[0]));
  } catch (error) {
    console.error('Error in getPublicEventByIdOrSlug:', error);
    res.status(500).json({ message: 'Failed to fetch event details', error: error.message });
  }
};

/**
 * PUBLIC: Request OTP for email verification
 */
export const requestRegistrationOtp = async (req, res) => {
  const { id: eventId } = req.params;
  const { email, name } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  try {
    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = events[0];
    const computed = computeEventStatus(event);

    if (computed.registration_status !== 'open') {
      return res.status(400).json({
        message: computed.registration_status === 'upcoming'
          ? 'Registration for this event has not started yet.'
          : 'Registration for this event is closed.'
      });
    }

    // Check if email already registered
    const [existing] = await pool.query(
      'SELECT id FROM event_registrations WHERE event_id = ? AND email = ?',
      [eventId, email.trim().toLowerCase()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'This email is already registered for this event. Your seat is already confirmed!'
      });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Clean up old unverified OTPs for this email and event
    await pool.query(
      'DELETE FROM event_otps WHERE event_id = ? AND email = ?',
      [eventId, email.trim().toLowerCase()]
    );

    // Save OTP (10 minute expiry)
    const otpId = uuidv4();
    await pool.query(`
      INSERT INTO event_otps (id, event_id, email, otp, expires_at)
      VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
    `, [otpId, eventId, email.trim().toLowerCase(), otp]);

    // Send via Brevo REST API
    await brevoService.sendEventOtpEmail({
      email: email.trim().toLowerCase(),
      name: name || 'Attendee',
      otp,
      eventTitle: event.title
    });

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}.`,
      expiresInMinutes: 10
    });
  } catch (error) {
    console.error('Error in requestRegistrationOtp:', error);
    res.status(500).json({ message: 'Failed to send verification code', error: error.message });
  }
};

/**
 * PUBLIC: Verify OTP and complete registration
 */
export const registerForEvent = async (req, res) => {
  const { id: eventId } = req.params;
  const { name, email, phone, occupation, organization, otp } = req.body;

  if (!name || !email || !phone || !occupation || !organization) {
    return res.status(400).json({ message: 'All registration fields are required.' });
  }

  const validOccupations = ['Student', 'Working', 'Trainer'];
  if (!validOccupations.includes(occupation)) {
    return res.status(400).json({ message: 'Please select a valid occupation (Student, Working, or Trainer).' });
  }

  if (!otp || otp.trim().length !== 6) {
    return res.status(400).json({ message: 'Please provide a valid 6-digit verification code.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = events[0];
    const computed = computeEventStatus(event);

    if (computed.registration_status !== 'open') {
      return res.status(400).json({ message: 'Registration for this event is closed.' });
    }

    // Verify OTP
    const [otpRecords] = await pool.query(`
      SELECT * FROM event_otps 
      WHERE event_id = ? AND email = ? AND otp = ? AND expires_at > NOW() AND is_verified = FALSE
      ORDER BY created_at DESC 
      LIMIT 1
    `, [eventId, cleanEmail, otp.trim()]);

    if (otpRecords.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired verification code. Please request a new code.' });
    }

    // Mark OTP verified
    await pool.query('UPDATE event_otps SET is_verified = TRUE WHERE id = ?', [otpRecords[0].id]);

    // Check duplicate
    const [existing] = await pool.query(
      'SELECT id FROM event_registrations WHERE event_id = ? AND email = ?',
      [eventId, cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You are already registered for this event.' });
    }

    // Populate occupation-specific column
    const collegeName = occupation === 'Student' ? organization.trim() : null;
    const companyName = occupation === 'Working' ? organization.trim() : null;
    const institutionName = occupation === 'Trainer' ? organization.trim() : null;

    const registrationId = uuidv4();
    await pool.query(`
      INSERT INTO event_registrations (
        id, event_id, name, email, phone, occupation, organization,
        college_name, company_name, institution_name, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `, [
      registrationId,
      eventId,
      name.trim(),
      cleanEmail,
      phone.trim(),
      occupation,
      organization.trim(),
      collegeName,
      companyName,
      institutionName
    ]);

    // Send confirmation email via Brevo REST API
    const registrationData = {
      id: registrationId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      occupation,
      organization: organization.trim()
    };

    try {
      await brevoService.sendEventRegistrationSuccessEmail({
        registration: registrationData,
        event
      });
    } catch (emailErr) {
      console.warn('Registration completed but confirmation email failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration confirmed successfully! A confirmation email has been sent.',
      registration: registrationData
    });
  } catch (error) {
    console.error('Error in registerForEvent:', error);
    res.status(500).json({ message: 'Failed to complete registration', error: error.message });
  }
};

/**
 * ADMIN: Get all events with stats
 */
export const getAdminEvents = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.*,
        COUNT(DISTINCT r.id) as registrations_count,
        SUM(CASE WHEN r.occupation = 'Student' THEN 1 ELSE 0 END) as students_count,
        SUM(CASE WHEN r.occupation = 'Working' THEN 1 ELSE 0 END) as working_count,
        SUM(CASE WHEN r.occupation = 'Trainer' THEN 1 ELSE 0 END) as trainers_count
      FROM events e
      LEFT JOIN event_registrations r ON e.id = r.event_id AND r.is_verified = TRUE
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `);

    res.json(rows.map(computeEventStatus));
  } catch (error) {
    console.error('Error in getAdminEvents:', error);
    res.status(500).json({ message: 'Failed to fetch admin events', error: error.message });
  }
};

/**
 * ADMIN: Get single event details with registered candidates list
 */
export const getAdminEventById = async (req, res) => {
  const { id } = req.params;

  try {
    const [events] = await pool.query(`
      SELECT 
        e.*,
        COUNT(DISTINCT r.id) as registrations_count
      FROM events e
      LEFT JOIN event_registrations r ON e.id = r.event_id AND r.is_verified = TRUE
      WHERE e.id = ?
      GROUP BY e.id
    `, [id]);

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = computeEventStatus(events[0]);

    // Fetch registered candidates inside that event
    const [candidates] = await pool.query(`
      SELECT * FROM event_registrations 
      WHERE event_id = ?
      ORDER BY created_at DESC
    `, [id]);

    res.json({
      event,
      candidates
    });
  } catch (error) {
    console.error('Error in getAdminEventById:', error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
};

/**
 * ADMIN: Create new event
 */
export const createAdminEvent = async (req, res) => {
  const {
    title,
    slug: inputSlug,
    description,
    registration_start,
    registration_end,
    event_start,
    event_end,
    meet_link,
    status = 'published'
  } = req.body;

  if (!title || !registration_start || !registration_end || !event_start) {
    return res.status(400).json({
      message: 'Title, Registration Start & End date, and Event Date/Time are required.'
    });
  }

  try {
    const id = uuidv4();
    let slug = inputSlug ? slugify(inputSlug.trim(), { lower: true, strict: true }) : '';
    if (!slug) {
      const baseSlug = slugify(title, { lower: true, strict: true }) || 'event';
      slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;
    } else {
      // Check if custom slug already exists
      const [existingSlug] = await pool.query('SELECT id FROM events WHERE slug = ?', [slug]);
      if (existingSlug.length > 0) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }
    const image_url = req.file ? `/uploads/events/${req.file.filename}` : (req.body.image_url || null);

    await pool.query(`
      INSERT INTO events (
        id, title, slug, description, image_url,
        registration_start, registration_end, event_start, event_end,
        meet_link, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      title.trim(),
      slug,
      description || null,
      image_url,
      registration_start,
      registration_end,
      event_start,
      event_end || null,
      meet_link || null,
      status,
      req.user?.id || null
    ]);

    const [created] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    res.status(201).json({
      message: 'Event created successfully',
      event: computeEventStatus(created[0])
    });
  } catch (error) {
    console.error('Error in createAdminEvent:', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};

/**
 * ADMIN: Update event
 */
export const updateAdminEvent = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    slug: inputSlug,
    description,
    registration_start,
    registration_end,
    event_start,
    event_end,
    meet_link,
    status
  } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const current = existing[0];
    let finalSlug = current.slug;
    if (inputSlug !== undefined && inputSlug.trim() !== '') {
      const candidateSlug = slugify(inputSlug.trim(), { lower: true, strict: true });
      const [duplicate] = await pool.query('SELECT id FROM events WHERE slug = ? AND id != ?', [candidateSlug, id]);
      if (duplicate.length > 0) {
        return res.status(400).json({ message: 'This slug URL is already in use by another event. Please choose a unique slug.' });
      }
      finalSlug = candidateSlug;
    }

    const image_url = req.file
      ? `/uploads/events/${req.file.filename}`
      : (req.body.image_url !== undefined ? req.body.image_url : current.image_url);

    await pool.query(`
      UPDATE events SET
        title = ?,
        slug = ?,
        description = ?,
        image_url = ?,
        registration_start = ?,
        registration_end = ?,
        event_start = ?,
        event_end = ?,
        meet_link = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      title !== undefined ? title.trim() : current.title,
      finalSlug,
      description !== undefined ? description : current.description,
      image_url,
      registration_start !== undefined ? registration_start : current.registration_start,
      registration_end !== undefined ? registration_end : current.registration_end,
      event_start !== undefined ? event_start : current.event_start,
      event_end !== undefined ? (event_end || null) : current.event_end,
      meet_link !== undefined ? meet_link : current.meet_link,
      status !== undefined ? status : current.status,
      id
    ]);

    const [updated] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    res.json({
      message: 'Event updated successfully',
      event: computeEventStatus(updated[0])
    });
  } catch (error) {
    console.error('Error in updateAdminEvent:', error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
};

/**
 * ADMIN: Delete event
 */
export const deleteAdminEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.json({ message: 'Event and all associated registrations deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAdminEvent:', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
};

/**
 * ADMIN: Get candidates inside an event
 */
export const getAdminEventCandidates = async (req, res) => {
  const { id } = req.params;
  const { search = '', occupation = '' } = req.query;

  try {
    let query = `
      SELECT * FROM event_registrations 
      WHERE event_id = ?
    `;
    const params = [id];

    if (occupation && occupation !== 'all') {
      query += ` AND occupation = ?`;
      params.push(occupation);
    }

    if (search && search.trim() !== '') {
      query += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR organization LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY created_at DESC`;

    const [candidates] = await pool.query(query, params);
    res.json(candidates);
  } catch (error) {
    console.error('Error in getAdminEventCandidates:', error);
    res.status(500).json({ message: 'Failed to fetch event candidates', error: error.message });
  }
};

/**
 * ADMIN: Export candidates as CSV
 */
export const exportAdminEventCandidatesCsv = async (req, res) => {
  const { id } = req.params;

  try {
    const [events] = await pool.query('SELECT title FROM events WHERE id = ?', [id]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const [candidates] = await pool.query(`
      SELECT 
        name, email, phone, occupation, organization, 
        college_name, company_name, institution_name,
        is_verified, reminder_sent_24h, created_at
      FROM event_registrations 
      WHERE event_id = ?
      ORDER BY created_at ASC
    `, [id]);

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Occupation',
      'Organization / Detail',
      'College',
      'Company',
      'Institution',
      'Verified',
      '24h Reminder Sent',
      'Registered At'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = candidates.map(c => [
      escapeCsv(c.name),
      escapeCsv(c.email),
      escapeCsv(c.phone),
      escapeCsv(c.occupation),
      escapeCsv(c.organization),
      escapeCsv(c.college_name || ''),
      escapeCsv(c.company_name || ''),
      escapeCsv(c.institution_name || ''),
      escapeCsv(c.is_verified ? 'Yes' : 'No'),
      escapeCsv(c.reminder_sent_24h ? 'Yes' : 'No'),
      escapeCsv(new Date(c.created_at).toISOString())
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="event-${id}-candidates.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ message: 'Failed to export CSV', error: error.message });
  }
};

/**
 * ADMIN: Manually trigger 24-hour reminder emails for this event
 */
export const triggerEventReminderManual = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await checkAndSendEventReminders(id);
    res.json({
      message: `Dispatched ${result.sent} reminder email(s) for this event.`,
      result
    });
  } catch (error) {
    console.error('Error triggering manual reminders:', error);
    res.status(500).json({ message: 'Failed to dispatch reminders', error: error.message });
  }
};
