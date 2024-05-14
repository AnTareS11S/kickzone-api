import mongoose from 'mongoose';

const coachSchema = new mongoose.Schema(
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
    currentTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    photo: {
      type: String,
    },
    imageUrl: {
      type: String,
      default:
        'https://d3awt09vrts30h.cloudfront.net/blank-profile-picture.webp',
    },
    nationality: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    trainings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Training',
      },
    ],
    trainingsTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrainingType',
      },
    ],
    city: { type: String, required: true },
    birthDate: { type: Date, required: true },
    bio: { type: String, default: '' },
  },
  { timestamps: true }
);

const Coach = mongoose.model('Coach', coachSchema);

export default Coach;
