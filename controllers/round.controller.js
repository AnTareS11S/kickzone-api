import AllPlayerStatsBySeason from '../models/allPlayerStatsBySeason.model.js';
import League from '../models/league.model.js';
import Match from '../models/match.model.js';
import MatchStats from '../models/matchStats.model.js';
import PlayerStats from '../models/playerStats.model.js';
import Result from '../models/result.model.js';
import Round from '../models/round.model.js';
import Season from '../models/season.model.js';
import TeamDraws from '../models/teamDraws.model.js';
import TeamGoalsLost from '../models/teamGoalsLost.model.js';
import TeamGoalsScored from '../models/teamGoalsScored.model.js';
import TeamLosses from '../models/teamLosses.model.js';
import TeamRedCards from '../models/teamRedCards.model.js';
import TeamStats from '../models/teamStats.model.js';
import TeamWins from '../models/teamWins.model.js';
import TeamYellowCards from '../models/teamYellowCards.model.js';

export const getRoundByLeagueId = async (req, res, next) => {
  try {
    const rounds = await Round.find({
      league: req.params.id,
      season: req.query.seasonId,
    }).sort({
      startDate: 1,
    });

    const matchesIds = rounds.map((round) => round.matches);

    const fetchedMatches = await Match.find({ _id: { $in: matchesIds.flat() } })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .populate('league', 'name')
      .populate('mainReferee', 'name surname')
      .populate('firstAssistantReferee', 'name surname')
      .populate('secondAssistantReferee', 'name surname')
      .select('round')
      .select('startDate'); // Only select the startDate field

    fetchedMatches.sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );

    const matchesByRound = rounds.map((round) => {
      const matches = fetchedMatches
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

export const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { seasonId } = req.query;

    const league = await League.findById(id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    // Fetch rounds and matches associated with the league and season in parallel
    const [rounds, matches] = await Promise.all([
      Round.find({ league: id, season: seasonId }),
      Match.find({ league: id, season: season._id }),
    ]);

    if (!rounds.length) {
      return res.status(404).json({ message: 'Rounds not found' });
    }

    if (!matches.length) {
      return res.status(404).json({ message: 'Matches not found' });
    }
    // Extract match IDs to use for deletion queries
    const matchIds = matches.map((match) => match._id);
    const commonQuery = { league: id, season: season._id };
    // Perform all deletion operations in parallel
    const deletions = await Promise.all([
      Result.deleteMany({ match: { $in: matchIds } }),
      PlayerStats.deleteMany(commonQuery),
      AllPlayerStatsBySeason.deleteMany(commonQuery),
      MatchStats.deleteMany({ match: { $in: matchIds } }),
      TeamStats.deleteMany({ match: { $in: matchIds } }),
      Match.deleteMany(commonQuery),
      Round.deleteMany(commonQuery),
      TeamWins.deleteMany(commonQuery),
      TeamDraws.deleteMany(commonQuery),
      TeamLosses.deleteMany(commonQuery),
      TeamGoalsScored.deleteMany(commonQuery),
      TeamGoalsLost.deleteMany(commonQuery),
      TeamYellowCards.deleteMany(commonQuery),
      TeamRedCards.deleteMany(commonQuery),
    ]);
    // Destructure results of deletions
    const [
      deletedResults,
      deletedPlayerStats,
      deletedAllPlayerStats,
      deletedMatchStats,
      deletedTeamStats,
      deletedMatches,
      deletedRounds,
      deletedTeamWins,
      deletedTeamDraws,
      deletedTeamLosses,
      deletedTeamGoalsScored,
      deletedTeamGoalsLost,
      deletedTeamYellowCards,
      deletedTeamRedCards,
    ] = deletions;

    res.status(201).json({
      deletedMatches,
      deletedRounds,
      deletedMatchStats,
      deletedResults,
      deletedTeamStats,
      deletedPlayerStats,
      deletedAllPlayerStats,
      deletedTeamWins,
      deletedTeamDraws,
      deletedTeamLosses,
      deletedTeamGoalsScored,
      deletedTeamGoalsLost,
      deletedTeamYellowCards,
      deletedTeamRedCards,
    });
  } catch (error) {
    next(error);
  }
};
