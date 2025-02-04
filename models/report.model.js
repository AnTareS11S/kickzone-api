import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ['Comment', 'Post', 'Profile', 'Team', 'Spam', 'Other'],
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
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Under_review', 'Resolved', 'Dismissed'],
      default: 'Pending',
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    actionTaken: {
      type: String,
      enum: ['Warning', 'Content_removed', 'User_suspended', 'No_action'],
    },
    numberOfReports: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
