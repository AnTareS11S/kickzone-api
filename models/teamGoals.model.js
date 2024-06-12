import mongoose from 'mongoose';

const teamGoalsSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
    },
    goals: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const TeamGoals = mongoose.model('TeamGoals', teamGoalsSchema);

export default TeamGoals;
