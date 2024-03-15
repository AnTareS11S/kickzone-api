import Referee from '../models/referee.model.js';

export const addReferee = async (req, res, next) => {
  try {
    const existedReferee = await Referee.findOne({ user: req.body.user });
    if (existedReferee) {
      const updatedReferee = await Referee.findOneAndUpdate(
        { user: req.body.user },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedReferee);
    }
    const newReferee = new Referee(req.body);
    await newReferee.save();
    res.status(201).json(newReferee);
  } catch (error) {
    next(error);
  }
};

export const getRefereeByUserId = async (req, res, next) => {
  try {
    const referee = await Referee.findOne({ user: req.params.id });
    if (!referee) {
      return res.status(404).json({ success: false, message: 'Not found!' });
    }
    res.status(200).json(referee);
  } catch (error) {
    next(error);
  }
};
