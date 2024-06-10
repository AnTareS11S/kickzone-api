import Player from '../models/player.model.js';
import PlayerFans from '../models/playerFans.model.js';

export const addPlayerFan = async (req, res, next) => {
  try {
    const existingplayerFan = await PlayerFans.findOne({
      player: req.params.id,
      user: req.body.userId,
    });

    if (existingplayerFan) {
      return res
        .status(400)
        .json({ message: 'User is already a fan of this player' });
    }

    const playerFan = await PlayerFans.create({
      player: req.params.id,
      user: req.body.userId,
    });

    const player = await Player.findById(req.params.id);

    player.fans.push(playerFan._id);

    await player.save();

    res.status(201).json(playerFan);
  } catch (error) {
    next(error);
  }
};

export const checkIsPlayerFan = async (req, res, next) => {
  try {
    const playerFan = await PlayerFans.findOne({
      player: req.params.id,
      user: req.body.userId,
    });

    res.status(200).json({ isFan: !!playerFan });
  } catch (error) {
    next(error);
  }
};

export const removePlayerFan = async (req, res, next) => {
  try {
    const exisitingFan = await PlayerFans.findOne({
      player: req.params.id,
      user: req.body.userId,
    });

    const player = await Player.findById(req.params.id);

    player.fans.pull(exisitingFan._id);

    await player.save();

    await PlayerFans.findByIdAndDelete(exisitingFan._id);

    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
