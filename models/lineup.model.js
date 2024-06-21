import mongoose from 'mongoose';

const lineupSchema = new mongoose.Schema(
  {
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    formation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Formation',
      required: true,
    },
    players: [
      {
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player',
          required: true,
        },
        position: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Lineup = mongoose.model('Lineup', lineupSchema);

export default Lineup;
