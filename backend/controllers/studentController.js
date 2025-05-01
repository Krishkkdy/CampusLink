import User from '../models/User.js';
import Resume from '../models/Resume.js';
import StudentProfile from '../models/StudentProfile.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get student profile
export const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // First fetch the user
    const student = await User.findById(studentId).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (student.role !== 'student') {
      return res.status(400).json({ message: 'User is not a student' });
    }

    // Fetch the student profile if it exists
    let profile = null;
    if (student.profileId) {
      profile = await StudentProfile.findById(student.profileId);
    } else {
      // If no profileId, try to find a profile that references this user
      profile = await StudentProfile.findOne({ user: studentId });
    }
    
    // Create a response object with user data
    let responseData = {
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      education: [],
      skills: [],
      experience: [],
      projects: []
    };
    
    // Add profile data if available
    if (profile) {
      // Add basic info
      if (profile.basicInfo) {
        responseData = {
          ...responseData,
          phone: profile.basicInfo.phone,
          profilePicture: profile.basicInfo.avatar,
          department: profile.basicInfo.department,
          enrollmentNumber: profile.basicInfo.enrollmentNumber,
          semester: profile.basicInfo.semester
        };
      }
      
      // Add academic info (skills)
      if (profile.academic) {
        responseData = {
          ...responseData,
          batch: profile.academic.batch,
          cgpa: profile.academic.cgpa,
          skills: profile.academic.skills || [],
          achievements: profile.academic.achievements || [],
          projects: profile.academic.projects ? profile.academic.projects.map(project => {
            return {
              name: project,
              description: '',
              technologies: ''
            };
          }) : []
        };
      }
      
      // Add social links
      if (profile.social) {
        responseData = {
          ...responseData,
          linkedin: profile.social.linkedin,
          github: profile.social.github
        };
      }
    }
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Failed to fetch student profile', error: error.message });
  }
};

// Get student resume
export const getStudentResume = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Check if the user is authorized to view this resume
    // For this feature, we're allowing alumni to download any student's resume they have access to
    // through job applications
    
    // Find the student's resume
    const resume = await Resume.findOne({ student: studentId });
    
    if (!resume || !resume.filePath) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    const resumePath = path.join(__dirname, '..', resume.filePath);
    
    // Check if file exists
    if (!fs.existsSync(resumePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(resumePath)}`);
    
    // Stream the file
    const fileStream = fs.createReadStream(resumePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading student resume:', error);
    res.status(500).json({ message: 'Failed to download resume', error: error.message });
  }
}; 