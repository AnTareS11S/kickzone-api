import TeamStats from '../models/teamStats.model.js';
import TeamWins from '../models/teamWins.model.js';
import TeamDraws from '../models/teamDraws.model.js';
import TeamLosses from '../models/teamLosses.model.js';

export const getTeamOutcomes = async (req, res, next) => {
  try {
    const teamStats = await TeamStats.findOne({
      team: req.params.teamId,
      season: req.query.season,
    });

    if (!teamStats) {
      return res.status(404).json({ message: 'Team Stats not found' });
    }

    const teamWins = teamStats.wins;

    const teamDraws = teamStats.draws;

    const teamLosses = teamStats.losses;

    const existingTeamWins = await TeamWins.findOne({
      team: req.params.teamId,
      season: req.query.season,
      league: teamStats.league,
    });

    const existingTeamDraws = await TeamDraws.findOne({
      team: req.params.teamId,
      season: req.query.season,
      league: teamStats.league,
    });

    const existingTeamLosses = await TeamLosses.findOne({
      team: req.params.teamId,
      season: req.query.season,
      league: teamStats.league,
    });

    if (existingTeamWins) {
      existingTeamWins.wins = teamWins;
      await existingTeamWins.save();
    } else {
      await TeamWins.create({
        team: req.params.teamId,
        wins: teamWins,
        season: req.query.season,
        league: teamStats.league,
      });
    }

    if (existingTeamDraws) {
      existingTeamDraws.draws = teamDraws;
      await existingTeamDraws.save();
    } else {
      await TeamDraws.create({
        team: req.params.teamId,
        draws: teamDraws,
        season: req.query.season,
        league: teamStats.league,
      });
    }

    if (existingTeamLosses) {
      existingTeamLosses.losses = teamLosses;
      await existingTeamLosses.save();
    } else {
      await TeamLosses.create({
        team: req.params.teamId,
        losses: teamLosses,
        season: req.query.season,
        league: teamStats.league,
      });
    }

    res.status(200).json({
      wins: teamWins,
      draws: teamDraws,
      losses: teamLosses,
    });
  } catch (error) {
    next(error);
  }
};
