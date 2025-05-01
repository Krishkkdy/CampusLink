import express from 'express';
import { protect, admin, allowViewAlumni } from '../middleware/authMiddleware.js';
import { addFaculty, addAlumni, getAllFaculty, getAllAlumni, adminLogin, removeFaculty, removeAlumni, sendMail, addStudent, getAllStudents, removeStudent, addStudentsBulk, addAlumniBulk } from '../controllers/adminController.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Alumni viewing route - accessible by both faculty and admin
router.get('/alumni', protect, allowViewAlumni, getAllAlumni);

// Protected admin routes
router.use(protect, admin);
router.post('/add-faculty', addFaculty);
router.post('/add-alumni', addAlumni);
router.post('/add-alumni-bulk', addAlumniBulk);
router.delete('/remove-faculty/:id', removeFaculty);
router.delete('/remove-alumni/:id', removeAlumni);
router.get('/faculty', getAllFaculty);
router.post('/send-mail', sendMail);
router.post('/add-student', addStudent);
router.post('/add-students-bulk', addStudentsBulk);
router.get('/students', getAllStudents);
router.delete('/remove-student/:id', removeStudent);

export default router;
