import mongoose from 'mongoose';

const banSchema = new mongoose.Schema(
  {
    bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
        'Impersonation',
        'Other',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Expired', 'Cancelled'],
      default: 'Active',
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
    },
  },
  {
    timestamps: true,
  }
);

const Ban = mongoose.model('Ban', banSchema);

export default Ban;
