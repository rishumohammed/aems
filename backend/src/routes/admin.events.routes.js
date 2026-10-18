import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import {
  getAdminEvents,
  getAdminEventById,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  getAdminEventCandidates,
  exportAdminEventCandidatesCsv,
  triggerEventReminderManual
} from '../controllers/events.controller.js';

const router = express.Router();

// Multer Storage Configuration for Event Posters/Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/events';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif|svg/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, webp, gif, svg) are allowed!'));
  }
});

// Role gate
const hasEventAccess = authorizeRoles('super_admin', 'sub_admin', 'lms_user', 'crm_agent');

router.use(authenticateJWT, hasEventAccess);

// List events with candidate counts
router.get('/', getAdminEvents);

// Get single event with full candidates list
router.get('/:id', getAdminEventById);

// Create event
router.post('/', upload.single('image'), createAdminEvent);

// Update event
router.put('/:id', upload.single('image'), updateAdminEvent);

// Delete event
router.delete('/:id', deleteAdminEvent);

// Get candidates inside that event (filterable, searchable)
router.get('/:id/candidates', getAdminEventCandidates);

// Export candidates as CSV
router.get('/:id/candidates/export', exportAdminEventCandidatesCsv);

// Manually trigger 24h reminder emails
router.post('/:id/send-manual-reminder', triggerEventReminderManual);

export default router;
