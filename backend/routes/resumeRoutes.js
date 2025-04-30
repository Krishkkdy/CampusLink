import express from 'express';
import multer from 'multer';
import { protect, checkRole, alumniOnly } from '../middleware/authMiddleware.js';
import { 
  submitResume,
  getPendingResumes,
  submitReview,
  getStudentResumes,
  submitFeedback
} from '../controllers/resumeController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Student routes
router.post('/', protect, checkRole(['student']), upload.single('file'), submitResume);
router.get('/student/:studentId', protect, checkRole(['student']), getStudentResumes);

// Alumni routes 
router.get('/pending', protect, checkRole(['alumni']), getPendingResumes);
router.post('/:resumeId/review', protect, checkRole(['alumni']), submitReview);
router.post('/:resumeId/feedback', protect, alumniOnly, submitFeedback);

export default router;
