import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};


// Add role-based middleware

export const checkRole = (roles) => {

  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {

      return res.status(403).json({ 

        message: 'Not authorized to access this resource'

      });

    }

    next();

  };
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as admin' });
  }
};

export const facultyOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'faculty' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized, faculty/admin only' });
  }
};

export const allowViewAlumni = async (req, res, next) => {
  if (req.user && ['admin', 'faculty', 'alumni'].includes(req.user.role)) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized to view alumni' });
  }
};

export const alumniOnly = (req, res, next) => {
  if (req.user && req.user.role === 'alumni') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized, alumni only' });
  }
};
