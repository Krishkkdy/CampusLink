import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  sendMessage,
  getMessages,
  markAsRead,
  markAllAsRead
} from '../controllers/messageController.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:userId', protect, getMessages);
router.put('/:messageId/read', protect, markAsRead);
router.put('/read/:userId', protect, markAllAsRead);

export default router;
