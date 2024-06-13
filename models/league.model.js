import mongoose from 'mongoose';

const leagueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    commissioner: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    bio: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
    },
  },
  { timestamps: true }
);

const League = mongoose.model('League', leagueSchema);

export default League;
