import mongoose from 'mongoose';

const playerStatsSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
    },
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
    },
    matchStats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MatchStats',
      },
    ],
  },
  { timestamps: true }
);

const PlayerStats = mongoose.model('PlayerStats', playerStatsSchema);

export default PlayerStats;
