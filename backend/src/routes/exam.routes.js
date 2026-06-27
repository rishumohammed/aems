import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles, requirePermission } from '../middleware/auth.js';
import { validateExamSession } from '../middleware/examSession.js';
import examService from '../services/exam.service.js';
import courseCompletionService from '../services/course-completion.service.js';

async function autoCompleteLessonForExam(connection, studentId, courseId, enrollmentId, examId) {
  const [lessons] = await connection.query(
    'SELECT id, duration_seconds FROM course_lessons WHERE type IN ("quiz", "exam") AND quiz_id = ?',
    [examId]
  );
  if (lessons.length > 0) {
    const lessonId = lessons[0].id;
    const watched = lessons[0].duration_seconds || 0;
    
    await connection.query(`
      INSERT INTO lesson_progress (id, enrollment_id, lesson_id, watched_seconds, completed, completed_at)
      VALUES (?, ?, ?, ?, TRUE, NOW())
      ON DUPLICATE KEY UPDATE
        completed = TRUE,
        completed_at = CASE WHEN completed_at IS NULL THEN NOW() ELSE completed_at END
    `, [uuidv4(), enrollmentId, lessonId, watched]);

    const [counts] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM lesson_progress WHERE enrollment_id = ? AND completed = TRUE) as completed_count,
        (SELECT COUNT(*) FROM course_lessons cl 
         JOIN course_sections cs ON cl.section_id = cs.id 
         WHERE cs.course_id = ?) as total_count
    `, [enrollmentId, courseId]);

    const percentage = counts[0].total_count > 0 ? Math.round((counts[0].completed_count / counts[0].total_count) * 100) : 0;
    await connection.query('UPDATE enrollments SET completion_percentage = ? WHERE id = ?', [percentage, enrollmentId]);
  }
}

const router = express.Router();

const isStudent = authorizeRoles('student');
const isAdmin = requirePermission('exams');
const isTutorOrAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'tutor') return next();
  return isAdmin(req, res, next);
};

// ────────────────────────────────────────────────────────────────────────────────
// STATIC ROUTES — must come before wildcard /:id
// ────────────────────────────────────────────────────────────────────────────────

// GET /api/exams — list all exams (tutor sees only their courses)
router.get('/', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    let query = `
      SELECT e.*, c.title as course_title, u.name as created_by_name,
        (SELECT COUNT(*) FROM exam_questions WHERE exam_id = e.id) as question_count,
        (SELECT COUNT(*) FROM exam_attempts WHERE exam_id = e.id AND exam_attempts.status IN ('submitted','graded','pending_manual_review')) as attempt_count
      FROM exams e
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON e.created_by = u.id
    `;
    const conditions = ['e.deleted_at IS NULL'];
    const params = [];
    if (req.user.role === 'tutor') {
      conditions.push('c.tutor_id = ?');
      params.push(req.user.id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY e.created_at DESC';
    const [exams] = await pool.query(query, params);
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/exams/eligible — exams the logged-in student can take
router.get('/eligible', authenticateJWT, isStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const [exams] = await pool.query(`
      SELECT e.*, c.title as course_title, c.slug as course_slug,
        (SELECT COUNT(*) FROM exam_attempts ea2
         WHERE ea2.student_id = ? AND ea2.exam_id = e.id 
         AND ea2.status IN ('submitted','graded','pending_manual_review')) as attempts_used,
        (SELECT ea3.id FROM exam_attempts ea3
         WHERE ea3.student_id = ? AND ea3.exam_id = e.id AND ea3.status IN ('submitted','graded') 
         ORDER BY ea3.submitted_at DESC LIMIT 1) as last_attempt_id,
        (SELECT ea4.passed FROM exam_attempts ea4
         WHERE ea4.student_id = ? AND ea4.exam_id = e.id AND ea4.status = 'graded' AND ea4.passed = TRUE 
         LIMIT 1) as already_passed
      FROM exams e
      JOIN courses c ON e.course_id = c.id
      JOIN enrollments en ON en.course_id = c.id AND en.student_id = ?
      WHERE e.status = 'published' AND e.deleted_at IS NULL
    `, [studentId, studentId, studentId, studentId]);
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────────────────────────
// ATTEMPT ROUTES — must be before /:id to avoid param collision
// ────────────────────────────────────────────────────────────────────────────────

// GET /api/exams/attempts — list all attempts (admin/tutor)
router.get('/attempts', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    const { exam_id, status } = req.query;
    let query = `
      SELECT ea.*, e.title as exam_title, e.pass_percentage,
             u.name as student_name, u.email as student_email,
             c.title as course_title
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      JOIN users u ON ea.student_id = u.id
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (exam_id) { query += ' AND ea.exam_id = ?'; params.push(exam_id); }
    if (status) { query += ' AND ea.status = ?'; params.push(status); }
    if (req.user.role === 'tutor') { query += ' AND c.tutor_id = ?'; params.push(req.user.id); }
    query += ' ORDER BY ea.submitted_at DESC';

    const [attempts] = await pool.query(query, params);
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/exams/attempts/:id — get attempt details (for pre-exam checklist)
router.get('/attempts/:id', authenticateJWT, async (req, res) => {
  try {
    const [attempts] = await pool.query(`
      SELECT ea.*, e.title as exam_title, e.duration_minutes, e.pass_percentage,
             e.proctoring_enabled, e.instructions, e.min_submit_pct, e.randomize_questions,
             e.proctoring_config,
             c.title as course_title
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE ea.id = ?
    `, [req.params.id]);

    if (attempts.length === 0) return res.status(404).json({ message: 'Attempt not found' });
    const attempt = attempts[0];

    // Only the student or admin/tutor can view
    if (req.user.role === 'student' && attempt.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/exams/attempts/:id/start — start exam, issue session token, return questions
router.post('/attempts/:id/start', authenticateJWT, isStudent, async (req, res) => {
  try {
    const studentId = req.user.id;
    const [attempts] = await pool.query(
      'SELECT ea.*, e.duration_minutes, e.randomize_questions, e.randomize_options FROM exam_attempts ea JOIN exams e ON ea.exam_id = e.id WHERE ea.id = ? AND ea.student_id = ?',
      [req.params.id, studentId]
    );
    if (attempts.length === 0) return res.status(404).json({ message: 'Attempt not found' });
    const attempt = attempts[0];

    if (attempt.status === 'submitted' || attempt.status === 'graded') {
      return res.status(400).json({ message: 'Exam already submitted' });
    }

    // If already in_progress, return existing session
    if (attempt.status === 'in_progress' && new Date(attempt.session_expires_at) > new Date()) {
      const [questions] = await pool.query(
        'SELECT id, question_text, type, options_json, marks, order_index FROM exam_questions WHERE exam_id = ? ORDER BY order_index',
        [attempt.exam_id]
      );
      const remainingSeconds = Math.floor((new Date(attempt.session_expires_at) - new Date()) / 1000) - 300;
      return res.json({
        already_started: true,
        remaining_seconds: Math.max(0, remainingSeconds),
        questions: questions.map(q => ({ ...q, options: q.options_json ? JSON.parse(q.options_json) : [], options_json: undefined }))
      });
    }

    // Issue session token
    const { token, hash, expiresIn } = examService.generateExamSessionToken(
      attempt.id, studentId, attempt.exam_id, attempt.duration_minutes
    );
    const sessionExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Fetch questions — NEVER include correct_answer
    let [questions] = await pool.query(
      'SELECT id, question_text, type, options_json, marks, order_index FROM exam_questions WHERE exam_id = ? ORDER BY order_index',
      [attempt.exam_id]
    );

    questions = questions.map(q => ({
      id: q.id,
      question_text: q.question_text,
      type: q.type,
      marks: q.marks,
      order_index: q.order_index,
      options: q.options_json ? JSON.parse(q.options_json) : [],
    }));

    if (attempt.randomize_questions) questions = questions.sort(() => Math.random() - 0.5);
    if (attempt.randomize_options) {
      questions = questions.map(q => ({ ...q, options: q.options?.sort(() => Math.random() - 0.5) }));
    }

    await pool.query(
      "UPDATE exam_attempts SET status = 'in_progress', started_at = NOW(), exam_session_token_hash = ?, session_expires_at = ? WHERE id = ?",
      [hash, sessionExpiresAt, attempt.id]
    );

    res.json({ exam_session_token: token, remaining_seconds: attempt.duration_minutes * 60, questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/exams/attempts/:id/timer — server-synced remaining time
router.get('/attempts/:id/timer', authenticateJWT, validateExamSession, async (req, res) => {
  try {
    const [attempts] = await pool.query(
      'SELECT session_expires_at, status FROM exam_attempts WHERE id = ?',
      [req.params.id]
    );
    if (attempts.length === 0) return res.status(404).json({ message: 'Attempt not found' });
    const attempt = attempts[0];

    if (attempt.status !== 'in_progress') {
      return res.json({ remaining_seconds: 0, status: attempt.status });
    }

    const remaining = Math.max(0, Math.floor((new Date(attempt.session_expires_at) - new Date()) / 1000) - 300);
    res.json({ remaining_seconds: remaining });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/exams/attempts/:id/submit
router.post('/attempts/:id/submit', authenticateJWT, isStudent, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { answers } = req.body;
    const studentId = req.user.id;

    const [attempts] = await pool.query(
      "SELECT ea.*, e.pass_percentage, e.show_result_detail, e.course_id FROM exam_attempts ea JOIN exams e ON ea.exam_id = e.id WHERE ea.id = ? AND ea.student_id = ? AND ea.status = 'in_progress'",
      [req.params.id, studentId]
    );
    if (attempts.length === 0) return res.status(400).json({ message: 'Attempt not found or not in progress' });
    const attempt = attempts[0];

    const { autoScore, totalMarks, pendingManualReview } = await examService.gradeSubmission(req.params.id, answers || []);

    const passed = !pendingManualReview && totalMarks > 0 && ((autoScore / totalMarks) * 100) >= attempt.pass_percentage;
    const scorePercent = totalMarks > 0 ? Math.round((autoScore / totalMarks) * 100) : 0;
    const newStatus = pendingManualReview ? 'pending_manual_review' : 'graded';

    await connection.beginTransaction();
    await connection.query(
      `UPDATE exam_attempts SET 
         status = ?, submitted_at = NOW(), answers_json = ?,
         auto_score = ?, total_marks = ?, score = ?,
         passed = ?, pending_manual_review = ?
       WHERE id = ?`,
      [newStatus, JSON.stringify(answers || []), autoScore, totalMarks, scorePercent, passed, pendingManualReview, req.params.id]
    );
    await connection.commit();

    let certResult = null;
    let course_completed = false;
    if (passed && !pendingManualReview) {
      certResult = await examService.issueCertificate(req.params.id);
      
      const [enrollments] = await connection.query(
        'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
        [studentId, attempt.course_id]
      );
      if (enrollments.length > 0) {
        await autoCompleteLessonForExam(connection, studentId, attempt.course_id, enrollments[0].id, attempt.exam_id);
        course_completed = await courseCompletionService.validateAndCompleteCourse(studentId, attempt.course_id, enrollments[0].id);
      }
    }

    res.json({
      submitted: true, status: newStatus, auto_score: autoScore,
      total_marks: totalMarks, score_percent: scorePercent,
      passed, pending_manual_review: pendingManualReview,
      cert_number: certResult?.cert_number || null,
      course_completed
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
});

// GET /api/exams/attempts/:id/results
router.get('/attempts/:id/results', authenticateJWT, async (req, res) => {
  try {
    const [attempts] = await pool.query(`
      SELECT ea.*, 
             e.title as exam_title, e.pass_percentage, e.duration_minutes, e.show_result_detail, e.max_attempts, e.show_results,
             c.title as course_title, c.slug as course_slug,
             u.name as student_name,
             cert.cert_number, cert.id as cert_id,
             (SELECT COUNT(*) FROM exam_attempts WHERE student_id = ea.student_id AND exam_id = ea.exam_id AND status IN ('submitted','graded','pending_manual_review')) as attempts_used
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      LEFT JOIN courses c ON e.course_id = c.id
      JOIN users u ON ea.student_id = u.id
      LEFT JOIN certificates cert ON cert.exam_attempt_id = ea.id
      WHERE ea.id = ?
    `, [req.params.id]);

    if (attempts.length === 0) return res.status(404).json({ message: 'Attempt not found' });
    const attempt = attempts[0];

    if (req.user.role === 'student' && attempt.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    let questionBreakdown = [];
    const isTeacher = req.user && ['super_admin', 'sub_admin', 'tutor'].includes(req.user.role);
    if ((attempt.show_result_detail || isTeacher) && ['graded', 'pending_manual_review'].includes(attempt.status)) {
      const [answers] = await pool.query(`
        SELECT ea.*, eq.question_text, eq.type, eq.correct_answer, eq.marks, eq.explanation, eq.options_json
        FROM exam_answers ea
        JOIN exam_questions eq ON ea.question_id = eq.id
        WHERE ea.attempt_id = ?
        ORDER BY eq.order_index
      `, [req.params.id]);
      questionBreakdown = answers.map(a => ({
        ...a,
        options: a.options_json ? JSON.parse(a.options_json) : [],
        options_json: undefined
      }));
    }

    res.json({ ...attempt, question_breakdown: questionBreakdown });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/exams/attempts/:id/grade — manual grade an answer
router.post('/attempts/:id/grade', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { answer_id, marks_awarded } = req.body;

    await connection.beginTransaction();
    await connection.query(
      'UPDATE exam_answers SET marks_awarded = ?, is_correct = ?, graded_by = ?, graded_at = NOW() WHERE id = ? AND attempt_id = ?',
      [marks_awarded, marks_awarded > 0, req.user.id, answer_id, req.params.id]
    );

    const [scoreResult] = await connection.query(
      'SELECT SUM(marks_awarded) as total_scored, COUNT(*) as total_answers, SUM(CASE WHEN marks_awarded IS NULL THEN 1 ELSE 0 END) as ungraded FROM exam_answers WHERE attempt_id = ?',
      [req.params.id]
    );
    const { total_scored, ungraded } = scoreResult[0];

    if (Number(ungraded) === 0) {
      const [attemptData] = await connection.query(
        'SELECT ea.total_marks, e.pass_percentage FROM exam_attempts ea JOIN exams e ON ea.exam_id = e.id WHERE ea.id = ?',
        [req.params.id]
      );
      const { total_marks, pass_percentage } = attemptData[0];
      const scorePercent = total_marks > 0 ? Math.round((total_scored / total_marks) * 100) : 0;
      const passed = scorePercent >= pass_percentage;

      await connection.query(
        "UPDATE exam_attempts SET score = ?, auto_score = ?, passed = ?, status = 'graded', pending_manual_review = FALSE WHERE id = ?",
        [scorePercent, total_scored, passed, req.params.id]
      );
      await connection.commit();
      if (passed) {
        await examService.issueCertificate(req.params.id);
        const [attempts] = await connection.query('SELECT student_id, exam_id FROM exam_attempts WHERE id = ?', [req.params.id]);
        if (attempts.length > 0) {
           const [exams] = await connection.query('SELECT course_id FROM exams WHERE id = ?', [attempts[0].exam_id]);
           if (exams.length > 0) {
             const [enrollments] = await connection.query('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [attempts[0].student_id, exams[0].course_id]);
             if (enrollments.length > 0) {
               await autoCompleteLessonForExam(connection, attempts[0].student_id, exams[0].course_id, enrollments[0].id, attempts[0].exam_id);
               await courseCompletionService.validateAndCompleteCourse(attempts[0].student_id, exams[0].course_id, enrollments[0].id);
             }
           }
        }
      }
    } else {
      await connection.commit();
    }

    res.json({ message: 'Answer graded', ungraded_remaining: ungraded > 0 ? ungraded - 1 : 0 });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
});

// ────────────────────────────────────────────────────────────────────────────────
// WILDCARD ROUTES (/:id) — must come AFTER all static /attempts routes
// ────────────────────────────────────────────────────────────────────────────────

// GET /api/exams/:id — single exam details
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const [exams] = await pool.query(`
      SELECT e.*, c.title as course_title, c.tutor_id
      FROM exams e LEFT JOIN courses c ON e.course_id = c.id
      WHERE e.id = ?
    `, [req.params.id]);
    if (exams.length === 0) return res.status(404).json({ message: 'Exam not found' });
    const exam = exams[0];

    if (req.user.role === 'tutor' && exam.tutor_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [questions] = await pool.query(
      'SELECT * FROM exam_questions WHERE exam_id = ? ORDER BY order_index ASC',
      [req.params.id]
    );
    exam.questions = questions.map(q => {
      let parsedOptions = [];
      if (q.options_json) {
        try { parsedOptions = JSON.parse(q.options_json); } catch(e) { console.error('Invalid JSON for question', q.id); }
      }
      return { ...q, options: parsedOptions };
    });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/exams — create exam
router.post('/', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    const {
      course_id, title, duration_minutes, pass_percentage, max_attempts,
      proctoring_enabled, randomize_questions, randomize_options,
      instructions, min_submit_pct, requires_scheduling, show_result_detail, show_results, status,
      proctoring_config
    } = req.body;

    let configStr = null;
    if (proctoring_config) {
      configStr = typeof proctoring_config === 'object' ? JSON.stringify(proctoring_config) : proctoring_config;
    }

    const id = uuidv4();
    await pool.query(`
      INSERT INTO exams 
        (id, course_id, title, duration_minutes, pass_percentage, max_attempts,
         proctoring_enabled, randomize_questions, randomize_options, instructions,
         min_submit_pct, requires_scheduling, show_result_detail, show_results, status, proctoring_config, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, course_id || null, title,
      duration_minutes || 60, pass_percentage || 60, max_attempts || 2,
      proctoring_enabled || false, randomize_questions || false, randomize_options || false,
      instructions || null, min_submit_pct || 50, requires_scheduling || false,
      show_result_detail !== false, show_results !== false, status || 'draft', configStr, req.user.id
    ]);
    res.status(201).json({ id, message: 'Exam created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/exams/:id — update exam settings
router.put('/:id', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    const fields = [
      'title','course_id','duration_minutes','pass_percentage','max_attempts','proctoring_enabled',
      'randomize_questions','randomize_options','instructions','min_submit_pct',
      'requires_scheduling','show_result_detail','show_results','status', 'proctoring_config'
    ];
    const updates = fields.filter(f => req.body[f] !== undefined);
    if (updates.length === 0) return res.json({ message: 'Nothing to update' });

    // Ownership check for tutors
    if (req.user.role === 'tutor') {
      const [exam] = await pool.query(
         'SELECT c.tutor_id FROM exams e LEFT JOIN courses c ON e.course_id = c.id WHERE e.id = ?',
        [req.params.id]
      );
      if (exam.length === 0 || exam[0].tutor_id !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You do not own this exam' });
      }
    }

    const setClause = updates.map(f => `${f} = ?`).join(', ');
    const values = updates.map(f => {
      const val = req.body[f];
      if (f === 'proctoring_config' && val && typeof val === 'object') {
        return JSON.stringify(val);
      }
      return val;
    });
    await pool.query(`UPDATE exams SET ${setClause} WHERE id = ?`, [...values, req.params.id]);
    res.json({ message: 'Exam updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/exams/:id
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE exams SET deleted_at = NOW(), status = 'archived' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Questions ──────────────────────────────────────────────────────────────────

// POST /api/exams/:id/questions/import (must be before /:id/questions/:qid)
router.post('/:id/questions/import', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    const { lesson_id } = req.body;
    const [quizzes] = await pool.query('SELECT * FROM lesson_quizzes WHERE lesson_id = ?', [lesson_id]);
    if (quizzes.length === 0) return res.status(404).json({ message: 'No quiz found for this lesson' });

    const [existingMax] = await pool.query('SELECT COALESCE(MAX(order_index),0) as max_order FROM exam_questions WHERE exam_id = ?', [req.params.id]);
    let orderIdx = existingMax[0].max_order;

    for (const q of quizzes) {
      orderIdx++;
      await pool.query(
        'INSERT INTO exam_questions (id, exam_id, question_text, type, options_json, correct_answer, marks, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), req.params.id, q.question_text, q.type, q.options_json, q.correct_answer, q.marks || 1, orderIdx]
      );
    }
    res.json({ message: `Imported ${quizzes.length} questions`, count: quizzes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/exams/:id/questions/bulk
router.post('/:id/questions/bulk', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions)) {
      connection.release();
      return res.status(400).json({ message: 'Invalid questions format. Expected an array.' });
    }

    const [maxOrder] = await connection.query('SELECT COALESCE(MAX(order_index),0) as max_order FROM exam_questions WHERE exam_id = ?', [req.params.id]);
    let orderIdx = maxOrder[0].max_order;

    await connection.beginTransaction();
    for (const q of questions) {
      orderIdx++;
      await connection.query(
        'INSERT INTO exam_questions (id, exam_id, question_text, type, options_json, correct_answer, marks, explanation, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), req.params.id, q.question_text, q.type || 'mcq', q.options ? JSON.stringify(q.options) : null, q.correct_answer || null, q.marks || 1, q.explanation || null, orderIdx]
      );
    }
    await connection.commit();
    res.status(201).json({ message: `Imported ${questions.length} questions successfully.` });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
});

// POST /api/exams/:id/questions
router.post('/:id/questions', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    const { question_text, type, options, correct_answer, marks, explanation } = req.body;
    const [maxOrder] = await pool.query('SELECT COALESCE(MAX(order_index),0) as max_order FROM exam_questions WHERE exam_id = ?', [req.params.id]);
    const id = uuidv4();
    await pool.query(
      'INSERT INTO exam_questions (id, exam_id, question_text, type, options_json, correct_answer, marks, explanation, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.params.id, question_text, type, options ? JSON.stringify(options) : null, correct_answer || null, marks || 1, explanation || null, maxOrder[0].max_order + 1]
    );
    res.status(201).json({ id, message: 'Question added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/exams/:id/questions/:qid
router.put('/:id/questions/:qid', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    const { question_text, type, options, correct_answer, marks, explanation, order_index } = req.body;
    await pool.query(
      'UPDATE exam_questions SET question_text=?, type=?, options_json=?, correct_answer=?, marks=?, explanation=?, order_index=? WHERE id=?',
      [question_text, type, options ? JSON.stringify(options) : null, correct_answer || null, marks || 1, explanation || null, order_index || 0, req.params.qid]
    );
    res.json({ message: 'Question updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/exams/:id/questions/:qid
router.delete('/:id/questions/:qid', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM exam_questions WHERE id = ?', [req.params.qid]);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Slots ──────────────────────────────────────────────────────────────────────

// GET /api/exams/:id/slots
router.get('/:id/slots', authenticateJWT, async (req, res) => {
  try {
    const [slots] = await pool.query(
      'SELECT * FROM exam_slots WHERE exam_id = ? AND starts_at > NOW() ORDER BY starts_at ASC',
      [req.params.id]
    );
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/exams/:id/slots
router.post('/:id/slots', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    const { starts_at, capacity } = req.body;
    const id = uuidv4();
    await pool.query(
      'INSERT INTO exam_slots (id, exam_id, starts_at, capacity, created_by) VALUES (?, ?, ?, ?, ?)',
      [id, req.params.id, starts_at, capacity || 1, req.user.id]
    );
    res.status(201).json({ id, message: 'Slot created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/exams/:id/book — student books or starts exam instantly
router.post('/:id/book', authenticateJWT, isStudent, async (req, res) => {
  try {
    const { slot_id } = req.body;
    const studentId = req.user.id;

    const { exam } = await examService.checkEligibility(studentId, req.params.id);

    // Check if there is already an active attempt (scheduled or in_progress)
    const [existingAttempts] = await pool.query(
      "SELECT id FROM exam_attempts WHERE exam_id = ? AND student_id = ? AND status IN ('scheduled', 'in_progress') ORDER BY started_at DESC LIMIT 1",
      [req.params.id, studentId]
    );

    if (existingAttempts.length > 0) {
      return res.status(200).json({ attempt_id: existingAttempts[0].id, message: 'Existing attempt found' });
    }

    if (exam.requires_scheduling && slot_id) {
      const [slots] = await pool.query(
        'SELECT * FROM exam_slots WHERE id = ? AND exam_id = ? AND starts_at > NOW()',
        [slot_id, req.params.id]
      );
      if (slots.length === 0) return res.status(400).json({ message: 'Slot not available' });
      if (slots[0].booked_count >= slots[0].capacity) return res.status(400).json({ message: 'Slot is full' });
      await pool.query('UPDATE exam_slots SET booked_count = booked_count + 1 WHERE id = ?', [slot_id]);
    }

    const attemptId = uuidv4();
    await pool.query(
      "INSERT INTO exam_attempts (id, exam_id, student_id, status) VALUES (?, ?, ?, 'scheduled')",
      [attemptId, req.params.id, studentId]
    );

    res.status(201).json({ attempt_id: attemptId, message: 'Exam booked' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
