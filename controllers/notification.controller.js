export const sendNotification = async (req, res, next) => {
  try {
    const notification = new Notification({
      ...req.body,
    });

    await notification.save();

    res.status(201).json({ notification });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    }).populate('author recipient');

    res.status(200).json({ notifications });
  } catch (error) {
    next(error);
  }
};
