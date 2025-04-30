import express from 'express';
import { protect, checkRole } from '../middleware/authMiddleware.js';
import { sendNotification, getNotifications, markAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.post('/send', protect, checkRole(['faculty', 'admin']), sendNotification);
router.get('/user/:userId', protect, getNotifications);
router.put('/:notificationId/read', protect, markAsRead);

export default router;
