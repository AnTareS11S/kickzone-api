import mongoose from 'mongoose';

const teamYellowCardsSchema = new mongoose.Schema({
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
  yellowCards: {
    type: Number,
    required: true,
  },
});

const TeamYellowCards = mongoose.model(
  'TeamYellowCards',
  teamYellowCardsSchema
);

export default TeamYellowCards;
