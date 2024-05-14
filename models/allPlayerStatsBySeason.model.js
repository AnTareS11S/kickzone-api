import mongoose from 'mongoose';

const allPlayerStatsBySeasonSchema = new mongoose.Schema(
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
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
    },
    playerStats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlayerStats',
      },
    ],
  },
  { timestamps: true }
);

const AllPlayerStatsBySeason = mongoose.model(
  'AllPlayerStatsBySeason',
  allPlayerStatsBySeasonSchema
);

export default AllPlayerStatsBySeason;
