import Notification from '../models/notifications.model.js';

export const updateNotificationCount = async (
  receiverId,
  notificationType,
  senderId,
  postId,
  isDelete
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

    if (isDelete) {
      const notificationsToRemove = notification.notifications.filter(
        (n) => n.postId.toString() === postId.toString() && n.type === 'comment'
      );

      const unreadToRemove = notificationsToRemove.filter(
        (n) => !n.isRead
      ).length;

      notification.unreadCount = Math.max(
        0,
        notification.unreadCount - unreadToRemove
      );

      notification.notifications = notification.notifications.filter(
        (n) =>
          !(n.postId.toString() === postId.toString() && n.type === 'comment')
      );
    } else {
      if (notificationType === 'like') {
        const existingNotification = notification.notifications.find(
          (n) =>
            n.senderId.toString() === senderId.toString() &&
            n.postId.toString() === postId.toString() &&
            n.type === notificationType
        );

        if (!existingNotification) {
          notification.unreadCount += 1;
          notification.notifications.push({
            type: notificationType,
            senderId,
            postId,
            isRead: false,
          });
        } else {
          // Unlike
          const notificationIndex = notification.notifications.findIndex(
            (n) =>
              n.senderId.toString() === senderId.toString() &&
              n.postId.toString() === postId.toString() &&
              n.type === notificationType
          );

          if (notificationIndex !== -1) {
            // Decrease unread count if the notification is unread
            if (!notification.notifications[notificationIndex].isRead) {
              notification.unreadCount = Math.max(
                0,
                notification.unreadCount - 1
              );
            }
            // Remove the notification
            notification.notifications.splice(notificationIndex, 1);
          }
        }
      } else if (notificationType === 'comment') {
        notification.unreadCount += 1;
        notification.notifications.push({
          type: notificationType,
          senderId,
          postId,
          isRead: false,
        });
      }
    }

    await notification.save();
    return notification.unreadCount;
  } catch (error) {
    console.error('Error updating notification count:', error);
    throw error;
  }
};
