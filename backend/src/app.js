import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
import publicExamsRoutes from './routes/public-exams.routes.js';
import adminPublicExamsRoutes from './routes/admin.public-exams.routes.js';
import adminAboutRoutes from './routes/admin.about.routes.js';
import adminFormRoutes from './routes/admin.forms.routes.js';
import adminConfigRoutes from './routes/admin.config.routes.js';
import webhookRoutes from './routes/webhooks.routes.js';
import crmRoutes from './routes/crm.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import enrollmentRoutes from './routes/enrollments.routes.js';
import lmsRoutes from './routes/lms.routes.js';
import adminCategoryRoutes from './routes/admin.categories.routes.js';
import studentManagementRoutes from './routes/students.routes.js';
import studentLmsRoutes from './routes/lms.student.routes.js';
import qaRoutes from './routes/lms.qa.routes.js';
import announcementRoutes from './routes/lms.announcements.routes.js';
import messageRoutes from './routes/messages.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import examRoutes from './routes/exam.routes.js';
import proctoringRoutes from './routes/proctoring.routes.js';
import certRoutes from './routes/cert.routes.js';
import employerRoutes from './routes/employer.routes.js';
import employerApplicationsRoutes from './routes/employer.applications.routes.js';
import employerNotificationsRoutes from './routes/employer.notifications.routes.js';
import adminJobsRoutes from './routes/admin.jobs.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import studentPlacementsRoutes from './routes/student.placements.routes.js';
import billingRoutes from './routes/billing.routes.js';
import adminFinanceRoutes from './routes/admin.finance.routes.js';
import offlinePaymentRoutes from './routes/offline-payment.routes.js';
import expenseRoutes from './routes/expenses.routes.js';
import { authenticateJWT, authorizeRoles } from './middleware/auth.js';
import { initFollowupJob } from './jobs/followup-reminder.job.js';
import { initLiveSessionJob } from './jobs/live-session-reminders.job.js';
import { initSocket } from './socket/index.js';
import adminRoutes from './routes/admin.routes.js';
import interviewsRoutes from './routes/interviews.routes.js';
import adminSystemUsersRoutes from './routes/admin.system-users.routes.js';
import adminMasterStandardsRoutes from './routes/admin.master-standards.routes.js';
import liveEventsRoutes from './routes/live-events.routes.js';
import noticeBoardRoutes from './routes/notice-board.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initFollowupJob();
initLiveSessionJob();

const app = express();
const httpServer = createServer(app);
const io = initSocket(httpServer);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://[::1]:3000', 'http://[::1]:3001'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads with explicit CORP header
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 100, // limit each IP to 100 requests per windowMs
  skip: (req) => {
    return process.env.NODE_ENV === 'test' || 
           req.ip === '127.0.0.1' || 
           req.ip === '::1' || 
           req.ip === '::ffff:127.0.0.1';
  }
});
app.use('/api/', limiter);

// Special Rate Limiter for Contact Form
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 submissions per hour
  message: { message: 'Too many contact submissions from this IP, please try again after an hour' }
});
app.use('/api/public/contact', contactLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/public/exams', publicExamsRoutes);
app.use('/api/admin/public-exams', adminPublicExamsRoutes);
app.use('/api/admin/about', adminAboutRoutes);
app.use('/api/admin/forms', adminFormRoutes);
app.use('/api/admin/config', adminConfigRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/enrollments', offlinePaymentRoutes);
app.use('/api/lms', lmsRoutes);
app.use('/api/admin/course-categories', adminCategoryRoutes);
app.use('/api/admin/students', authenticateJWT, authorizeRoles('super_admin', 'crm_agent', 'tutor'), studentManagementRoutes);
app.use('/api/lms/student', authenticateJWT, authorizeRoles('student'), studentLmsRoutes);
app.use('/api/lms/student/placements', studentPlacementsRoutes);
app.use('/api/lms/qa', qaRoutes);
app.use('/api/lms/announcements', announcementRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/proctoring', proctoringRoutes);
app.use('/api/certs', certRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/employers/applications', employerApplicationsRoutes);
app.use('/api/employers/notifications', employerNotificationsRoutes);
app.use('/api/admin', adminJobsRoutes); // Maps to /api/admin/jobs and /api/admin/job-categories
app.use('/api/jobs', jobsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin/finance', adminFinanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/system-users', adminSystemUsersRoutes);
app.use('/api/admin/master-standards', adminMasterStandardsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/live-events', liveEventsRoutes);
app.use('/api/notice-board', noticeBoardRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, io };
export default app;
