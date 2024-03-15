import mongoose from 'mongoose';

const playerStatsSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
      unique: true,
    },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
    },
    appearances: {
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

const PlayerStats = mongoose.model('PlayerStats', playerStatsSchema);

export default PlayerStats;
