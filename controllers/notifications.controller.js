import Notification from '../models/notifications.model.js';

export const updateNotificationCount = async (req, res, next) => {
  try {
    const { receiverId } = req.params;

    const { isIncrement, notificationType, senderId, postId } = req.body;

    let notification = await Notification.findOne({ receiverId });

    if (!notification) {
      notification = new Notification({
        receiverId,
        unreadCount: 0,
        notifications: [],
      });
    }

    if (isIncrement) {
      notification.unreadCount += 1;
      notification.notifications.push({
        type: notificationType,
        senderId,
        postId,
        isRead: false,
      });
    } else {
      notification.unreadCount = Math.max(0, notification.unreadCount - 1);
    }

    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const { receiverId } = req.params;

    const notification = await Notification.findOne({ receiverId })
      .populate('notifications.senderId', 'username imageUrl')
      .populate('notifications.postId', 'title');

    res.status(200).json({
      unreadCount: notification?.unreadCount || 0,
      notifications: notification?.notifications || [],
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
