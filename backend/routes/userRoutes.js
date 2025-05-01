import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  login, 
  updateProfile, 
  getProfile, 
  getAllAlumni,
  sendConnectionRequest,
  updateConnectionStatus,
  getUserConnections,
  removeConnection,
  getAllStudents,  // Add this import
  getAllFaculty,  // Add this import
  forgotPassword,
  resetPassword
} from '../controllers/userController.js';
import { sendMail } from '../controllers/adminController.js';


const router = express.Router();

router.post('/login', login);
router.put('/:id/profile', protect, updateProfile);
router.get('/:id/profile', protect, getProfile);
router.get('/alumni', protect, getAllAlumni);
router.post('/:id/connect', protect, sendConnectionRequest);
router.put('/:id/connections/:connectionId', protect, updateConnectionStatus);
router.get('/:id/connections', protect, getUserConnections);
router.delete('/:id/connections/:connectionId', protect, removeConnection);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Add student route
router.get('/students', protect, getAllStudents);
router.get('/faculty', protect, getAllFaculty); // Add this line

// Add admin functionality for users route (admin middleware is applied in the controller)
router.post('/send-email', protect, sendMail);

export default router;
