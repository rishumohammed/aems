import { pool } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

class ProctoringService {
  async logEvent(attemptId, type, metadata = {}) {
    const id = uuidv4();
    await pool.query(
      'INSERT INTO proctoring_events (id, attempt_id, type, metadata_json) VALUES (?, ?, ?, ?)',
      [id, attemptId, type, JSON.stringify(metadata)]
    );
    return { id, attemptId, type };
  }

  async getEventsForAttempt(attemptId) {
    const [events] = await pool.query(
      'SELECT * FROM proctoring_events WHERE attempt_id = ? ORDER BY created_at ASC',
      [attemptId]
    );
    return events;
  }

  async getRecordingsForAttempt(attemptId) {
    const dir = path.join(process.cwd(), 'uploads', 'recordings', attemptId);
    try {
      const files = await fs.readdir(dir);
      // Sort files numerically by chunk index (e.g., chunk-0.webm, chunk-1.webm)
      const webmFiles = files
        .filter(f => f.endsWith('.webm'))
        .sort((a, b) => {
          const numA = parseInt(a.replace(/[^0-9]/g, ''), 10);
          const numB = parseInt(b.replace(/[^0-9]/g, ''), 10);
          return numA - numB;
        });

      return webmFiles.map(filename => ({
        url: `/uploads/recordings/${attemptId}/${filename}`,
        filename
      }));
    } catch (err) {
      if (err.code === 'ENOENT') {
        return []; // No recordings yet
      }
      throw err;
    }
  }

  async getAttemptsWithViolations(userId, role) {
    let query = `
      SELECT 
        ea.id, ea.student_id, ea.exam_id, ea.status, ea.submitted_at,
        u.name as student_name, u.email as student_email,
        e.title as exam_title,
        COUNT(pe.id) as violation_count
      FROM exam_attempts ea
      JOIN users u ON ea.student_id = u.id
      JOIN exams e ON ea.exam_id = e.id
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN proctoring_events pe ON ea.id = pe.attempt_id
      WHERE e.proctoring_enabled = TRUE
    `;
    const params = [];
    if (role === 'tutor') {
      query += ` AND c.tutor_id = ?`;
      params.push(userId);
    }
    
    query += `
      GROUP BY ea.id, ea.student_id, ea.exam_id, ea.status, ea.submitted_at, u.name, u.email, e.title
      ORDER BY ea.submitted_at DESC
    `;
    const [attempts] = await pool.query(query, params);
    return attempts;
  }

  async getViolationsGroupedByExam(userId, role) {
    let query = `
      SELECT 
        pe.id, pe.type as violation_type, pe.metadata_json, pe.created_at as timestamp,
        ea.id as attempt_id, ea.student_id, ea.exam_id, ea.status, ea.submitted_at, ea.started_at as attempt_started_at,
        u.name as student_name,
        e.title as exam_title, e.created_at as exam_created_at,
        c.title as course_title
      FROM exam_attempts ea
      LEFT JOIN proctoring_events pe ON pe.attempt_id = ea.id
      JOIN users u ON ea.student_id = u.id
      JOIN exams e ON ea.exam_id = e.id
      JOIN courses c ON e.course_id = c.id
      WHERE e.proctoring_enabled = TRUE
    `;
    const params = [];
    if (role === 'tutor') {
      query += ` AND c.tutor_id = ?`;
      params.push(userId);
    }
    query += ` ORDER BY ea.started_at DESC, pe.created_at DESC`;
    const [events] = await pool.query(query, params);

    const examsMap = new Map();
    let totalViolations = 0;
    let highSeverityViolations = 0;
    const studentsFlaggedSet = new Set();

    const getSeverity = (type) => {
      const high = ['multiple_faces', 'face_absent', 'devtools_open', 'phone_detected', 'suspicious_object', 'camera_disabled', 'microphone_disabled'];
      const medium = ['tab_switch', 'window_blur', 'fullscreen_exit', 'looking_away'];
      if (high.includes(type)) return 'High';
      if (medium.includes(type)) return 'Medium';
      return 'Low';
    };

    events.forEach(ev => {
      if (!examsMap.has(ev.exam_id)) {
        examsMap.set(ev.exam_id, {
          id: ev.exam_id,
          title: ev.exam_title,
          course_title: ev.course_title,
          date: ev.exam_created_at,
          attempts: 0,
          totalViolations: 0,
          highSeverity: 0,
          violations: []
        });
      }
      
      const examGroup = examsMap.get(ev.exam_id);
      
      if (ev.id) {
        const severity = getSeverity(ev.violation_type);
        
        totalViolations++;
        examGroup.totalViolations++;
        studentsFlaggedSet.add(ev.student_id);

        if (severity === 'High') {
          highSeverityViolations++;
          examGroup.highSeverity++;
        }

        let has_screenshot = false;
        let screenshot_url = null;
        try {
          if (ev.metadata_json) {
            const meta = typeof ev.metadata_json === 'string' ? JSON.parse(ev.metadata_json) : ev.metadata_json;
            has_screenshot = !!meta.screenshot;
            screenshot_url = meta.screenshot || null;
          }
        } catch (e) {}

        examGroup.violations.push({
          id: ev.id,
          attempt_id: ev.attempt_id,
          student_id: ev.student_id,
          student_name: ev.student_name,
          violation_type: ev.violation_type,
          severity,
          timestamp: ev.timestamp,
          has_screenshot,
          screenshot_url,
          status: ev.status
        });
      } else {
        // Attempt with no violations
        examGroup.violations.push({
          id: ev.attempt_id,
          attempt_id: ev.attempt_id,
          student_id: ev.student_id,
          student_name: ev.student_name,
          violation_type: 'No Violations',
          severity: 'None',
          timestamp: ev.attempt_started_at,
          has_screenshot: false,
          screenshot_url: null,
          status: ev.status
        });
      }
    });

    const examIds = Array.from(examsMap.keys());
    if (examIds.length > 0) {
      const [attemptsCounts] = await pool.query(
        'SELECT exam_id, COUNT(id) as count FROM exam_attempts WHERE exam_id IN (?) GROUP BY exam_id',
        [examIds]
      );
      attemptsCounts.forEach(row => {
        if (examsMap.has(row.exam_id)) {
          examsMap.get(row.exam_id).attempts = row.count;
        }
      });
    }

    // Sort exams by title alphabetically
    const sortedExams = Array.from(examsMap.values()).sort((a, b) => a.title.localeCompare(b.title));

    return {
      stats: {
        totalExamsMonitored: examsMap.size,
        totalViolations,
        highSeverityViolations,
        studentsFlagged: studentsFlaggedSet.size
      },
      exams: sortedExams
    };
  }

  async clearViolations(attemptId) {
    await pool.query(
      "DELETE FROM proctoring_events WHERE attempt_id = ? AND type IN ('tab_switch', 'fullscreen_exit', 'devtools_open', 'multiple_faces', 'face_absent')",
      [attemptId]
    );
    // Also reset attempt status if it was auto-submitted due to violations
    // This allows admin to give them another chance, though more logic might be needed
    return { success: true };
  }
}

export default new ProctoringService();
