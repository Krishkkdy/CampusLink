import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  sendMessage,
  getMessages,
  markAsRead
} from '../controllers/messageController.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:userId', protect, getMessages);
router.put('/:messageId/read', protect, markAsRead);

export default router;
