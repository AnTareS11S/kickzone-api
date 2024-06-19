import Formation from '../models/formation.model.js';

export const addFormation = async (req, res, next) => {
  try {
    const formation = new Formation(req.body);
    await formation.save();
    res.status(201).json({ message: 'Formation added successfully' });
  } catch (error) {
    next(error);
  }
};

export const getFormations = async (req, res, next) => {
  try {
    const formations = await Formation.find();
    res.status(200).json(formations);
  } catch (error) {
    next(error);
  }
};

export const editFormation = async (req, res, next) => {
  try {
    const formation = await Formation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!formation) {
      return res.status(404).json({ message: 'Formation not found' });
    }

    await formation.save();
    res.status(200).json({ message: 'Formation updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const checkFormationName = async (req, res, next) => {
  try {
    const { name, id } = req.query;

    const existingFormation = await Formation.findOne({ name });
    if (existingFormation) {
      if (id && existingFormation._id.toString() === id) {
        res.status(200).json({ exists: false });
      } else {
        res.status(200).json({ exists: true });
      }
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteFormation = async (req, res, next) => {
  try {
    const formation = await Formation.findById(req.params.id);

    if (!formation) {
      return res.status(404).json({ message: 'Formation not found' });
    }

    await Formation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Formation deleted successfully' });
  } catch (error) {
    next(error);
  }
};
