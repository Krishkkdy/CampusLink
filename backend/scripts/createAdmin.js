import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  let connection;
  try {
    connection = await mongoose.connect(process.env.MONGODB_URI);
    
    // Delete all existing users
    try {
      await User.deleteMany({});
      console.log('Cleared all users from database');
    } catch (error) {
      console.log('Error clearing users:', error.message);
    }

    const password = 'admin123'; // Store password for logging

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: password, // User model will hash this automatically
      role: 'admin',
      profile: {
        basicInfo: {
          department: 'Administration'
        }
      }
    });

    console.log('=================================');
    console.log('Admin created successfully!');
    console.log('Use these credentials to login:');
    console.log('Email:', admin.email);
    console.log('Password:', password); // Log the original password
    console.log('=================================');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.disconnect();
    }
  }
};

createAdmin();
