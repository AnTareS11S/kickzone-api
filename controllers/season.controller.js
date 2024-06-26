import League from '../models/league.model.js';
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

export const checkSeasonName = async (req, res, next) => {
  try {
    const { name, id } = req.query;

    const existingSeason = await Season.findOne({ name });
    if (existingSeason) {
      if (id && existingSeason._id.toString() === id) {
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

export const getSeasonByLeagueId = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.leagueId).populate(
      'season'
    );
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    const season = league.season;
    const leagueName = league.name;

    res.status(200).json({ season, leagueName });
  } catch (error) {
    next(error);
  }
};
