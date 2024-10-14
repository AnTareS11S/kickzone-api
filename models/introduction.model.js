import monogoose from 'mongoose';

const introductionSchema = new monogoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Introduction = monogoose.model('Introduction', introductionSchema);

export default Introduction;
