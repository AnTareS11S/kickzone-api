import mongoose from 'mongoose';

const termSchema = new mongoose.Schema(
  {
    term: { type: String, required: true },
    content: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Term = mongoose.model('Term', termSchema);

export default Term;
