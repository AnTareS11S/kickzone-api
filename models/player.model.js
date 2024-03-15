import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
    currentTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    wantedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    surname: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    nationality: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
    },
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
      required: true,
    },
    height: {
      type: Number,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    weight: {
      type: Number,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    footed: {
      type: String,
      enum: ['Left', 'Right'],
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    age: {
      type: Number,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    number: {
      type: Number,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    photo: {
      type: String,
      default:
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },

    bio: { type: String, default: '' },
  },
  { timestamps: true }
);

const Player = mongoose.model('Player', playerSchema);

export default Player;
