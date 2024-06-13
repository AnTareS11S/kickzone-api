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
    losses: {
      type: Number,
      trim: true,
      min: 0,
      max: 999,
    },
  },
  { timestamps: true }
);

const TeamLosses = mongoose.model('TeamLosses', teamLossesSchema);

export default TeamLosses;
