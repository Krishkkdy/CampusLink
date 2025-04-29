import mongoose from 'mongoose';

const facultyProfileSchema = new mongoose.Schema({
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
    designation: String,
    employeeId: String
  },
  academic: {
    specialization: String,
    qualifications: [String],
    subjects: [String],
    experience: String
  },
  research: {
    publications: [String],
    projects: [String],
    areas: [String]
  },
  contact: {
    officeLocation: String,
    officeHours: String,
    website: String
  }
}, {
  timestamps: true
});

export default mongoose.model('FacultyProfile', facultyProfileSchema);
