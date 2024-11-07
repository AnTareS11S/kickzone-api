import mongoose from 'mongoose';

const trainingNotificationsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const TrainingNotifications = mongoose.model(
  'TrainingNotifications',
  trainingNotificationsSchema
);

export default TrainingNotifications;
