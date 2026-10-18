import express from 'express';
import {
  getPublicEvents,
  getPublicEventByIdOrSlug,
  requestRegistrationOtp,
  registerForEvent
} from '../controllers/events.controller.js';

const router = express.Router();

// GET /api/public/events - List published events
router.get('/', getPublicEvents);

// GET /api/public/events/:identifier - Get single event by id or slug
router.get('/:identifier', getPublicEventByIdOrSlug);

// POST /api/public/events/:id/send-otp - Request OTP for email verification
router.post('/:id/send-otp', requestRegistrationOtp);

// POST /api/public/events/:id/register - Verify OTP and complete candidate registration
router.post('/:id/register', registerForEvent);

export default router;
