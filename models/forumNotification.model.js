import mongoose from 'mongoose';

const forumNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Thread',
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    type: {
      type: String,
      required: true,
      enum: ['newThread', 'newComment'],
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const ForumNotification = mongoose.model(
  'ForumNotification',
  forumNotificationSchema
);

export default ForumNotification;
