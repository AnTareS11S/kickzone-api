import Season from '../models/season.model.js';

export const addSeason = async (req, res, next) => {
  try {
    const newSeason = new Season(req.body);
    const savedSeason = await newSeason.save();
    res.status(201).json(savedSeason);
  } catch (error) {
    next(error);
  }
};

export const getSeasons = async (req, res, next) => {
  try {
    const seasons = await Season.find();
    res.status(200).json(seasons);
  } catch (error) {
    next(error);
  }
};

export const editSeason = async (req, res, next) => {
  try {
    const season = await Season.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    res.status(200).json(season);
  } catch (error) {
    next(error);
  }
};

export const deleteSeason = async (req, res, next) => {
  try {
    const season = await Season.findByIdAndDelete(req.params.id);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
    res.status(200).json(season);
  } catch (error) {
    next(error);
  }
};
