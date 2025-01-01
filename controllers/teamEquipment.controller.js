import TeamEquipment from '../models/teamEquipment.model.js';

export const addTeamEquipment = async (req, res, next) => {
  try {
    const teamEquipment = new TeamEquipment({
      team: req.params.teamId,
      ...req.body,
    });
    await teamEquipment.save();
    res.status(201).json({ message: 'Equipment added successfully' });
  } catch (error) {
    next(error);
  }
};

export const getTeamEquipment = async (req, res, next) => {
  try {
    const teamEquipment = await TeamEquipment.find({
      team: req.params.teamId,
    });
    res.status(200).json(teamEquipment);
  } catch (error) {
    next(error);
  }
};

export const editTeamEquipment = async (req, res, next) => {
  try {
    const teamEquipment = await TeamEquipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!teamEquipment) {
      return res.status(404).json({
        message: 'Equipment not found',
      });
    }

    await teamEquipment.save();

    res.status(200).json({
      message: 'Equipment updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeamEquipment = async (req, res, next) => {
  try {
    const teamEquipment = await TeamEquipment.findById(req.params.id);
    if (!teamEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    await TeamEquipment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
