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
    photo: {
      type: String,
    },
    imageUrl: {
      type: String,
      default:
        'https://d3awt09vrts30h.cloudfront.net/blank-profile-picture.webp',
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
