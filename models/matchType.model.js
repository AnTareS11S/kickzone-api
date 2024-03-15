import mongoose from 'mongoose';

const matchTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    color: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const MatchType = mongoose.model('MatchType', matchTypeSchema);

export default MatchType;
