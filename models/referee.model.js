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
        'https://firebasestorage.googleapis.com/v0/b/futbolistapro.appspot.com/o/avatars%2Fblank-profile-picture-973460_960_720.webp?alt=media&token=5779eb88-d84b-46f3-bef6-3c2648a8fc9c',
    },
    bio: { type: String, default: '' },
    nationality: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    city: { type: String, required: true },
    birthDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Referee = mongoose.model('Referee', refereeSchema);

export default Referee;
