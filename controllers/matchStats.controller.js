import AllPlayerStatsBySeason from '../models/allPlayerStatsBySeason.model.js';
import Match from '../models/match.model.js';
import MatchStats from '../models/matchStats.model.js';
import PlayerStats from '../models/playerStats.model.js';
import Result from '../models/result.model.js';

export const addMatchStats = async (req, res, next) => {
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
      minutesPlayed,
      matchId,
    } = req.body;

    const existingMatch = await Match.findById(matchId).populate(
      'homeTeam awayTeam'
    );

    const result = await Result.findOne({ match: matchId });

    if (!existingMatch || !result) {
      return res.status(404).json({ message: 'Match or result not found' });
    }

    const team = existingMatch.homeTeam.players.includes(player)
      ? 'homeTeam'
      : 'awayTeam';

    const totalTeamGoals =
      team === 'homeTeam' ? result.homeTeamScore : result.awayTeamScore;

    // Fetch all match stats for the match
    const existingStats = await MatchStats.find({ match: matchId });

    // Calculate total goals for the match
    const totalGoals = existingStats.reduce((acc, curr) => acc + curr.goals, 0);

    const exisitingPlayerStats = await PlayerStats.findOne({
      player,
      season,
    });

    const exisitingAllPlayerStatsBySeason =
      await AllPlayerStatsBySeason.findOne({
        player,
        season,
        league: existingMatch?.league,
      });

    if (exisitingPlayerStats) {
      let isExistingMatchStats = false;
      let existingMatchId = null;
      for (const match of exisitingPlayerStats.matchStats) {
        const matchStats = await MatchStats.findById(match);
        if (matchStats.match.toString() === matchId) {
          isExistingMatchStats = true;
          existingMatchId = match;
        }
      }

      if (isExistingMatchStats) {
        const existingMatchStats = await MatchStats.findOne({
          match: matchId,
          season,
          player,
        });

        // Check if the adjusted total goals exceed the match goals
        if (existingMatchStats) {
          // Calculate the new total goals after subtracting the player's current goals
          const adjustedTotalGoals =
            totalGoals -
            parseInt(existingMatchStats.goals, 10) +
            parseInt(goals, 10);

          // Check if the adjusted total goals exceed the match goals
          if (adjustedTotalGoals > totalTeamGoals) {
            return res
              .status(400)
              .json({ message: 'Goals exceed match goals' });
          }
        }
        let updateFields = {
          goals,
          assists,
          yellowCards,
          redCards,
          ownGoals,
          cleanSheets,
          minutesPlayed,
        };

        const updatedMatchStats = await MatchStats.findOneAndUpdate(
          { _id: existingMatchId },
          { $set: { ...updateFields, match: matchId } },
          { new: true }
        );

        exisitingAllPlayerStatsBySeason.playerStats.pull(
          exisitingPlayerStats._id
        );

        exisitingAllPlayerStatsBySeason.playerStats.push(
          exisitingPlayerStats._id
        );

        await exisitingAllPlayerStatsBySeason.save();

        await updatedMatchStats.save();

        return res.status(201).json(updatedMatchStats);
      } else {
        const matchStats = new MatchStats({
          ...req.body,
          match: matchId,
          season,
          player,
        });

        // Check if the new goals exceed the match goals
        if (totalGoals + parseInt(goals, 10) > totalTeamGoals) {
          return res.status(400).json({ message: 'Goals exceed match goals' });
        }

        exisitingPlayerStats.matchStats.push(matchStats._id);

        await exisitingPlayerStats.save();

        await matchStats.save();

        res.status(201).json(matchStats);
      }
    } else {
      const matchStats = new MatchStats({
        ...req.body,
        match: matchId,
        season,
        player,
      });

      const playerStats = new PlayerStats({
        player,
        season,
        league: existingMatch?.league,
      });

      if (totalGoals + parseInt(goals, 10) > totalTeamGoals) {
        return res.status(400).json({ message: 'Goals exceed match goals' });
      }

      playerStats.matchStats.push(matchStats._id);

      await playerStats.save();

      const allPlayerStatsBySeason = new AllPlayerStatsBySeason({
        player,
        season,
        league: existingMatch?.league,
      });

      allPlayerStatsBySeason.playerStats.push(playerStats._id);

      await allPlayerStatsBySeason.save();

      await matchStats.save();
      res.status(201).json(matchStats);
    }
  } catch (error) {
    next(error);
  }
};

export const removeMatchStatsByMatchId = async (req, res, next) => {
  try {
    const { matchId, player } = req.params;

    const playerStats = await PlayerStats.findOne({ player });

    for (const match of playerStats.matchStats) {
      const matchStats = await MatchStats.findById(match);
      if (matchStats.match.toString() === matchId) {
        await MatchStats.findByIdAndDelete(match);
        playerStats.matchStats.pull(match);
        await playerStats.save();
      }
    }

    res.status(200).json({ message: 'Player stats removed successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMatchStatsByMatchId = async (req, res, next) => {
  try {
    const playerStats = await PlayerStats.findOne({
      player: req.params?.playerId,
    });

    const matchStats = await MatchStats.findOne({
      match: req.params?.id,
      _id: { $in: playerStats?.matchStats },
    });

    res.status(200).json(matchStats);
  } catch (error) {
    next(error);
  }
};
