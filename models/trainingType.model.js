import mongoose from 'mongoose';

const trainingTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach',
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const TrainingType = mongoose.model('TrainingType', trainingTypeSchema);

export default TrainingType;
