import mongoose from 'mongoose';

const threadReplySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Thread',
      required: true,
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const ThreadReply = mongoose.model('ThreadReply', threadReplySchema);

export default ThreadReply;
