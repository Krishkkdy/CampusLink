import express from 'express';
import { getStudentProfile, getStudentResume } from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get student profile
router.get('/:id', protect, getStudentProfile);

// Get student resume
router.get('/:id/resume', protect, getStudentResume);

export default router; 