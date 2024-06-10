import mongoose from 'mongoose';

const teamFansSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const TeamFans = mongoose.model('TeamFans', teamFansSchema);

export default TeamFans;
