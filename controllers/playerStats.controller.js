import PlayerStats from '../models/playerStats.model.js';

export const addPlayerStats = async (req, res, next) => {
  try {
    const {
      player,
      season,
      goals,
      assists,
      yellowCards,
      redCards,
      ownGoals,
      cleanSheets,
      isPlayed,
      matchId,
    } = req.body;

    const existingPlayerStats = await PlayerStats.findOne({ player });

    if (existingPlayerStats) {
      let updateFields = {
        goals,
        assists,
        yellowCards,
        redCards,
        ownGoals,
        cleanSheets,
      };

      if (isPlayed && existingPlayerStats.match.toString() !== matchId) {
        updateFields = {
          ...updateFields,
          appearances: existingPlayerStats.appearances + 1,
        };
      }

      await PlayerStats.findOneAndUpdate(
        { player, season },
        { $set: { ...updateFields, match: matchId } },
        { new: true }
      );

      const updatedPlayerStats = await PlayerStats.findOne({ player, season });
      return res.status(200).json(updatedPlayerStats);
    }

    const playerStats = new PlayerStats({
      ...req.body,
      appearances: isPlayed ? 1 : 0,
      match: matchId,
    });

    await playerStats.save();
    res.status(201).json(playerStats);
  } catch (error) {
    next(error);
  }
};

export const editPlayerStats = async (req, res, next) => {
  try {
    const playerStats = await PlayerStats.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    await playerStats.save();

    res.status(201).json(playerStats);
  } catch (error) {
    next(error);
  }
};

export const removePlayerStatsByMatchId = async (req, res, next) => {
  try {
    const { matchId, player } = req.params;

    await PlayerStats.findOneAndDelete({ match: matchId, player });

    res.status(200).json({ message: 'Player stats removed successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPlayerStatsByMatchId = async (req, res, next) => {
  try {
    const playerStats = await PlayerStats.findOne({
      match: req.params.id,
      player: req.params.playerId,
    });

    res.status(200).json(playerStats);
  } catch (error) {
    next(error);
  }
};
