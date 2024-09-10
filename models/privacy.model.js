import mongoose from 'mongoose';

const privacySchema = new mongoose.Schema(
  {
    term: { type: String, required: true },
    content: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Privacy = mongoose.model('Privacy', privacySchema);

export default Privacy;
