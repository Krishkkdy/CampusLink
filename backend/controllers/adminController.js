import User from '../models/User.js';
import { sendWelcomeEmail, sendGenericEmail } from '../utils/emailService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Event from '../models/Event.js';
import FacultyProfile from '../models/FacultyProfile.js';
import AlumniProfile from '../models/AlumniProfile.js';
import StudentProfile from '../models/StudentProfile.js';

// Add faculty
export const addFaculty = async (req, res) => {
  try {
    const { name, email, password, department, designation } = req.body;
    
    const facultyExists = await User.findOne({ email });
    if (facultyExists) {
      return res.status(400).json({ message: 'Faculty already exists' });
    }

    const faculty = await User.create({
      name,
      email,
      password,
      role: 'faculty',
      profile: {
        basicInfo: {
          department: department,
          designation: designation
        }
      }
    });

    await sendWelcomeEmail(email, password, 'faculty');

    res.status(201).json({
      _id: faculty._id,
      name: faculty.name,
      email: faculty.email,
      role: faculty.role,
      profile: faculty.profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add alumni
export const addAlumni = async (req, res) => {
  try {
    const { name, email, password, profile } = req.body;
    
    const alumniExists = await User.findOne({ email });
    if (alumniExists) {
      return res.status(400).json({ message: 'Alumni already exists' });
    }

    const alumni = await User.create({
      name,
      email,
      password,
      role: 'alumni',
      profile: {
        basicInfo: {
          department: profile.basicInfo.department
        },
        academic: {
          graduationYear: profile.academic.graduationYear
        }
      }
    });

    await sendWelcomeEmail(email, password, 'alumni');

    res.status(201).json({
      _id: alumni._id,
      name: alumni.name,
      email: alumni.email,
      role: alumni.role,
      profile: alumni.profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add student
export const addStudent = async (req, res) => {
  try {
    const { name, email, password, profile } = req.body;
    
    const studentExists = await User.findOne({ email });
    if (studentExists) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
      profile: {
        basicInfo: {
          department: profile.basicInfo.department,
          enrollmentNumber: profile.basicInfo.enrollmentNumber,
          semester: profile.basicInfo.semester
        }
      }
    });

    await sendWelcomeEmail(email, password, 'student');

    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      profile: student.profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add bulk students
export const addStudentsBulk = async (req, res) => {
  try {
    const { students } = req.body;
    
    // Validate input
    if (!Array.isArray(students)) {
      return res.status(400).json({ message: 'Invalid input format' });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const studentData of students) {
      try {
        const studentExists = await User.findOne({ email: studentData.email });
        if (studentExists) {
          results.failed.push({ email: studentData.email, reason: 'Email already exists' });
          continue;
        }

        const student = await User.create({
          name: studentData.name,
          email: studentData.email,
          password: studentData.password,
          role: 'student',
          profile: {
            basicInfo: {
              department: studentData.profile.basicInfo.department,
              enrollmentNumber: studentData.profile.basicInfo.enrollmentNumber,
              semester: studentData.profile.basicInfo.semester
            }
          }
        });

        await sendWelcomeEmail(studentData.email, studentData.password, 'student');
        results.success.push(studentData.email);
      } catch (error) {
        results.failed.push({ email: studentData.email, reason: error.message });
      }
    }

    res.status(201).json({
      message: 'Bulk student creation completed',
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add bulk alumni
export const addAlumniBulk = async (req, res) => {
  try {
    const { alumni } = req.body;
    
    // Validate input
    if (!Array.isArray(alumni)) {
      return res.status(400).json({ message: 'Invalid input format' });
    }

    // Validate required fields for each alumni
    for (const alumniData of alumni) {
      if (!alumniData.name || !alumniData.email || !alumniData.password) {
        return res.status(400).json({ 
          message: 'Missing required fields',
          details: 'Each alumni record must include name, email, and password'
        });
      }
    }

    const results = {
      success: [],
      failed: []
    };

    for (const alumniData of alumni) {
      try {
        const alumniExists = await User.findOne({ email: alumniData.email });
        if (alumniExists) {
          results.failed.push({ email: alumniData.email, reason: 'Email already exists' });
          continue;
        }

        const newAlumni = await User.create({
          name: alumniData.name,
          email: alumniData.email,
          password: alumniData.password,
          role: 'alumni',
          profile: {
            basicInfo: {
              department: alumniData.profile?.basicInfo?.department || ''
            },
            academic: {
              graduationYear: alumniData.profile?.academic?.graduationYear || ''
            }
          }
        });

        await sendWelcomeEmail(alumniData.email, alumniData.password, 'alumni');
        results.success.push(alumniData.email);
      } catch (error) {
        results.failed.push({ email: alumniData.email || 'Unknown', reason: error.message });
      }
    }

    res.status(201).json({
      message: 'Bulk alumni creation completed',
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all faculty
export const getAllFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' })
      .select('-password')
      .lean();

    // Fetch faculty profiles
    const facultyProfiles = await FacultyProfile.find({
      user: { $in: faculty.map(f => f._id) }
    }).lean();

    // Create profile map
    const profileMap = facultyProfiles.reduce((acc, profile) => {
      acc[profile.user.toString()] = profile;
      return acc;
    }, {});

    // Merge faculty data with profiles
    const facultyWithProfiles = faculty.map(user => ({
      ...user,
      profile: profileMap[user._id.toString()] || {
        basicInfo: {},
        academic: {},
        research: {},
        contact: {}
      }
    }));

    res.json(facultyWithProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all alumni
export const getAllAlumni = async (req, res) => {
  try {
    const alumni = await User.find({ role: 'alumni' })
      .select('-password')
      .lean();

    // Fetch alumni profiles
    const alumniProfiles = await AlumniProfile.find({
      user: { $in: alumni.map(a => a._id) }
    }).lean();

    // Create profile map
    const profileMap = alumniProfiles.reduce((acc, profile) => {
      acc[profile.user.toString()] = profile;
      return acc;
    }, {});

    // Merge alumni data with profiles
    const alumniWithProfiles = alumni.map(user => ({
      ...user,
      profile: profileMap[user._id.toString()] || {
        basicInfo: {},
        professional: {},
        academic: {},
        social: {}
      }
    }));

    res.json(alumniWithProfiles);
  } catch (error) {
    res.status (500).json({ message: error.message });
  }
};

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .lean();

    const studentProfiles = await StudentProfile.find({
      user: { $in: students.map(s => s._id) }
    }).lean();

    const profileMap = studentProfiles.reduce((acc, profile) => {
      acc[profile.user.toString()] = profile;
      return acc;
    }, {});

    const studentsWithProfiles = students.map(user => ({
      ...user,
      profile: profileMap[user._id.toString()] || {
        basicInfo: {},
        academic: {},
        social: {}
      }
    }));

    res.json(studentsWithProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Check for admin using either email or username
    const admin = await User.findOne({ 
      email: email || username,
      role: 'admin'
    });

    if (!admin) {
      console.log('Admin not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove faculty
export const removeFaculty = async (req, res) => {
  try {
    const faculty = await User.findOneAndDelete({ 
      _id: req.params.id, 
      role: 'faculty' 
    });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Delete faculty profile
    await FacultyProfile.findOneAndDelete({ user: req.params.id });
    
    // Delete all events created by this faculty
    await Event.deleteMany({ createdBy: req.params.id });

    res.json({ message: 'Faculty, their profile and events removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove alumni
export const removeAlumni = async (req, res) => {
  try {
    const alumni = await User.findOneAndDelete({ 
      _id: req.params.id, 
      role: 'alumni' 
    });

    if (!alumni) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    // Delete alumni profile
    await AlumniProfile.findOneAndDelete({ user: req.params.id });

    res.json({ message: 'Alumni and their profile removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove student
export const removeStudent = async (req, res) => {
  try {
    const student = await User.findOneAndDelete({ 
      _id: req.params.id, 
      role: 'student' 
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await StudentProfile.findOneAndDelete({ user: req.params.id });
    res.json({ message: 'Student and their profile removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send mail
export const sendMail = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized. Admin access required.' });
    }
    
    const { subject, body, recipients } = req.body;
    const emailList = await User.find(
      recipients === 'all' ? {} : { role: recipients }
    ).select('email');

    if (emailList.length === 0) {
      return res.status(404).json({ message: 'No recipients found with the selected criteria' });
    }

    const results = await Promise.all(
      emailList.map(user => 
        sendGenericEmail(user.email, subject, body)
      )
    );

    // Check if any emails failed to send
    const failedCount = results.filter(result => !result).length;
    
    if (failedCount > 0) {
      return res.status(207).json({ 
        message: `${emailList.length - failedCount} emails sent successfully, ${failedCount} failed.` 
      });
    }

    res.status(200).json({ 
      message: `${emailList.length} emails sent successfully`,
      count: emailList.length
    });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ message: error.message });
  }
};
