import mongoose from 'mongoose';

const teamLossesSchema = new mongoose.Schema(
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
    losses: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const TeamLosses = mongoose.model('TeamLosses', teamLossesSchema);

export default TeamLosses;
