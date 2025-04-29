import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  basicInfo: {
    phone: String,
    avatar: String,
    department: String,
    enrollmentNumber: String,
    semester: Number
  },
  academic: {
    batch: String,
    cgpa: Number,
    skills: [String],
    achievements: [String],
    projects: [String]
  },
  social: {
    linkedin: String,
    github: String
  }
}, {
  timestamps: true
});

export default mongoose.model('StudentProfile', studentProfileSchema);
