import { pool } from './connection.js';
import { v4 as uuidv4 } from 'uuid';

async function seedEvents() {
  try {
    const [existing] = await pool.query('SELECT COUNT(*) as count FROM events');
    if (existing[0].count > 0) {
      console.log('Events already exist, skipping seed.');
      process.exit(0);
    }

    const now = new Date();

    // Event 1: Open for registration
    const id1 = uuidv4();
    const regStart1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const regEnd1 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const eventStart1 = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    const eventEnd1 = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);

    // Event 2: Registration closed, waiting for event to start (Starts in 18 hours)
    const id2 = uuidv4();
    const regStart2 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    const regEnd2 = new Date(now.getTime() - 2 * 60 * 60 * 1000); // Ended 2 hours ago
    const eventStart2 = new Date(now.getTime() + 18 * 60 * 60 * 1000); // Tomorrow
    const eventEnd2 = new Date(now.getTime() + 20 * 60 * 60 * 1000);

    // Event 3: Live now! (Started 30 mins ago)
    const id3 = uuidv4();
    const regStart3 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const regEnd3 = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    const eventStart3 = new Date(now.getTime() - 30 * 60 * 1000); // 30m ago
    const eventEnd3 = new Date(now.getTime() + 90 * 60 * 1000); // In 1.5 hours

    await pool.query(`
      INSERT INTO events (id, title, slug, description, image_url, registration_start, registration_end, event_start, event_end, meet_link, status)
      VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published'),
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published'),
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
    `, [
      id1,
      'Global Tech & AI Developer Summit 2026',
      'global-tech-ai-developer-summit-2026',
      'Join industry leaders and tech pioneers for an immersive deep-dive into Generative AI, Large Language Models, cloud-native deployments, and modern web application scaling.',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      regStart1, regEnd1, eventStart1, eventEnd1,
      'https://meet.google.com/aems-ai-summit',

      id2,
      'Next-Gen Cloud Architecture & Microservices Masterclass',
      'next-gen-cloud-architecture-masterclass',
      'A comprehensive masterclass on Kubernetes, serverless event-driven systems, observability, and cost-efficient cloud engineering led by senior cloud architects.',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      regStart2, regEnd2, eventStart2, eventEnd2,
      'https://meet.google.com/aems-cloud-masterclass',

      id3,
      'Hands-on UI/UX Design Systems & Frontend Mastery Workshop',
      'hands-on-ui-ux-design-systems-workshop',
      'Live interactive design sprint covering modern design tokens, accessibility, glassmorphic interfaces, and micro-interactions for modern web platforms.',
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
      regStart3, regEnd3, eventStart3, eventEnd3,
      'https://meet.google.com/aems-live-workshop'
    ]);

    // Add some sample registrations to Event 2
    await pool.query(`
      INSERT INTO event_registrations (id, event_id, name, email, phone, occupation, organization, college_name, company_name, institution_name, is_verified)
      VALUES 
      (UUID(), ?, 'Rahul Sharma', 'rahul.sharma@example.com', '+91 98765 43210', 'Student', 'IIT Delhi', 'IIT Delhi', NULL, NULL, TRUE),
      (UUID(), ?, 'Priya Patel', 'priya.patel@example.com', '+91 98111 22334', 'Working', 'Google India', NULL, 'Google India', NULL, TRUE),
      (UUID(), ?, 'Dr. Anand Kumar', 'anand.trainer@example.com', '+91 99887 76655', 'Trainer', 'National Skill Academy', NULL, NULL, 'National Skill Academy', TRUE)
    `, [id2, id2, id2]);

    console.log('✅ Seeded 3 sample events and 3 candidate registrations successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedEvents();
