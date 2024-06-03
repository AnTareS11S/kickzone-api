import mongoose from 'mongoose';

const refereeStatsSchema = new mongoose.Schema({
  referee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referee',
    required: true,
  },
  matches: {
    type: Number,
    min: 0,
    default: 0,
  },
  lastMatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
  },
  lastMatchName: {
    type: String,
  },
  yellowCards: {
    type: Number,
    min: 0,
    default: 0,
  },
  redCards: {
    type: Number,
    min: 0,
    default: 0,
  },
});

const RefereeStats = mongoose.model('RefereeStats', refereeStatsSchema);

export default RefereeStats;
