import mongoose from 'mongoose';

const termSchema = new mongoose.Schema(
  {
    term: { type: String, required: true },
    definition: { type: String, required: true },
  },
  { timestamps: true }
);

const Term = mongoose.model('Term', termSchema);

export default Term;
