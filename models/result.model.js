import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      unique: true,
    },
    homeTeamScore: {
      type: Number,
      required: true,
      trim: true,
      min: 0,
      max: 999,
    },
    awayTeamScore: {
      type: Number,
      required: true,
      trim: true,
      min: 0,
      max: 999,
    },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
      required: true,
    },
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
    },
  },
  { timestamps: true }
);

const Result = mongoose.model('Result', resultSchema);

export default Result;
