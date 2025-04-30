import Resume from '../models/Resume.js';

export const submitResume = async (req, res) => {
  try {
    const resumeData = JSON.parse(req.body.resumeData);
    const fileUrl = req.file ? `/uploads/resumes/${req.file.filename}` : null;

    const resume = new Resume({
      student: req.user._id,
      ...resumeData,
      fileUrl,
      status: 'pending'
    });

    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ status: 'pending' })
      .populate('student', 'name email profile')
      .sort('-createdAt');

    // Add server URL to file paths
    const baseUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const resumesWithFullUrls = resumes.map(resume => {
      const doc = resume.toObject();
      if (doc.fileUrl) {
        doc.fileUrl = `${baseUrl}${doc.fileUrl}`;
      }
      return doc;
    });

    res.json(resumesWithFullUrls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitReview = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    resume.feedback.push({
      alumni: req.user._id,
      comment: req.body.feedback
    });
    resume.status = 'reviewed';
    
    await resume.save();
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ student: req.params.studentId })
      .populate('feedback.alumni', 'name email profile') // Add profile to populated fields
      .sort('-createdAt');

    // Add server URL to file paths
    const baseUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const resumesWithFullUrls = resumes.map(resume => {
      const doc = resume.toObject();
      if (doc.fileUrl) {
        doc.fileUrl = `${baseUrl}${doc.fileUrl}`;
      }
      return doc;
    });

    res.json(resumesWithFullUrls);
  } catch (error) {
    res.status (500).json({ message: error.message });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { comment, alumniId } = req.body;

    if (!comment || !alumniId) {
      return res.status(400).json({ message: 'Please provide both comment and alumniId' });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Add feedback
    resume.feedback.push({
      alumni: alumniId,
      comment,
      createdAt: new Date()
    });

    // Update resume status
    resume.status = 'reviewed';
    await resume.save();

    res.json({ message: 'Feedback submitted successfully', resume });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
};
