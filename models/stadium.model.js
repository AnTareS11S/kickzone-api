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
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
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
