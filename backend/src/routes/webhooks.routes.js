import express from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';

const router = express.Router();

router.get('/whatsapp', WebhookController.verifyWhatsApp);
router.post('/whatsapp', WebhookController.handleWhatsApp);
router.post('/razorpay', WebhookController.handleRazorpay);

export default router;
