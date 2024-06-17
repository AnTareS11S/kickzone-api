import mongoose from 'mongoose';

const teamGoalsLostSchema = new mongoose.Schema(
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
    goals: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const TeamGoalsLost = mongoose.model('TeamGoalsLost', teamGoalsLostSchema);

export default TeamGoalsLost;
