import mongoose from 'mongoose';

const teamDrawsSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
    },
    draws: {
      type: Number,
      trim: true,
      min: 0,
      max: 999,
    },
  },
  { timestamps: true }
);

const TeamDraws = mongoose.model('TeamDraws', teamDrawsSchema);

export default TeamDraws;
