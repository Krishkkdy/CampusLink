import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createJobPosting,
  getAllJobPostings,
  getAlumniJobPostings,
  getJobPostingById,
  updateJobPosting,
  deleteJobPosting,
  applyForJob,
  updateApplicantStatus
} from '../controllers/jobPostingController.js';

const router = express.Router();

// Create a new job posting (alumni only)
router.post('/', protect, createJobPosting);

// Get all job postings
router.get('/', protect, getAllJobPostings);

// Get job postings created by the logged-in alumni
router.get('/my-postings', protect, getAlumniJobPostings);

// Get a specific job posting by ID
router.get('/:id', protect, getJobPostingById);

// Update a job posting (alumni only)
router.put('/:id', protect, updateJobPosting);

// Delete a job posting (alumni only)
router.delete('/:id', protect, deleteJobPosting);

// Apply for a job (student only)
router.post('/:id/apply', protect, applyForJob);

// Update applicant status (alumni only)
router.put('/:jobId/applicants/:applicantId', protect, updateApplicantStatus);

export default router; 