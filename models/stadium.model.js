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
    },
    imageUrl: {
      type: String,
      default: 'https://d3awt09vrts30h.cloudfront.net/stadium.jpg',
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
