import express from 'express';
import { pool } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateJWT } from '../middleware/auth.js';
import { getIO } from '../socket/index.js';
import { createNotification } from '../services/notification.service.js';

const router = express.Router();

router.use(authenticateJWT);

// Get conversations list
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user.id;
    const [conversations] = await pool.query(`
      SELECT c.*, 
             u.name as other_participant_name, 
             u.email as other_participant_email,
             (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
             (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND read_at IS NULL) as unread_count
      FROM conversations c
      JOIN users u ON (c.participant_a_id = u.id OR c.participant_b_id = u.id) AND u.id != ?
      WHERE c.participant_a_id = ? OR c.participant_b_id = ?
      ORDER BY c.last_message_at DESC
    `, [userId, userId, userId, userId]);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages for a conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Mark as read
    await pool.query(
      'UPDATE messages SET read_at = NOW() WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL',
      [conversationId, userId]
    );

    const [messages] = await pool.query(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY created_at ASC
    `, [conversationId]);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post a new message
router.post('/:conversationId', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { conversationId } = req.params;
    const { body } = req.body;
    const userId = req.user.id;
    const id = uuidv4();

    await connection.beginTransaction();

    await connection.query(
      'INSERT INTO messages (id, conversation_id, sender_id, body) VALUES (?, ?, ?, ?)',
      [id, conversationId, userId, body]
    );

    await connection.query(
      'UPDATE conversations SET last_message_at = NOW() WHERE id = ?',
      [conversationId]
    );

    // Get the other participant to emit via socket
    const [[conv]] = await connection.query(
      'SELECT participant_a_id, participant_b_id FROM conversations WHERE id = ?',
      [conversationId]
    );
    const recipientId = conv.participant_a_id === userId ? conv.participant_b_id : conv.participant_a_id;

    await connection.commit();

    const io = getIO();
    const messagePayload = { id, conversation_id: conversationId, sender_id: userId, body, created_at: new Date() };
    
    // Emit to conversation room (for people actively viewing the chat)
    io.to(`conv-${conversationId}`).emit('new_message', messagePayload);
    
    // Emit to recipient's personal room (for notification badge update)
    io.to(`user-${recipientId}`).emit('message_received', { conversationId, senderName: req.user.name });

    // Optional: Push Notification / Email if offline (simplified here)
    // createNotification(...)

    res.status(201).json(messagePayload);
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// Start or get conversation
router.post('/start', async (req, res) => {
  try {
    const { otherParticipantId, courseId } = req.body;
    const userId = req.user.id;

    // Check if conversation already exists
    const [existing] = await pool.query(`
      SELECT id FROM conversations 
      WHERE ((participant_a_id = ? AND participant_b_id = ?) OR (participant_a_id = ? AND participant_b_id = ?))
      ${courseId ? 'AND course_id = ?' : ''}
    `, courseId ? [userId, otherParticipantId, otherParticipantId, userId, courseId] : [userId, otherParticipantId, otherParticipantId, userId]);

    if (existing.length > 0) {
      return res.json({ id: existing[0].id });
    }

    const id = uuidv4();
    await pool.query(
      'INSERT INTO conversations (id, participant_a_id, participant_b_id, course_id) VALUES (?, ?, ?, ?)',
      [id, userId, otherParticipantId, courseId]
    );
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
