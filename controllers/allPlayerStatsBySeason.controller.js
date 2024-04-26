import AllPlayerStatsBySeason from '../models/allPlayerStatsBySeason.model.js';
import League from '../models/league.model.js';
import Player from '../models/player.model.js';
import Team from '../models/team.model.js';

export const getAllPlayersGoalsBySeasonAndLeague = async (req, res, next) => {
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

        return {
          name: `${playerInfo.name} ${playerInfo.surname}`,
          playerId: playerInfo._id,
          team: playerTeam.name,
          teamId: playerTeam._id,
          logo: playerTeam.logo,
          goals,
          assists,
          yellowCards,
          redCards,
          cleanSheets,
        };
      }
    );

    const playersStats = await Promise.all(playersStatsPromises);

    res.json(playersStats);
  } catch (error) {
    next(error);
  }
};
