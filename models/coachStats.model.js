import monogoose from 'mongoose';

const coachStatsSchema = new monogoose.Schema(
  {
    coach: {
      type: monogoose.Schema.Types.ObjectId,
      ref: 'Coach',
      required: true,
    },
    team: {
      type: monogoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    matches: {
      type: Number,
      required: true,
    },
    wins: {
      type: Number,
      required: true,
    },
    draws: {
      type: Number,
      required: true,
    },
    losses: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const CoachStats = monogoose.model('CoachStats', coachStatsSchema);

export default CoachStats;
