import mongoose from 'mongoose';

const alumniProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  basicInfo: {
    phone: String,
    location: String,
    avatar: String,
    department: String
  },
  professional: {
    currentCompany: String,
    designation: String,
    experience: String,
    skills: [String],
    achievements: [String]
  },
  academic: {
    graduationYear: String,
    degree: String,
    specialization: String,
    qualifications: [String],
    subjects: [String]
  },
  social: {
    linkedin: String,
    github: String,
    website: String
  }
}, {
  timestamps: true
});

export default mongoose.model('AlumniProfile', alumniProfileSchema);
