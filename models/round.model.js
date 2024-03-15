import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    description: {
      type: String,
    },
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
    },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
    },
    matches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
      },
    ],
  },
  { timestamps: true }
);

const Round = mongoose.model('Round', roundSchema);

export default Round;
