import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import AlumniProfile from '../models/AlumniProfile.js';
import FacultyProfile from '../models/FacultyProfile.js';
import StudentProfile from '../models/StudentProfile.js';
import { sendResetPasswordEmail } from '../utils/emailService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .select('+password');

    if (user && (await user.matchPassword(password))) {
      // Get profile based on role
      let profile;
      if (user.role === 'alumni') {
        profile = await AlumniProfile.findOne({ user: user._id });
      } else if (user.role === 'faculty') {
        profile = await FacultyProfile.findOne({ user: user._id });
      } else if (user.role === 'student') {
        profile = await StudentProfile.findOne({ user: user._id });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        profile: profile
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile based on role
    const { profile } = req.body;
    let updatedProfile;

    switch (user.role) {
      case 'alumni':
        updatedProfile = await AlumniProfile.findOneAndUpdate(
          { user: user._id },
          { ...profile },
          { new: true, upsert: true }
        );
        break;
      case 'faculty':
        updatedProfile = await FacultyProfile.findOneAndUpdate(
          { user: user._id },
          { ...profile },
          { new: true, upsert: true }
        );
        break;
      case 'student':
        updatedProfile = await StudentProfile.findOneAndUpdate(
          { user: user._id },
          { ...profile },
          { new: true, upsert: true }
        );
        break;
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: updatedProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get profile based on role
    let profile;
    if (user.role === 'alumni') {
      profile = await AlumniProfile.findOne({ user: user._id });
    } else if (user.role === 'faculty') {
      profile = await FacultyProfile.findOne({ user: user._id });
    } else if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    }

    const profileData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: profile || {
        basicInfo: {
          name: user.name,
          email: user.email,
          department: '',
          enrollmentNumber: '',
          semester: '',
          phone: '',
          avatar: ''
        },
        academic: {
          batch: '',
          cgpa: '',
          skills: [],
          achievements: [],
          projects: []
        },
        social: {
          linkedin: '',
          github: ''
        }
      }
    };

    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const getAllAlumni = async (req, res) => {
  try {
    // First get all alumni users
    const alumni = await User.find({ role: 'alumni' })
      .select('-password')
      .lean();

    // Get all alumni profiles
    const alumniProfiles = await AlumniProfile.find({
      user: { $in: alumni.map(a => a._id) }
    }).lean();

    // Create a map for quick profile lookup
    const profileMap = alumniProfiles.reduce((acc, profile) => {
      acc[profile.user.toString()] = profile;
      return acc;
    }, {});

    // Merge user data with profiles
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
    console.error('Error in getAllAlumni:', error);
    res.status(500).json({ message: 'Error fetching alumni profiles', error: error.message });
  }
};

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const receiverId = req.params.id; // ID of user to connect with
    const senderId = req.user._id; // Current user's ID

    // Check if users exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!receiver || !sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if connection already exists
    const existingConnection = receiver.connections?.find(
      conn => conn.user.toString() === senderId.toString()
    );

    if (existingConnection) {
      return res.status(400).json({ 
        message: 'Connection already exists',
        status: existingConnection.status 
      });
    }

    // Add connection request to receiver
    await User.findByIdAndUpdate(receiverId, {
      $push: {
        connections: {
          user: senderId,
          status: 'pending'
        }
      }
    });

    // Add sent status to sender's connections
    await User.findByIdAndUpdate(senderId, {
      $push: {
        connections: {
          user: receiverId,
          status: 'sent'
        }
      }
    });

    res.json({ message: 'Connection request sent successfully' });
  } catch (error) {
    console.error('Error in sendConnectionRequest:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update connection status (accept/reject)
export const updateConnectionStatus = async (req, res) => {
  try {
    const { id: userId, connectionId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update receiver's connection status
    const receiver = await User.findOneAndUpdate(
      { 
        _id: userId,
        'connections.user': connectionId,
        'connections.status': 'pending'
      },
      { 
        $set: { 'connections.$.status': status }
      },
      { new: true }
    );

    if (!receiver) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // If request is accepted, update sender's connection status too
    if (status === 'accepted') {
      await User.findOneAndUpdate(
        { 
          _id: connectionId,
          'connections.user': userId,
          'connections.status': 'sent'
        },
        { 
          $set: { 'connections.$.status': 'accepted' }
        }
      );
    }

    // If rejected, remove the connection from both users
    if (status === 'rejected') {
      await Promise.all([
        User.findByIdAndUpdate(userId, {
          $pull: { connections: { user: connectionId } }
        }),
        User.findByIdAndUpdate(connectionId, {
          $pull: { connections: { user: userId } }
        })
      ]);
    }

    res.json({ 
      message: `Connection request ${status}`,
      updatedConnection: receiver.connections.find(c => 
        c.user.toString() === connectionId
      )
    });
  } catch (error) {
    console.error('Error in updateConnectionStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's connections
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate('connections.user', 'name email profile');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.connections);
  } catch (error) {
    console.error('Error getting connections:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove connection
export const removeConnection = async (req, res) => {
  try {
    const { id: userId, connectionId } = req.params;

    // Remove connection from both users
    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $pull: { connections: { user: connectionId } }
      }),
      User.findByIdAndUpdate(connectionId, {
        $pull: { connections: { user: userId } }
      })
    ]);

    res.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .lean();

    // Get all student profiles
    const studentProfiles = await StudentProfile.find({
      user: { $in: students.map(s => s._id) }
    }).lean();

    // Create a map for quick profile lookup
    const profileMap = studentProfiles.reduce((acc, profile) => {
      acc[profile.user.toString()] = profile;
      return acc;
    }, {});

    // Merge user data with profiles
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
    console.error('Error in getAllStudents:', error);
    res.status(500).json({ message: 'Error fetching student profiles', error: error.message });
  }
};

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
    console.error('Error in getAllFaculty:', error);
    res.status(500).json({ message: 'Error fetching faculty profiles', error: error.message });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await sendResetPasswordEmail(user.email, resetUrl);

  res.json({ message: 'Password reset email sent' });
};

// POST /users/reset-password/:token
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password has been reset' });
};