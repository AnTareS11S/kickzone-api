import Notification from '../models/notifications.model.js';
import Training from '../models/training.model.js';
import TrainingNotifications from '../models/trainingNotifications.model.js';

export const updateNotificationCount = async (
  receiverId,
  senderId,
  postId,
  type,
  action,
  notificationId = null
) => {
  try {
    let notification = await Notification.findOne({
      receiverId,
    });
    let result = {
      unreadCount: 0,
      notification: null,
      action,
    };

    if (!notification && action === 'create') {
      notification = await Notification.create({
        receiverId,
        unreadCount: 1,
        notifications: [
          {
            senderId,
            postId,
            type,
            isRead: false,
            createdAt: Date.now(),
          },
        ],
      });

      result.unreadCount = 1;
      result.notification = notification.notifications[0];
      return result;
    }

    switch (action) {
      case 'create':
        // Check for existing similar notification
        const existingNotification = notification.notifications.find(
          (n) =>
            n.senderId.toString() === senderId.toString() &&
            n.postId.toString() === postId.toString() &&
            n.type === type
        );

        if (!existingNotification) {
          const newNotification = {
            senderId,
            postId,
            type,
            isRead: false,
            createdAt: Date.now(),
          };

          await Notification.updateOne(
            { receiverId },
            {
              $inc: { unreadCount: 1 },
              $push: { notifications: newNotification },
            }
          );

          result.notification = newNotification;
          result.unreadCount = (notification.unreadCount || 0) + 1;
        } else {
          result.unreadCount = notification.unreadCount || 0;
        }

        break;

      case 'delete': {
        // Handle unlike or comment deletion
        const notificationToDelete = notification.notifications.find(
          (n) =>
            n.postId.toString() === postId.toString() &&
            n.senderId.toString() === senderId.toString() &&
            n.type === type &&
            !n.isRead
        );

        // Remove notification regardless of read status
        await Notification.updateOne(
          { receiverId },
          {
            $pull: {
              notifications: {
                postId,
                senderId,
                type,
              },
            },
            // Only decrement the counter if we found an unread notification
            ...(notificationToDelete && { $inc: { unreadCount: -1 } }),
          }
        );
        break;
      }
      case 'read':
        if (notificationId) {
          await Notification.updateOne(
            {
              receiverId,
              'notifications._id': notificationId,
              'notifications.isRead': false,
            },
            {
              $set: { 'notifications.$.isRead': true },
              $inc: { unreadCount: -1 },
            }
          );
        }
        break;
      default:
        break;
    }

    // Get updated notification count
    const updatedNotification = await Notification.findOne({ receiverId });
    result.unreadCount = updatedNotification
      ? updatedNotification.unreadCount
      : 0;

    return result;
  } catch (error) {
    console.error('Error updating notification count:', error);
    throw error;
  }
};

export const updateTeamTrainingNotification = async (
  teamId,
  userId,
  trainingId
) => {
  try {
    console.log('teamIddd:', teamId, userId);
    const result = await TrainingNotifications.findOneAndUpdate(
      { teamId, trainingId },
      { $addToSet: { readBy: userId } },
      { new: true }
    );

    await Training.findOneAndUpdate(
      { _id: trainingId },
      { $addToSet: { isRead: userId } }
    );

    return result;
  } catch (error) {
    console.error('Error updating team training notification:', error);
    throw error;
  }
};
