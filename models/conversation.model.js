import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
    deletedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
