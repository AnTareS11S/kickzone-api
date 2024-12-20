import mongoose from 'mongoose';

const trainingNotificationsSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    trainingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Training',
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
  },
  { timestamps: true }
);

const TrainingNotifications = mongoose.model(
  'TrainingNotifications',
  trainingNotificationsSchema
);

export default TrainingNotifications;
