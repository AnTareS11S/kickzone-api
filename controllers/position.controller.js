import Position from '../models/position.model.js';

export const addPosition = async (req, res, next) => {
  try {
    const position = new Position(req.body);
    await position.save();
    res.status(201).json({ message: 'Position added successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPositions = async (req, res, next) => {
  try {
    const positions = await Position.find();
    res.status(200).json(positions);
  } catch (error) {
    next(error);
  }
};

export const editPosition = async (req, res, next) => {
  try {
    const position = await Position.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }

    await position.save();
    res.status(200).json({ message: 'Position updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const checkPosition = async (req, res, next) => {
  try {
    const { name, isEdit } = req.body;

    if (isEdit) {
      return res.status(200).json({ success: true });
    }

    const existingPosition = await Position.findOne({ name });

    if (existingPosition) {
      return res.status(200).json({ success: false });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deletePosition = async (req, res, next) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    await Position.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Position deleted successfully' });
  } catch (error) {
    next(error);
  }
};
