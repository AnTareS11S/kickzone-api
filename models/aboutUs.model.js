import mongoose from 'mongoose';

const aboutUsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    mission: {
      type: String,
      required: true,
      trim: true,
    },
    whyUs: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const AboutUs = mongoose.model('AboutUs', aboutUsSchema);

export default AboutUs;
