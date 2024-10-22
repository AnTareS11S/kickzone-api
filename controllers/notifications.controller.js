import Notification from '../models/notifications.model.js';

export const getUnreadNotificationsCount = async (req, res, next) => {
  try {
    const { receiverId } = req.params;

    const notification = await Notification.findOne({ receiverId });

    res.status(200).json({
      unreadCount: notification?.unreadCount || 0,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationsDetails = async (req, res, next) => {
  try {
    const { receiverId } = req.params;

    const notification = await Notification.findOne({
      receiverId,
    }).populate('notifications.senderId', 'username _id imageUrl');

    const sortedNotifications =
      notification?.notifications.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }) || [];

    res.status(200).json({
      notifications: sortedNotifications,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { receiverId } = req.params;

    const notification = await Notification.findOne({ receiverId });

    if (notification) {
      notification.unreadCount = 0;
      notification.notifications.forEach((n) => {
        n.isRead = true;
      });

      await notification.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
