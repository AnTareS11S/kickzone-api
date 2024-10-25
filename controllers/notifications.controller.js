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
    const { notificationId } = req.body;

    const notification = await Notification.findOne({ receiverId });

    const unreadNotification = notification.notifications.find(
      (n) => n._id.toString() === notificationId
    );

    if (unreadNotification) {
      unreadNotification.isRead = true;
      notification.unreadCount = Math.max(0, notification.unreadCount - 1);
    }

    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    const { senderId, postId, type } = req.body;

    const notification = await Notification.findOne({ receiverId });

    notification.notifications = notification.notifications.filter(
      (n) =>
        !(
          n.senderId.toString() === senderId &&
          n.postId.toString() === postId &&
          n.type === type
        )
    );

    await notification.save();

    res.status(200).json({
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
};
