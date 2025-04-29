import express from 'express';
import { protect, facultyOrAdmin } from '../middleware/authMiddleware.js';
import { 
  createEvent, 
  getEvents, 
  getEventById, 
  showInterest, 
  deleteEvent, 
  updateEvent,
  selectAlumni,
  getSelectionStatus,
  getSelectedAlumni,
  handleStudentRegistration
} from '../controllers/eventController.js';

const router = express.Router();

// Public events routes
router.get('/', protect, getEvents);
router.get('/:id', protect, getEventById);

// Faculty/Admin only routes
router.post('/', protect, facultyOrAdmin, createEvent);
router.put('/:id', protect, facultyOrAdmin, updateEvent);
router.delete('/:id', protect, facultyOrAdmin, deleteEvent);

// Alumni routes
router.put('/:id/interest', protect, showInterest);

// Selection routes
router.post('/:eventId/select-alumni', protect, facultyOrAdmin, selectAlumni);
router.get('/:eventId/selection-status/:alumniId', protect, getSelectionStatus);
router.get('/:eventId/selected-alumni', protect, getSelectedAlumni);

// Student registration route - removed facultyOrAdmin middleware
router.post('/:eventId/student-registration', protect, handleStudentRegistration);

export default router;
