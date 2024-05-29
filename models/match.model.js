import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    mainReferee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referee',
      default: null,
    },
    firstAssistantReferee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referee',
      default: null,
    },
    secondAssistantReferee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referee',
      default: null,
    },
    endDate: {
      type: Date,
    },
    duration: {
      type: Number,
      trim: true,
      min: 0,
      max: 999,
    },
    description: {
      type: String,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MatchType',
    },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
    },
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'League',
    },
    location: {
      type: String,
    },
    notes: {
      type: String,
    },
    homeTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    awayTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isResultApproved: {
      type: Boolean,
      default: false,
    },
    round: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Round',
    },
  },
  { timestamps: true }
);

const Match = mongoose.model('Match', matchSchema);

export default Match;
