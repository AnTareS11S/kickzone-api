import mongoose from 'mongoose';

const refereeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    surname: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],

    photo: {
      type: String,
      default:
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },
    bio: { type: String, default: '' },
    country: { type: String, required: true },
    city: { type: String, required: true },
    birthDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Referee = mongoose.model('Referee', refereeSchema);

export default Referee;
