import League from '../models/league.model.js';
import Match from '../models/match.model.js';
import Round from '../models/round.model.js';

export const getRoundByLeagueId = async (req, res, next) => {
  try {
    const rounds = await Round.find({ league: req.params.id });

    const matchesIds = rounds.map((round) => round.matches);

    const matchess = await Match.find({ _id: { $in: matchesIds.flat() } })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .populate('league', 'name')
      .select('round')
      .select('startDate'); // Only select the startDate field

    const matchesByRound = rounds.map((round) => {
      const matches = matchess
        .filter((match) => round.matches.includes(match._id.toString()))
        .map(({ _id, homeTeam, awayTeam, startDate, ...rest }) => ({
          matchId: _id,
          homeTeam: homeTeam.name + ':' + homeTeam._id,
          awayTeam: awayTeam.name + ':' + awayTeam._id,
          startDate,
          ...rest,
        }));

      return { ...round._doc, matches };
    });

    res.status(200).json(matchesByRound);
  } catch (error) {
    next(error);
  }
};

export const getRoundById = async (req, res, next) => {
  try {
    const round = await Round.findById(req.params.id);

    if (!round) {
      return res.status(404).json({ message: 'Round not found' });
    }

    const matches = await Match.find({ round: req.params.id })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .populate('league', 'name');

    res.status(200).json({ ...round._doc, matches });
  } catch (error) {
    next(error);
  }
};

export const deleteRoundsAndMatches = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    const rounds = await Round.find({ league: req.params.id });
    if (!rounds) {
      return res.status(404).json({ message: 'Rounds not found' });
    }

    const matches = await Match.find({ league: req.params.id });
    if (!matches) {
      return res.status(404).json({ message: 'Matches not found' });
    }

    const deletedMatches = await Match.deleteMany({ league: req.params.id });

    const deletedRounds = await Round.deleteMany({ league: req.params.id });

    res.status(201).json({ deletedMatches, deletedRounds });
  } catch (error) {
    next(error);
  }
};
