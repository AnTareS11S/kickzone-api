import Notification from '../models/notifications.model.js';

export const updateNotificationCount = async (
  receiverId,
  notificationType,
  senderId,
  postId
) => {
  try {
    let notification = await Notification.findOne({ receiverId });

    if (!notification) {
      notification = new Notification({
        receiverId,
        unreadCount: 0,
        notifications: [],
      });
    }
    const existingNotification = notification.notifications.find(
      (n) =>
        n.senderId.toString() === receiverId &&
        n.postId.toString() === postId &&
        n.type === notificationType
    );

    // Jeśli nie ma jeszcze takiego powiadomienia, dodaj nowe
    if (!existingNotification) {
      notification.unreadCount += 1;
      notification.notifications.push({
        type: notificationType,
        senderId,
        postId: postId,
        isRead: false,
      });
      await notification.save();
    }
    return notification.unreadCount;
  } catch (error) {
    console.error('Error updating notification count:', error);
    throw error;
  }
};
