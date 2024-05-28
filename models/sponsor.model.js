import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
    },
    website: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Sponsor = mongoose.model('Sponsor', sponsorSchema);

export default Sponsor;
