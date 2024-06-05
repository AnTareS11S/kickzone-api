import League from '../models/league.model.js';
import Team from '../models/team.model.js';
import TeamStats from '../models/teamStats.model.js';

export const addLeague = async (req, res, next) => {
  try {
    const newLeague = new League(req.body);
    await newLeague.save();
    res.status(201).json(newLeague);
  } catch (error) {
    next(error);
  }
};

export const editLeague = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);

    if (league) {
      if (req.body.name && req.body.name !== league.name) {
        const existingLeague = await League.findOne({ name: req.body.name });
        if (existingLeague) {
          return res
            .status(200)
            .json({ success: false, message: 'League name already exists!' });
        }
      }
      const updatedLeague = await League.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedLeague);
    }
  } catch (error) {
    next(error);
  }
};

export const checkLeagueName = async (req, res, next) => {
  try {
    const { name } = req.query;

    const existingLeague = await League.findOne({ name });

    if (existingLeague) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const addTeamToLeague = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);
    const team = await Team.findById(req.body.teamId);
    if (league) {
      league.teams.push(req.body.teamId);
      await league.save();
      team.league = req.params.id;
      await team.save();

      return res.status(200).json({ message: 'Team added to league' });
    }
  } catch (error) {
    next(error);
  }
};

export const addTeamsToLeague = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);
    if (league) {
      league.teams = req.body.teams;
      await league.save();
      return res.status(200).json({ message: 'Teams added to league' });
    }
  } catch (error) {
    next(error);
  }
};

export const removeTeamFromLeague = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);
    const team = await Team.findById(req.body.teamId);
    if (league) {
      league.teams.pull(req.body.teamId);
      await league.save();

      team.league = null;
      await team.save();

      return res.status(200).json({ message: 'Team removed from league' });
    }
  } catch (error) {
    next(error);
  }
};

export const getStatsByLeagueId = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);

    if (league) {
      const teams = await Team.find({ _id: { $in: league.teams } });
      let teamStats = await TeamStats.find({ team: { $in: league.teams } });

      const teamMap = new Map(teams.map((team) => [team._id.toString(), team]));

      teamStats = teamStats.map((teamStat) => {
        const team = teamMap.get(teamStat.team.toString());
        if (teamStat.logo) {
          teamStat.logoUrl =
            'https://d3awt09vrts30h.cloudfront.net/' + teamStat.logo;
        } else {
          teamStat.logoUrl = null;
        }
        return {
          ...teamStat._doc,
          name: team ? team.name : 'Unknown Team',
          logoUrl: team ? team.logoUrl : '',
        };
      });

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
          logoUrl: team.logoUrl,
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

      teamStats.sort((a, b) => b.points - a.points);

      return res.status(200).json(teamStats);
    }

    res.status(404).json({ message: 'League not found' });
  } catch (error) {
    next(error);
  }
};

export const getTeamsByLeagueId = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    const teams = await Team.find({ league: req.params.id }).populate('league');

    teams.forEach(async (team) => {
      if (team.logo) {
        team.logoUrl = 'https://d3awt09vrts30h.cloudfront.net/' + team.logo;
      } else {
        team.logoUrl = null;
      }
    });

    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
};
