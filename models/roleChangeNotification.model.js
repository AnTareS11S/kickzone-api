import mongoose from 'mongoose';

const roleChangeNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      required: true,
      enum: ['player', 'referee', 'coach', 'admin'],
    },
    message: {
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

const RoleChangeNotification = mongoose.model(
  'RoleChangeNotification',
  roleChangeNotificationSchema
);

export default RoleChangeNotification;
