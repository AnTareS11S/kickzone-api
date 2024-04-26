import mongoose from 'mongoose';

const stadiumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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
    capacity: {
      type: Number,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
    },
    city: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 300,
    },
    photo: {
      type: String,
      default:
        'https://firebasestorage.googleapis.com/v0/b/futbolistapro.appspot.com/o/avatars%2Fstadium.jpg?alt=media&token=86bfc18b-e2ba-46c5-ab9c-358ec82c7aa0',
    },
    history: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

const Stadium = mongoose.model('Stadium', stadiumSchema);

export default Stadium;
