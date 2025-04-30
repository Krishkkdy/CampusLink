import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  education: [{
    institution: String,
    degree: String,
    year: String
  }],
  experience: [{
    company: String,
    role: String,
    duration: String,
    description: String
  }],
  projects: [{
    name: String,
    description: String,
    technologies: String
  }],
  skills: [String],
  fileUrl: String,
  status: {
    type: String,
    enum: ['draft', 'pending', 'reviewed'],
    default: 'pending'
  },
  feedback: [{
    alumni: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Resume', resumeSchema);
