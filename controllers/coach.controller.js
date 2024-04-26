import Coach from '../models/coach.model.js';
import Country from '../models/country.model.js';
import Team from '../models/team.model.js';

export const createCoach = async (req, res, next) => {
  try {
    const existedCoach = await Coach.findOne({ user: req.body.user });
    if (existedCoach) {
      const updatedCoach = await Coach.findOneAndUpdate(
        { user: req.body.user },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedCoach);
    }
    const newCoach = new Coach(req.body);
    await newCoach.save();
    res.status(201).json(newCoach);
  } catch (error) {
    next(error);
  }
};

export const getCoachByUserId = async (req, res, next) => {
  try {
    const coach = await Coach.findOne({ user: req.params.id });
    console.log(coach);

    if (!coach) {
      return res
        .status(404)
        .json({ success: false, message: 'Coach not found!' });
    }
    res.status(200).json(coach);
  } catch (error) {
    next(error);
  }
};

export const getAllCoaches = async (req, res, next) => {
  try {
    const coaches = await Coach.find();

    if (!coaches) {
      return res
        .status(404)
        .json({ success: false, message: 'No coaches found!' });
    }

    res.status(200).json(coaches);
  } catch (error) {
    next(error);
  }
};

export const deleteCoach = async (req, res, next) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    const teamId = coach.teams;
    if (teamId) {
      const team = await Team.findById(teamId);
      if (team) {
        team.coach = null;
        await team.save();
      }
    }

    await Coach.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Coach deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCoachById = async (req, res, next) => {
  try {
    const coach = await Coach.findById(req.params.id);
    const teams = await Team.find({ coach: req.params.id });

    const nationalityName = await Country.find({
      _id: { $in: coach.nationality },
    });

    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    res.status(200).json({
      ...coach._doc,
      nationality: nationalityName[0].name,
      teams: teams.map((team) => team.name + ':' + team._id),
    });
  } catch (error) {
    next(error);
  }
};
