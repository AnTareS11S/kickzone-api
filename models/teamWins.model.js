import mongoose from 'mongoose';

const teamWindsSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
    },
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
    },
    wins: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const TeamWins = mongoose.model('TeamWins', teamWindsSchema);

export default TeamWins;
