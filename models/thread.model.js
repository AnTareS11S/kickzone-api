import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 400,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      model: {
        type: String,
        required: true,
        enum: ['Coach', 'Player'],
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ThreadCategory',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        model: {
          type: String,
          required: true,
          enum: ['Coach', 'Player'],
        },
      },
    ],
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ThreadReply',
      },
    ],
  },
  { timestamps: true }
);

const Thread = mongoose.model('Thread', threadSchema);

export default Thread;
