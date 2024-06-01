import mongoose from 'mongoose';

const refereeStatsSchema = new mongoose.Schema({
  referee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referee',
    required: true,
  },
  matches: {
    type: Number,
    required: true,
    min: 0,
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
    required: true,
    min: 0,
  },
  redCards: {
    type: Number,
    required: true,
    min: 0,
  },
});

const RefereeStats = mongoose.model('RefereeStats', refereeStatsSchema);

export default RefereeStats;
