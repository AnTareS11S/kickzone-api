import mongoose from 'mongoose';

const teamRedCardsSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  season: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
  },
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
  },
  redCards: {
    type: Number,
    required: true,
  },
});

const TeamRedCards = mongoose.model('TeamRedCards', teamRedCardsSchema);

export default TeamRedCards;
