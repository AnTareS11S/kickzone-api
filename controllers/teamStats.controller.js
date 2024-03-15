import Team from '../models/team.model.js';
import TeamStats from '../models/teamStats.model.js';

const calculatePoints = (teamStats) => {
  const { wins, draws } = teamStats;

  if (wins) {
    return wins * 3 + draws;
  } else {
    return 0;
  }
};

export const addTeamStat = async (req, res, next) => {
  try {
    const { teamId, stat } = req.body;

    // Check if TeamStats document exists for the given teamId
    let teamStats = await TeamStats.findOne({ team: teamId });

    if (!teamStats) {
      // If not, create a new document with default values
      teamStats = new TeamStats({
        team: teamId,
        gamesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      });
    }

    // Increment the value of the specified statistic
    teamStats[stat] = (teamStats[stat] || 0) + 1;

    if (stat === 'goalsFor' || stat === 'goalsAgainst') {
      teamStats.goalDifference = teamStats.goalsFor - teamStats.goalsAgainst;
    }

    teamStats.points = calculatePoints(teamStats);

    // Save or update the TeamStats document
    const updatedTeamStats = await teamStats.save();

    res.status(200).json(updatedTeamStats);
  } catch (error) {
    next(error);
  }
};

export const removeTeamStat = async (req, res, next) => {
  try {
    const { teamId, stat } = req.body;

    const teamStats = await TeamStats.findOne({ team: teamId });

    if (!teamStats) {
      return res.status(404).json({ error: 'Team staistics not found' });
    }

    teamStats[stat] = teamStats[stat] - 1;

    if (stat === 'goalsFor' || stat === 'goalsAgainst') {
      teamStats.goalDifference = teamStats.goalsFor - teamStats.goalsAgainst;
    }

    teamStats.points = calculatePoints(teamStats);

    const updatedTeamStats = await teamStats.save();

    res.status(200).json(updatedTeamStats);
  } catch (error) {
    next(error);
  }
};

export const getTeamStats = async (req, res, next) => {
  try {
    // Fetch all teams and team stats
    const teams = await Team.find({});
    let teamStats = await TeamStats.find({}).sort({ points: -1 });

    // Create a map to easily find teams by ID
    const teamMap = new Map(teams.map((team) => [team._id.toString(), team]));

    // Combine team stats with team names
    teamStats = teamStats.map((teamStat) => {
      const team = teamMap.get(teamStat.team.toString());
      return {
        ...teamStat._doc,
        name: team ? team.name : 'Unknown Team',
      };
    });

    // Add teams without statistics
    const teamsWithoutStats = teams.filter(
      (team) =>
        !teamStats.some(
          (teamStat) => teamStat.team.toString() === team._id.toString()
        )
    );

    teamsWithoutStats.forEach((team) => {
      teamStats.push({
        name: team.name,
        team: team._id,
        gamesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    });

    res.status(200).json(teamStats);
  } catch (error) {
    next(error);
  }
};
