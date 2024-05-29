import AllPlayerStatsBySeason from '../models/allPlayerStatsBySeason.model.js';
import League from '../models/league.model.js';
import Player from '../models/player.model.js';
import Team from '../models/team.model.js';

export const getAllPlayersStatsBySeasonAndLeague = async (req, res, next) => {
  try {
    const { leagueId } = req.params;

    const league = await League.findById(leagueId);

    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    const seasonId = league.season;

    const allPlayerStatsBySeason = await AllPlayerStatsBySeason.find({
      season: seasonId,
      league: leagueId,
    }).populate({
      path: 'playerStats',
      populate: {
        path: 'matchStats',
      },
    });

    const playersStatsPromises = allPlayerStatsBySeason.map(
      async (playerStats) => {
        const goals = playerStats.playerStats.reduce((acc, curr) => {
          return (
            acc + curr.matchStats.reduce((acc, curr) => acc + curr.goals, 0)
          );
        }, 0);

        const assists = playerStats.playerStats.reduce((acc, curr) => {
          return (
            acc + curr.matchStats.reduce((acc, curr) => acc + curr.assists, 0)
          );
        }, 0);

        const yellowCards = playerStats.playerStats.reduce((acc, curr) => {
          return (
            acc +
            curr.matchStats.reduce((acc, curr) => acc + curr.yellowCards, 0)
          );
        }, 0);

        const redCards = playerStats.playerStats.reduce((acc, curr) => {
          return (
            acc + curr.matchStats.reduce((acc, curr) => acc + curr.redCards, 0)
          );
        }, 0);

        const cleanSheets = playerStats.playerStats.reduce((acc, curr) => {
          return (
            acc +
            curr.matchStats.reduce((acc, curr) => acc + curr.cleanSheets, 0)
          );
        }, 0);

        const playerInfo = await Player.findById(playerStats.player);

        const playerTeam = await Team.findById(playerInfo.currentTeam);

        const playerStatistics = {
          name: `${playerInfo.name} ${playerInfo.surname}`,
          playerId: playerInfo._id,
          team: playerTeam.name,
          teamId: playerTeam._id,
          logoUrl: playerTeam.logoUrl,
        };

        if (goals > 0) playerStatistics.goals = goals;
        if (assists > 0) playerStatistics.assists = assists;
        if (yellowCards > 0) playerStatistics.yellowCards = yellowCards;
        if (redCards > 0) playerStatistics.redCards = redCards;
        if (cleanSheets > 0) playerStatistics.cleanSheets = cleanSheets;

        return playerStatistics;
      }
    );

    const playersStats = await Promise.all(playersStatsPromises);

    res.json(playersStats);
  } catch (error) {
    next(error);
  }
};

export const getAllPlayerStatsByPlayerId = async (req, res, next) => {
  try {
    const { playerId } = req.params;

    const playerStats = await AllPlayerStatsBySeason.find({
      player: playerId,
    })
      .populate({
        path: 'playerStats',
        populate: {
          path: 'matchStats',
        },
      })
      .populate('season', 'name');

    const stats = playerStats.map((playerStats) => {
      const goals = playerStats.playerStats.reduce((acc, curr) => {
        return acc + curr.matchStats.reduce((acc, curr) => acc + curr.goals, 0);
      }, 0);

      const assists = playerStats.playerStats.reduce((acc, curr) => {
        return (
          acc + curr.matchStats.reduce((acc, curr) => acc + curr.assists, 0)
        );
      }, 0);

      const yellowCards = playerStats.playerStats.reduce((acc, curr) => {
        return (
          acc + curr.matchStats.reduce((acc, curr) => acc + curr.yellowCards, 0)
        );
      }, 0);

      const redCards = playerStats.playerStats.reduce((acc, curr) => {
        return (
          acc + curr.matchStats.reduce((acc, curr) => acc + curr.redCards, 0)
        );
      }, 0);

      const cleanSheets = playerStats.playerStats.reduce((acc, curr) => {
        return (
          acc + curr.matchStats.reduce((acc, curr) => acc + curr.cleanSheets, 0)
        );
      }, 0);

      const ownGoals = playerStats.playerStats.reduce((acc, curr) => {
        return (
          acc + curr.matchStats.reduce((acc, curr) => acc + curr.ownGoals, 0)
        );
      }, 0);

      const minutesPlayed = playerStats.playerStats.reduce((acc, curr) => {
        return (
          acc +
          curr.matchStats.reduce((acc, curr) => acc + curr.minutesPlayed, 0)
        );
      }, 0);

      return {
        league: playerStats.league,
        season: playerStats.season.name,
        goals,
        assists,
        yellowCards,
        redCards,
        cleanSheets,
        ownGoals,
        minutesPlayed,
      };
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
};
