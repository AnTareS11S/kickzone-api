import mongoose from 'mongoose';

const matchStatsSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
    },
    minutesPlayed: {
      type: Number,
      trim: true,
      min: 0,
      max: 999,
    },
    goals: {
      type: Number,
      trim: true,
      min: 0,
      max: 999,
    },
    assists: {
      type: Number,
      trim: true,
      min: 0,
      max: 999,
    },
    yellowCards: {
      type: Number,
      trim: true,
      min: 0,
      max: 999,
    },
    redCards: {
      type: Number,
      trim: true,
      min: 0,
      max: 999,
    },
    ownGoals: {
      type: Number,
      trim: true,
      min: 0,
      max: 999,
    },
    cleanSheets: {
      type: Number,
      trim: true,
      min: 0,
      max: 999,
    },
  },
  { timestamps: true }
);

const MatchStats = mongoose.model('MatchStats', matchStatsSchema);

export default MatchStats;
