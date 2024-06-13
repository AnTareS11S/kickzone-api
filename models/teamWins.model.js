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
    wins: {
      type: Number,
      trim: true,
      min: 0,
      max: 999,
    },
  },
  { timestamps: true }
);

const TeamWins = mongoose.model('TeamWins', teamWindsSchema);

export default TeamWins;
