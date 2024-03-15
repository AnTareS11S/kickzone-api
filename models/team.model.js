import mongoose from 'mongoose';
const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coach',
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
    logo: {
      type: String,
      default: '',
    },
    bio: { type: String, default: '' },
    yearFounded: { type: Number, required: true },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
    },
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
    },
    city: { type: String, required: true },
    stadium: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium' },
  },
  { timestamps: true }
);

const Team = mongoose.model('Team', teamSchema);

export default Team;
