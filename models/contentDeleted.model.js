import mongoose from 'mongoose';

const contentDeletedSchema = new mongoose.Schema(
  {
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ['Comment', 'Post'],
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'contentType',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'Inappropriate_content',
        'Harassment',
        'Spam',
        'Misinformation',
        'Hate_speech',
        'Violence',
        'Copyright_infringement',
        'Impersonation',
        'Other',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ContentDeleted = mongoose.model('ContentDeleted', contentDeletedSchema);

export default ContentDeleted;
