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

    res.status(200).json({ exists: !!notficationExists });
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
