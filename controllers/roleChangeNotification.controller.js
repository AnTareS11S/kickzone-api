import RoleChangeNotification from '../models/roleChangeNotification.model.js';

export const getRoleChangeNotificationByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const roleChangeNotifications = await RoleChangeNotification.find({
      user: userId,
    });

    res.status(200).json(roleChangeNotifications);
  } catch (error) {
    next(error);
  }
};
