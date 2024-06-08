import mongoose from 'mongoose';

const playerFansSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
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

const PlayerFans = mongoose.model('PlayerFans', playerFansSchema);

export default PlayerFans;
