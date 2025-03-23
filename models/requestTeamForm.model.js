import { tr } from 'date-fns/locale';
import mongoose from 'mongoose';

const requestTeamFormSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    coach: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    sponsor: {
      type: String,
      required: false,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    stadium: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
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
      maxlength: 50,
    },
    bio: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 300,
    },
    foundedYear: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const RequestTeamForm = mongoose.model(
  'RequestTeamForm',
  requestTeamFormSchema
);

export default RequestTeamForm;
