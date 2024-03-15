import Coach from '../models/coach.model.js';
import League from '../models/league.model.js';
import Player from '../models/player.model.js';
import Stadium from '../models/stadium.model.js';
import Team from '../models/team.model.js';

export const addTeam = async (req, res, next) => {
  try {
    const newTeam = new Team(req.body);
    console.log(req.body._id);

    await newTeam.save();

    if (req.body.coach) {
      const coach = await Coach.findById(req.body.coach);

      if (coach) {
        coach.currentTeam = newTeam._id;
        coach.teams.push(newTeam._id);
        await coach.save();
      }
    }

    res.status(201).json(newTeam);
  } catch (error) {
    next(error);
  }
};

export const checkTeamName = async (req, res, next) => {
  try {
    const { name, isEdit } = req.body;

    if (isEdit) {
      return res.status(200).json({ success: true });
    }

    const existingTeam = await Team.findOne({ name });

    if (existingTeam) {
      return res.status(200).json({ success: false });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const editTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (team) {
      if (req.body.name && req.body.name !== team.name) {
        const existingTeam = await Team.findOne({ name: req.body.name });
        if (existingTeam) {
          return res
            .status(200)
            .json({ success: false, message: 'Team name already exists!' });
        }
      }

      if (team.coach) {
        const oldCoach = await Coach.findById(team.coach);
        if (oldCoach) {
          oldCoach.teams.pull(team._id);
          await oldCoach.save();
        }
      }

      if (req.body.coach) {
        const newCoach = await Coach.findById(req.body.coach);
        if (newCoach) {
          newCoach.currentTeam = team._id;
          newCoach.teams.push(team._id);
          await newCoach.save();
        }
      }

      const updatedTeam = await Team.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedTeam);
    }
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    const coach = await Coach.findById(team.coach);
    const stadium = await Stadium.findById(team.stadium);
    const league = await League.find({ teams: { $in: [req.params.id] } });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.status(200).json({
      ...team._doc,
      coach: coach
        ? coach.name + ' ' + coach.surname + ':' + coach._id
        : 'No coach',
      stadium: stadium ? stadium.name + ':' + stadium._id : 'No stadium',
      league: league ? league[0].name : 'No league',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().populate('coach');

    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
};

export const addPlayerToTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    const player = await Player.findById(req.body.player);

    if (team) {
      player.currentTeam = team._id;
      player.wantedTeam = null;
      await player.save();
      team.players.push(req.body.player);
      await team.save();

      res.status(200).json(team);
    }
  } catch (error) {
    next(error);
  }
};

export const deletePlayerFromTeam = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    const team = await Team.findById(player.currentTeam);

    if (team) {
      player.currentTeam = null;
      if (!player.teams.includes(team._id)) {
        player.teams.push(team._id);
      }

      await player.save();
      team.players.pull(req.params.id);
      await team.save();

      res.status(200).json(team);
    }
  } catch (error) {
    next(error);
  }
};
