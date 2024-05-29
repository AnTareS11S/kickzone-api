import League from '../models/league.model.js';
import Match from '../models/match.model.js';
import MatchStats from '../models/matchStats.model.js';
import PlayerStats from '../models/playerStats.model.js';
import Result from '../models/result.model.js';
import Round from '../models/round.model.js';
import Season from '../models/season.model.js';
import TeamStats from '../models/teamStats.model.js';

export const getRoundByLeagueId = async (req, res, next) => {
  try {
    const rounds = await Round.find({ league: req.params.id });

    const matchesIds = rounds.map((round) => round.matches);

    const matchess = await Match.find({ _id: { $in: matchesIds.flat() } })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .populate('league', 'name')
      .populate('mainReferee', 'name surname')
      .populate('firstAssistantReferee', 'name surname')
      .populate('secondAssistantReferee', 'name surname')
      .select('round')
      .select('startDate'); // Only select the startDate field

    const matchesByRound = rounds.map((round) => {
      const matches = matchess
        .filter((match) => round.matches.includes(match._id.toString()))
        .map(
          ({
            _id,
            homeTeam,
            awayTeam,
            startDate,
            mainReferee,
            firstAssistantReferee,
            secondAssistantReferee,
            ...rest
          }) => ({
            matchId: _id,
            homeTeam: homeTeam.name + ':' + homeTeam._id,
            awayTeam: awayTeam.name + ':' + awayTeam._id,
            mainReferee:
              mainReferee !== null
                ? mainReferee.name +
                  ' ' +
                  mainReferee.surname +
                  ':' +
                  mainReferee._id
                : null,

            firstAssistantReferee:
              firstAssistantReferee !== null
                ? firstAssistantReferee.name +
                  ' ' +
                  firstAssistantReferee.surname +
                  ':' +
                  firstAssistantReferee._id
                : null,

            secondAssistantReferee:
              secondAssistantReferee !== null
                ? secondAssistantReferee?.name +
                  ' ' +
                  secondAssistantReferee?.surname +
                  ':' +
                  secondAssistantReferee?._id
                : null,
            startDate,
            ...rest,
          })
        );

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

export const deleteSchedule = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    const season = await Season.findById(league.season);

    const rounds = await Round.find({ league: req.params.id });
    if (!rounds) {
      return res.status(404).json({ message: 'Rounds not found' });
    }

    const matches = await Match.find({
      league: req.params.id,
      season: season._id,
    });
    if (!matches) {
      return res.status(404).json({ message: 'Matches not found' });
    }

    const deletedResults = await Result.deleteMany({
      match: { $in: matches.map((match) => match._id) },
    });

    const deletedMatchStats = await MatchStats.deleteMany({
      match: { $in: matches.map((match) => match._id) },
    });

    const deletedTeamStats = await TeamStats.deleteMany({
      match: { $in: matches.map((match) => match._id) },
    });

    const deletedMatches = await Match.deleteMany({ league: req.params.id });

    const deletedRounds = await Round.deleteMany({ league: req.params.id });

    res.status(201).json({
      deletedMatches,
      deletedRounds,
      deletedMatchStats,
      deletedResults,
      deletedTeamStats,
    });
  } catch (error) {
    next(error);
  }
};
