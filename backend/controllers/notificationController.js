import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const sendNotification = async (req, res) => {
  try {
    const { title, message, eventId } = req.body;
    
    // Get sender details including profile
    const sender = await User.findById(req.user._id)
      .populate('profileId')
      .select('name role profile');
    
    // Get all alumni users
    const alumni = await User.find({ role: 'alumni' }).select('_id');
    
    if (!alumni.length) {
      return res.status(404).json({ message: 'No alumni found to notify' });
    }

    const recipients = alumni.map(a => a._id);

    const notification = await Notification.create({
      sender: req.user._id,
      senderName: sender.name,
      senderRole: sender.role,
      senderDepartment: sender.profile?.basicInfo?.department || '',
      recipients,
      title,
      message, 
      eventId: eventId || null
    });

    // Emit socket event for real-time notifications if socket exists
    if (req.app.get('io')) {
      const io = req.app.get('io');
      recipients.forEach(recipientId => {
        const socketId = global.userSockets?.get(recipientId.toString());
        if (socketId) {
          io.to(socketId).emit('notification', notification);
        }
      });
    }

    res.status(201).json({
      success: true,
      notification,
      recipientCount: recipients.length
    });
  } catch (error) {
    console.error('Error in sendNotification:', error);
    res.status(500).json({ 
      message: 'Failed to send notification',
      error: error.message 
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipients: req.params.userId
    })
    .populate('sender', 'name role profile')
    .populate('eventId', 'title date venue')
    .sort('-createdAt')
    .lean();

    // Enhance notifications with full sender details
    const enhancedNotifications = notifications.map(notification => ({
      ...notification,
      senderDetails: {
        name: notification.sender?.name || notification.senderName,
        role: notification.sender?.role || notification.senderRole,
        department: notification.sender?.profile?.basicInfo?.department || notification.senderDepartment
      }
    }));

    res.json(enhancedNotifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
