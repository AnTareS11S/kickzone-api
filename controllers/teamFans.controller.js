import TeamFans from '../models/teamFans.model.js';
import Team from '../models/team.model.js';

export const addTeamFan = async (req, res, next) => {
  try {
    const existingFan = await TeamFans.findOne({
      team: req.params.id,
      user: req.body.userId,
    });

    if (existingFan) {
      return res
        .status(400)
        .json({ message: 'User is already a fan of this team' });
    }

    const teamFan = await TeamFans.create({
      team: req.params.id,
      user: req.body.userId,
    });

    const team = await Team.findById(req.params.id);

    team.fans.push(teamFan._id);

    await team.save();

    res.status(201).json(teamFan);
  } catch (error) {
    next(error);
  }
};

export const checkIsTeamFan = async (req, res, next) => {
  try {
    const teamFan = await TeamFans.findOne({
      team: req.params.id,
      user: req.body.userId,
    });

    res.status(200).json({ isFan: !!teamFan });
  } catch (error) {
    next(error);
  }
};

export const removeTeamFan = async (req, res, next) => {
  try {
    const exisitingFan = await TeamFans.findOne({
      team: req.params.id,
      user: req.body.userId,
    });

    const team = await Team.findById(req.params.id);

    team.fans.pull(exisitingFan._id);

    await team.save();

    await TeamFans.findByIdAndDelete(exisitingFan._id);

    res.status(200).json({ message: 'Team fan removed successfully' });
  } catch (error) {
    next(error);
  }
};
