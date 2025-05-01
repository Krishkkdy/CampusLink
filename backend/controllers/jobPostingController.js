import JobPosting from '../models/JobPosting.js';
import User from '../models/User.js';

// Create a new job posting
export const createJobPosting = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verify user is an alumni
    const user = await User.findById(userId);
    if (!user || user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can post jobs' });
    }

    const jobData = {
      ...req.body,
      postedBy: userId
    };

    const newJobPosting = new JobPosting(jobData);
    const savedJob = await newJobPosting.save();

    res.status(201).json(savedJob);
  } catch (error) {
    console.error('Error creating job posting:', error);
    res.status(500).json({ message: 'Failed to create job posting', error: error.message });
  }
};

// Get all job postings
export const getAllJobPostings = async (req, res) => {
  try {
    const { active } = req.query;
    let query = {};
    
    // If active parameter is provided, filter by isActive
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const jobPostings = await JobPosting.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(jobPostings);
  } catch (error) {
    console.error('Error fetching job postings:', error);
    res.status(500).json({ message: 'Failed to fetch job postings', error: error.message });
  }
};

// Get job postings created by specific alumni
export const getAlumniJobPostings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { populate } = req.query;
    
    let query = JobPosting.find({ postedBy: userId }).sort({ createdAt: -1 });
    
    // Populate applicant data if populate=true
    if (populate === 'true') {
      query = query.populate('applicants.student', 'name email');
    }
    
    const jobPostings = await query;
    
    res.json(jobPostings);
  } catch (error) {
    console.error('Error fetching alumni job postings:', error);
    res.status(500).json({ message: 'Failed to fetch job postings', error: error.message });
  }
};

// Get a specific job posting by ID
export const getJobPostingById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const jobPosting = await JobPosting.findById(jobId)
      .populate('postedBy', 'name email')
      .populate('applicants.student', 'name email');
    
    if (!jobPosting) {
      return res.status(404).json({ message: 'Job posting not found' });
    }
    
    res.json(jobPosting);
  } catch (error) {
    console.error('Error fetching job posting:', error);
    res.status(500).json({ message: 'Failed to fetch job posting', error: error.message });
  }
};

// Update a job posting
export const updateJobPosting = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    
    // Find the job posting
    const jobPosting = await JobPosting.findById(jobId);
    
    if (!jobPosting) {
      return res.status(404).json({ message: 'Job posting not found' });
    }
    
    // Check if the user is the owner of the job posting
    if (jobPosting.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this job posting' });
    }
    
    // Update the job posting
    const updatedJobPosting = await JobPosting.findByIdAndUpdate(
      jobId,
      { $set: req.body },
      { new: true }
    );
    
    res.json(updatedJobPosting);
  } catch (error) {
    console.error('Error updating job posting:', error);
    res.status(500).json({ message: 'Failed to update job posting', error: error.message });
  }
};

// Delete a job posting
export const deleteJobPosting = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    
    // Find the job posting
    const jobPosting = await JobPosting.findById(jobId);
    
    if (!jobPosting) {
      return res.status(404).json({ message: 'Job posting not found' });
    }
    
    // Check if the user is the owner of the job posting
    if (jobPosting.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this job posting' });
    }
    
    await JobPosting.findByIdAndDelete(jobId);
    
    res.json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    console.error('Error deleting job posting:', error);
    res.status(500).json({ message: 'Failed to delete job posting', error: error.message });
  }
};

// Apply for a job (for students)
export const applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    
    // Verify user is a student
    const user = await User.findById(userId);
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can apply for jobs' });
    }
    
    const jobPosting = await JobPosting.findById(jobId);
    
    if (!jobPosting) {
      return res.status(404).json({ message: 'Job posting not found' });
    }
    
    // Check if the job is still active
    if (!jobPosting.isActive) {
      return res.status(400).json({ message: 'This job posting is no longer active' });
    }
    
    // Check if the user has already applied
    const alreadyApplied = jobPosting.applicants.some(
      applicant => applicant.student.toString() === userId
    );
    
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    // Add the user to the applicants list
    jobPosting.applicants.push({ student: userId });
    await jobPosting.save();
    
    res.json({ message: 'Applied for job successfully' });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Failed to apply for job', error: error.message });
  }
};

// Update applicant status (for alumni)
export const updateApplicantStatus = async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
    if (!['Pending', 'Reviewed', 'Shortlisted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Find the job posting
    const jobPosting = await JobPosting.findById(jobId);
    
    if (!jobPosting) {
      return res.status(404).json({ message: 'Job posting not found' });
    }
    
    // Check if the user is the owner of the job posting
    if (jobPosting.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update applicant status' });
    }
    
    // Find the applicant in the array
    const applicantIndex = jobPosting.applicants.findIndex(
      applicant => applicant._id.toString() === applicantId
    );
    
    if (applicantIndex === -1) {
      return res.status(404).json({ message: 'Applicant not found' });
    }
    
    // Update the applicant's status
    jobPosting.applicants[applicantIndex].status = status;
    await jobPosting.save();
    
    res.json({ message: `Applicant status updated to ${status}` });
  } catch (error) {
    console.error('Error updating applicant status:', error);
    res.status(500).json({ message: 'Failed to update applicant status', error: error.message });
  }
}; 