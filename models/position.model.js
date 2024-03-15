import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 30,
  },
  shortcut: {
    type: String,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 10,
  },
});

const Position = mongoose.model('Position', positionSchema);

export default Position;
