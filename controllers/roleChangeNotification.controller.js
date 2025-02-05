import ContentDeleted from '../models/contentDeleted.model.js';
import RoleChangeNotification from '../models/roleChangeNotification.model.js';
import User from '../models/user.model.js';

export const getRoleChangeNotificationByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const roleChangeNotifications = await RoleChangeNotification.find({
      userId,
      isRead: false,
    })
      .sort({ createdAt: -1 })
      .limit(1);

    res.status(200).json(roleChangeNotifications);
  } catch (error) {
    next(error);
  }
};

export const hasRoleChangeNotification = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const notficationExists = await RoleChangeNotification.findOne({
      userId,
      isRead: false,
    });

    const deletedContentNotificationExists = await ContentDeleted.findOne({
      deletedUser: userId,
      isRead: false,
    });

    res.status(200).json({
      hasRoleChangeNotification: !!notficationExists,
      hasDeletedContentNotification: !!deletedContentNotificationExists,
    });
  } catch (error) {
    next(error);
  }
};

export const markRoleChangeNotificationAsRead = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const notficationExists = await RoleChangeNotification.findOneAndUpdate(
      { userId, isRead: false },
      { $set: { isRead: true } },
      { new: true }
    );

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { isRoleChangeNotificationRead: true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ exists: !!notficationExists });
  } catch (error) {
    next(error);
  }
};

export const markContentDeletedNotificationAsRead = async (req, res, next) => {
  try {
    const { userId, notificationId } = req.body;

    const deletedContentNotificationExists =
      await ContentDeleted.findOneAndUpdate(
        { _id: notificationId, deletedUser: userId, isRead: false },
        { $set: { isRead: true } },
        { new: true }
      );

    res.status(200).json({ exists: !!deletedContentNotificationExists });
  } catch (error) {
    next(error);
  }
};
