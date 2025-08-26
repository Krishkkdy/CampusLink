import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  let connection;
  try {
    console.log('Connecting to MongoDB...');
    connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing admin if any
    console.log('Checking for existing admin...');
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin already exists. Recreating admin account...');
      await User.deleteOne({ email: 'admin@example.com' });
    }

    // Create new admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com', 
      password: 'admin@123',
      role: 'admin',
      profile: {
        basicInfo: {
          department: 'Administration'
        }
      }
    });

    console.log('\n=================================');
    console.log('✅ Admin created successfully!');
    console.log('=================================');
    console.log('\nUse these credentials to login:');
    console.log('Email:    admin@example.com');
    console.log('Password: admin@123');
    console.log('=================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.disconnect();
      console.log('MongoDB Disconnected');
    }
    process.exit(0);
  }
};

createAdmin();
