import mongoose from 'mongoose';

const formationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    positions: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
          minlength: 1,
          maxlength: 30,
        },
        x: {
          type: Number,
          required: true,
        },
        y: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Formation = mongoose.model('Formation', formationSchema);

export default Formation;
