import Event from '../models/Event.js';
import User from '../models/User.js';
import AlumniProfile from '../models/AlumniProfile.js';
import FacultyProfile from '../models/FacultyProfile.js';
import StudentProfile from '../models/StudentProfile.js';

// Create event
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, studentSeats } = req.body;
    const event = await Event.create({
      title,
      description,
      date,
      venue,
      studentSeats: parseInt(studentSeats) || 0,
      createdBy: req.user._id
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New helper function to clean up expired events
const cleanupExpiredEvents = async () => {
  const currentDate = new Date();
  try {
    await Event.deleteMany({
      date: { $lt: currentDate }
    });
  } catch (error) {
    console.error('Error cleaning up expired events:', error);
  }
};

// Get all events
export const getEvents = async (req, res) => {
  try {
    await cleanupExpiredEvents();
    const currentDate = new Date();
    
    let events = await Event.find()
      .populate({
        path: 'createdBy',
        model: 'User',
        select: 'name email role profile profileModel'
      })
      .populate({
        path: 'interestedUsers',
        model: 'User',
        select: 'name email role profile profileModel'
      })
      .populate({
        path: 'registeredStudents.userId',
        model: 'User',
        select: 'name email role profile profileModel'
      })
      .sort({ date: 1 })
      .lean();

    // Now fetch all profiles separately 
    const userIds = events.reduce((acc, event) => {
      if (event.createdBy) acc.push(event.createdBy._id);
      if (event.interestedUsers) {
        event.interestedUsers.forEach(user => acc.push(user._id));
      }
      if (event.registeredStudents) {
        event.registeredStudents.forEach(reg => reg.userId && acc.push(reg.userId._id));
      }
      return acc;
    }, []);

    // Fetch all profile types
    const [alumniProfiles, facultyProfiles, studentProfiles] = await Promise.all([
      AlumniProfile.find({ user: { $in: userIds } }).lean(),
      FacultyProfile.find({ user: { $in: userIds } }).lean(),
      StudentProfile.find({ user: { $in: userIds } }).lean()
    ]);

    // Create profile maps
    const profileMaps = {
      alumni: alumniProfiles.reduce((acc, p) => ({ ...acc, [p.user.toString()]: p }), {}),
      faculty: facultyProfiles.reduce((acc, p) => ({ ...acc, [p.user.toString()]: p }), {}),
      student: studentProfiles.reduce((acc, p) => ({ ...acc, [p.user.toString()]: p }), {})
    };

    // Merge profiles with users
    events = events.map(event => {
      // Handle createdBy user
      if (event.createdBy) {
        const role = event.createdBy.role;
        event.createdBy.profile = profileMaps[role]?.[event.createdBy._id.toString()];
      }

      // Handle interested users
      if (event.interestedUsers) {
        event.interestedUsers = event.interestedUsers.map(user => ({
          ...user,
          profile: profileMaps[user.role]?.[user._id.toString()]
        }));
      }

      // Handle registered students
      if (event.registeredStudents) {
        event.registeredStudents = event.registeredStudents.map(reg => ({
          ...reg,
          userId: reg.userId ? {
            ...reg.userId,
            profile: profileMaps.student[reg.userId._id.toString()]
          } : null
        }));
      }
      
      return event;
    });

    // Filter events
    events = events.filter(event => {
      const eventDate = new Date(event.date);
      return event.createdBy && eventDate >= currentDate;
    });

    res.json(events);

  } catch (error) {
    console.error('Error in getEvents:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single event
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email profile.basicInfo role')
      .populate({
        path: 'interestedUsers',
        select: 'name email role',
        populate: {
          path: 'profile',
          model: 'AlumniProfile',
          select: 'basicInfo professional academic social'
        }
      });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Show interest in event
export const showInterest = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const userIndex = event.interestedUsers.indexOf(req.user._id);
    if (userIndex > -1) {
      event.interestedUsers.splice(userIndex, 1);
    } else {
      event.interestedUsers.push(req.user._id);
    }

    await event.save();

    // Fetch the updated event with populated data
    const populatedEvent = await Event.findById(event._id)
      .populate({
        path: 'createdBy',
        select: 'name email role profile'
      })
      .populate({
        path: 'interestedUsers',
        select: 'name email role profile'
      });

    res.json(populatedEvent);
  } catch (error) {
    console.error('Error in showInterest:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is authorized to update
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Select alumni for event
export const selectAlumni = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { alumniId, status, globalStatus } = req.body;

    if (globalStatus) {
      // Update status for this alumni in all events
      const events = await Event.find({
        'interestedUsers': alumniId
      });

      await Promise.all(events.map(async (event) => {
        let selectionEntry = event.selectedUsers.find(
          selection => selection.userId.toString() === alumniId
        );

        if (selectionEntry) {
          selectionEntry.status = status;
          selectionEntry.selectionDate = new Date();
        } else {
          event.selectedUsers.push({
            userId: alumniId,
            status: status,
            selectionDate: new Date()
          });
        }

        await event.save();
      }));

      res.json({ message: 'Selection status updated globally', status });
    } else {
      // Original single event update logic
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if alumni is in interested users
      if (!event.interestedUsers.includes(alumniId)) {
        return res.status(400).json({ message: 'Alumni must show interest first' });
      }

      // Update or create selection status
      let selectionEntry = event.selectedUsers.find(
        selection => selection.userId.toString() === alumniId
      );

      if (selectionEntry) {
        selectionEntry.status = status;
        selectionEntry.selectionDate = new Date();
      } else {
        event.selectedUsers.push({
          userId: alumniId,
          status: status,
          selectionDate: new Date()
        });
      }

      await event.save();

      // Send notification to alumni
      if (status === 'selected' || status === 'rejected') {
        // TODO: Implement notification logic here
        const notification = {
          userId: alumniId,
          title: `Event Selection Update`,
          message: `You have been ${status} for the event: ${event.title}`,
          type: 'event_selection'
        };
        
        // Save notification logic here
        // await Notification.create(notification);
      }

      res.json({ message: 'Selection status updated successfully', event });
    }
  } catch (error) {
    console.error('Error in selectAlumni:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get selection status
export const getSelectionStatus = async (req, res) => {
  try {
    const { eventId, alumniId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const selection = event.selectedUsers.find(
      selection => selection.userId.toString() === alumniId
    );

    res.json({ status: selection?.status || 'pending' });
  } catch (error) {
    console.error('Error in getSelectionStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all selected alumni for event
export const getSelectedAlumni = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId)
      .populate({
        path: 'selectedUsers.userId',
        select: 'name email profile',
        populate: {
          path: 'profile',
          model: 'AlumniProfile'
        }
      });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event.selectedUsers);
  } catch (error) {
    console.error('Error in getSelectedAlumni:', error);
    res.status(500).json({ message: error.message });
  }
};

// Handle student registration
export const handleStudentRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { studentId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if student is already registered
    const existingRegistration = event.registeredStudents.find(
      reg => reg.userId.toString() === studentId
    );

    if (existingRegistration) {
      return res.status(400).json({ 
        message: 'Student is already registered for this event'
      });
    }

    // Check if seats are available
    const registeredCount = event.registeredStudents.filter(r => r.status === 'approved').length;
    if (registeredCount >= event.studentSeats) {
      return res.status(400).json({ message: 'No seats available' });
    }

    // Add student registration directly as approved
    event.registeredStudents.push({
      userId: studentId,
      status: 'approved',
      registrationDate: new Date()
    });

    await event.save();
    res.json({ message: 'Registration successful', event });
  } catch (error) {
    console.error('Error in handleStudentRegistration:', error);
    res.status(500).json({ message: error.message });
  }
};
