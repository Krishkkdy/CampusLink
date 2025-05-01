import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import Message from './models/Message.js';
import User from './models/User.js';  // Add User model import
import resumeRoutes from './routes/resumeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import jobPostingRoutes from './routes/jobPostingRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));

app.use(express.json());

app.use('/uploads', express.static('uploads'));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Connect to MongoDB
connectDB();


// Serve uploaded files

app.use('/uploads', express.static('uploads'));

// Socket.IO connection handling
const userSockets = new Map(); // Store user socket mappings

const canSendMessage = async (fromId, toId) => {
  try {
    const [sender, receiver] = await Promise.all([
      User.findById(fromId).select('role'),
      User.findById(toId).select('role')
    ]);

    if (!sender || !receiver) {
      return false;
    }

    // Check if there's an existing conversation for student-alumni chat
    if (sender.role === 'student' && receiver.role === 'alumni') {
      const existingMessage = await Message.findOne({
        $or: [
          { sender: toId, receiver: fromId },
          { sender: fromId, receiver: toId }
        ]
      });
      
      // Student can only send if alumni has sent a message first
      return existingMessage && existingMessage.sender.toString() === toId;
    }

    // Define allowed message flows
    const allowedMessageFlows = {
      faculty: ['alumni', 'faculty'], // Faculty can message alumni and other faculty
      alumni: ['faculty', 'student'], // Alumni can message faculty and students
      student: ['alumni']  // Students can reply to alumni only if conversation exists
    };

    const allowedRecipients = allowedMessageFlows[sender.role] || [];
    return allowedRecipients.includes(receiver.role);
  } catch (error) {
    console.error('Error checking message permissions:', error);
    return false;
  }
};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('login', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  socket.on('private message', async (data) => {
    try {
      console.log('Received message:', data); // Debug log

      if (!data.from || !data.to || !data.content) {
        throw new Error('Invalid message data');
      }

      // Check if sender has permission to message receiver
      const canSend = await canSendMessage(data.from, data.to);
      if (!canSend) {
        throw new Error('You do not have permission to send messages to this user');
      }

      // Create new message
      const message = await Message.create({
        sender: data.from,
        receiver: data.to,
        content: data.content
      });

      // Populate sender and receiver details
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name')
        .populate('receiver', 'name');

      // Send to recipient only through their socket
      const recipientSocket = userSockets.get(data.to);
      if (recipientSocket) {
        io.to(recipientSocket).emit('new message', populatedMessage);
      }

      // Send confirmation only to sender's socket
      socket.emit('message sent', populatedMessage);

    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('message error', error.message);
    }
  });

  socket.on('disconnect', () => {
    // Remove user socket mapping
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/jobs', jobPostingRoutes);
app.use('/api/students', studentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Update server startup
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
