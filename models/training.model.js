import mongoose from 'mongoose';

const trainingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    trainingDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      trim: true,
      min: 0,
      max: 999,
    },
    description: {
      type: String,
    },
    trainingType: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'TrainingType',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
    location: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    equipment: {
      type: String,
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach',
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isRead: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
  },
  { timestamps: true }
);

const Training = mongoose.model('Training', trainingSchema);

export default Training;
