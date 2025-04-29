import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interestedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true
  }],
  studentSeats: {
    type: Number,
    default: 0
  },
  isSharedWithStudents: {
    type: Boolean,
    default: false
  },
  registeredStudents: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,  
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    }
  }],
  selectedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['selected', 'rejected', 'pending'],
      default: 'pending'
    },
    notificationSent: {
      type: Boolean,
      default: false
    },
    selectionDate: {
      type: Date,
      default: Date.now
    }
  }],
  rejectedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  selectionMessages: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    status: {
      type: String,
      enum: ['accepted', 'rejected']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },  // Enable virtuals
  toObject: { virtuals: true } // Enable virtuals
});

eventSchema.set('strictPopulate', false); // Allow flexible population

const Event = mongoose.model('Event', eventSchema);
export default Event;
