import User from '../models/user.model.js';
import Team from '../models/team.model.js';
import League from '../models/league.model.js';
import Season from '../models/season.model.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const setRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = req.body.role;

    await user.save();
    res.status(200).json({ message: 'Role updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({}).populate('coach').sort({ createdAt: -1 });

    // Get coach name and surname
    const teamsWithCoaches = teams.map((team) => {
      const { name, surname } = team.coach;
      return {
        ...team._doc,
        coach: `${name} ${surname}`,
      };
    });

    res.status(200).json(teamsWithCoaches);
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    await Team.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllLeagues = async (req, res, next) => {
  try {
    const leagues = await League.find({}).populate('teams').sort({ name: 1 });

    if (req.query.season) {
      const leagues = await League.find({ season: req.query.season })
        .populate('teams')
        .sort({ name: 1 });

      return res.status(200).json(leagues);
    }

    const seasons = await Season.find({});

    const seasonMap = seasons.reduce((map, season) => {
      map[season._id.toString()] = season.name;

      return map;
    }, {});

    const leaguesWithSeasonNames = leagues.map((league) => {
      return {
        ...league.toObject(),
        seasonName: seasonMap[league.season.toString()] || 'Unknown Season',
      };
    });

    res.status(200).json(leaguesWithSeasonNames);
  } catch (error) {
    next(error);
  }
};

export const deleteLeague = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    await League.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'League deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getTeamsWithoutLeague = async (req, res, next) => {
  try {
    const teams = await Team.find({});

    if (!teams) {
      return res.status(404).json({ message: 'Teams not found' });
    }

    const filteredTeams = teams.filter((team) => {
      return team.league === null;
    });

    res.status(200).json(filteredTeams);
  } catch (error) {
    next(error);
  }
};

export const getTeamsByIds = async (req, res, next) => {
  try {
    const teamsIds = req.body.teams;

    const teams = await Team.find({ _id: { $in: teamsIds } });

    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
};
