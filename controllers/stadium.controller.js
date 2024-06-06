import Stadium from '../models/stadium.model.js';

export const addStadium = async (req, res, next) => {
  try {
    const stadium = await Stadium.create(req.body);
    stadium.save();
    res.status(201).json(stadium);
  } catch (error) {
    next(error);
  }
};

export const getStadiums = async (req, res, next) => {
  try {
    const stadiums = await Stadium.find();

    if (!stadiums) {
      return res
        .status(404)
        .json({ success: false, message: 'No stadiums found!' });
    }

    res.status(200).json(stadiums);
  } catch (error) {
    next(error);
  }
};

export const checkStadiumName = async (req, res, next) => {
  try {
    const { name, id } = req.query;

    const existingStadium = await Stadium.findOne({ name });
    if (existingStadium) {
      if (id && existingStadium._id.toString() === id) {
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
export const editStadium = async (req, res, next) => {
  try {
    const stadium = await Stadium.findById(req.params.id);

    if (stadium) {
      if (req.body.name && req.body.name !== stadium.name) {
        const existingStadium = await Stadium.findOne({ name: req.body.name });
        if (existingStadium) {
          return res
            .status(200)
            .json({ success: false, message: 'Stadium name already exists!' });
        }
      }

      const updatedStadium = await Stadium.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedStadium);
    }
  } catch (error) {
    next(error);
  }
};

export const deleteStadium = async (req, res, next) => {
  try {
    const stadium = await Stadium.findById(req.params.id);
    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }
    await Stadium.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Stadium deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getStadiumById = async (req, res, next) => {
  try {
    const stadium = await Stadium.findById(req.params.stadiumId)
      .populate('Stadium')
      .populate('teams');
    res.status(200).json(stadium);
  } catch (error) {
    next(error);
  }
};
