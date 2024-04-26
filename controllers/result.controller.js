import Match from '../models/match.model.js';
import Result from '../models/result.model.js';
import TeamStats from '../models/teamStats.model.js';

export const addResult = async (req, res, next) => {
  try {
    const existstingResult = await Result.findOne({ match: req.body.match });

    const result = new Result(req.body);

    const updatedResult = await Result.findOneAndUpdate(
      { match: req.body.match },
      { $set: req.body },
      { new: true }
    );
    if (existstingResult) {
      await updatedResult.save();
    } else {
      await result.save();

      const match = await Match.findOneAndUpdate(
        { _id: req.body.match },
        { isResultApproved: true },
        { new: true }
      );

      await match.save();
    }

    const currentMatch = await Match.findById(req.body.match);
    const homeTeamScore = parseInt(req.body.homeTeamScore);
    const awayTeamScore = parseInt(req.body.awayTeamScore);

    const homeTeam = await currentMatch.populate('homeTeam');
    const awayTeam = await currentMatch.populate('awayTeam');

    const homeTeamStats = new TeamStats({
      team: homeTeam.homeTeam?._id,
      match: req.body.match,
      gamesPlayed: 1,
      wins: homeTeamScore > awayTeamScore ? 1 : 0,
      draws: homeTeamScore === awayTeamScore ? 1 : 0,
      losses: homeTeamScore < awayTeamScore ? 1 : 0,
      goalsFor: homeTeam.goalsFor
        ? parseInt(homeTeam.goalsFor) + parseInt(req.body.homeTeamScore)
        : parseInt(req.body.homeTeamScore),
      goalsAgainst: awayTeamScore,
      goalDifference: homeTeamScore - awayTeamScore,
      points: 0,
    });

    const awayTeamStats = new TeamStats({
      team: awayTeam.awayTeam?._id,
      match: req.body.match,
      gamesPlayed: 1,
      wins: awayTeamScore > homeTeamScore ? 1 : 0,
      draws: awayTeamScore === homeTeamScore ? 1 : 0,
      losses: awayTeamScore < homeTeamScore ? 1 : 0,
      goalsFor: awayTeamScore,
      goalsAgainst: homeTeamScore,
      goalDifference: awayTeamScore - homeTeamScore,
      points: 0,
    });

    if (homeTeamScore > awayTeamScore) {
      homeTeamStats.points = 3;
    } else if (homeTeamScore < awayTeamScore) {
      awayTeamStats.points = 3;
    } else {
      homeTeamStats.points = 1;
      awayTeamStats.points = 1;
    }

    const existingHomeTeamStats = await TeamStats.findOne({
      team: homeTeam.homeTeam?._id,
    });
    const existingAwayTeamStats = await TeamStats.findOne({
      team: awayTeam.awayTeam?._id,
    });

    if (existingHomeTeamStats) {
      const updatedHomeTeamStats = await TeamStats.findOne({
        team: homeTeam.homeTeam?._id,
      });

      if (updatedHomeTeamStats.match.toString() !== req.body.match) {
        updatedHomeTeamStats.match = req.body.match;
        await updatedHomeTeamStats.save();
      }

      const isTheSameMatch =
        updatedHomeTeamStats.match.toString() === req.body.match;

      if (isTheSameMatch) {
        const previousGoalsForFromResult =
          parseInt(existstingResult?.homeTeamScore) || 0;

        const previousGoalsAgainstFromResult =
          parseInt(existstingResult?.awayTeamScore) || 0;

        let isGoalChanged = false;

        if (
          homeTeamScore !== previousGoalsForFromResult ||
          awayTeamScore !== previousGoalsAgainstFromResult ||
          (homeTeamScore === 0 && awayTeamScore === 0)
        ) {
          isGoalChanged = true;
        } else {
          isGoalChanged = false;
        }

        let goalsForSum = existingHomeTeamStats?.goalsFor;
        let goalsAgainstSum = existingHomeTeamStats?.goalsAgainst;
        let winsSum = existingHomeTeamStats?.wins;
        let drawsSum = existingHomeTeamStats?.draws;
        let lossesSum = existingHomeTeamStats?.losses;
        let pointsSum = existingHomeTeamStats?.points;
        const isPreviousWin =
          previousGoalsForFromResult > previousGoalsAgainstFromResult;
        const isPreviousDraw =
          previousGoalsForFromResult === previousGoalsAgainstFromResult;
        const isPreviousLoss =
          previousGoalsForFromResult < previousGoalsAgainstFromResult;

        if (isGoalChanged) {
          goalsForSum =
            existingHomeTeamStats?.goalsFor -
            previousGoalsForFromResult +
            homeTeamScore;
          goalsAgainstSum =
            existingHomeTeamStats?.goalsAgainst -
            previousGoalsAgainstFromResult +
            awayTeamScore;

          if (homeTeamScore > awayTeamScore) {
            if (!existstingResult) {
              winsSum = existingHomeTeamStats?.wins + 1;
              pointsSum = existingHomeTeamStats?.points + 3;
            } else if (isPreviousLoss || isPreviousDraw) {
              winsSum = existingHomeTeamStats?.wins + 1;
              lossesSum =
                isPreviousLoss && existingHomeTeamStats?.losses > 0
                  ? existingHomeTeamStats?.losses - 1
                  : existingHomeTeamStats?.losses;
              drawsSum = isPreviousDraw
                ? existingHomeTeamStats?.draws - 1
                : existingHomeTeamStats?.draws;
              pointsSum = isPreviousLoss
                ? existingHomeTeamStats?.points + 3
                : existingHomeTeamStats?.points + 2;
            } else {
              winsSum = existingHomeTeamStats?.wins;
              pointsSum = existingHomeTeamStats?.points;
            }
          } else if (homeTeamScore < awayTeamScore) {
            if (!existstingResult) {
              lossesSum = existingHomeTeamStats?.losses + 1;
            } else if (isPreviousWin || isPreviousDraw) {
              lossesSum = existingHomeTeamStats?.losses + 1;
              winsSum = isPreviousWin
                ? existingHomeTeamStats?.wins - 1
                : existingHomeTeamStats?.wins;
              drawsSum = isPreviousDraw
                ? existingHomeTeamStats?.draws - 1
                : existingHomeTeamStats?.draws;
              pointsSum = isPreviousWin
                ? existingHomeTeamStats?.points - 3
                : existingHomeTeamStats?.points - 1;
            } else {
              lossesSum = existingHomeTeamStats?.losses;
              pointsSum = existingHomeTeamStats?.points;
            }
          } else {
            if (!existstingResult) {
              drawsSum = existingHomeTeamStats?.draws + 1;
              pointsSum = existingHomeTeamStats?.points + 1;
            } else if (isPreviousWin || isPreviousLoss) {
              drawsSum = existingHomeTeamStats?.draws + 1;
              winsSum = isPreviousWin
                ? existingHomeTeamStats?.wins - 1
                : existingHomeTeamStats?.wins;
              lossesSum = isPreviousLoss
                ? existingHomeTeamStats?.losses - 1
                : existingHomeTeamStats?.losses;
              pointsSum = isPreviousLoss
                ? existingHomeTeamStats?.points + 1
                : existingHomeTeamStats?.points - 2;
            } else {
              drawsSum = existingHomeTeamStats?.draws;
              pointsSum = existingHomeTeamStats?.points;
            }
          }
        } else {
          goalsForSum = existingHomeTeamStats?.goalsFor;
          goalsAgainstSum = existingHomeTeamStats?.goalsAgainst;
          winsSum = existingHomeTeamStats?.wins;
          drawsSum = existingHomeTeamStats?.draws;
          lossesSum = existingHomeTeamStats?.losses;
          pointsSum = existingHomeTeamStats?.points;
        }

        await TeamStats.updateOne(
          { team: homeTeam.homeTeam?._id },
          {
            $set: {
              gamesPlayed: !existstingResult
                ? existingHomeTeamStats.gamesPlayed + 1
                : existingHomeTeamStats.gamesPlayed,
              wins: winsSum,
              draws: drawsSum,
              losses: lossesSum,
              goalsFor: goalsForSum,
              goalsAgainst: goalsAgainstSum,
              goalDifference: goalsForSum - goalsAgainstSum,
              points: pointsSum,
            },
          },
          { new: true }
        );
      }
    } else {
      await homeTeamStats.save();
    }

    if (existingAwayTeamStats) {
      const updatedAwayTeamStats = await TeamStats.findOne({
        team: awayTeam.awayTeam?._id,
      });

      if (updatedAwayTeamStats.match.toString() !== req.body.match) {
        updatedAwayTeamStats.match = req.body.match;
        await updatedAwayTeamStats.save();
      }

      const isTheSameMatch =
        updatedAwayTeamStats.match.toString() === req.body.match;

      if (isTheSameMatch) {
        const previousGoalsForFromResult =
          parseInt(existstingResult?.awayTeamScore) || 0;

        const previousGoalsAgainstFromResult =
          parseInt(existstingResult?.homeTeamScore) || 0;

        let isGoalChanged = false;

        if (
          awayTeamScore !== previousGoalsForFromResult ||
          homeTeamScore !== previousGoalsAgainstFromResult ||
          (homeTeamScore === 0 && awayTeamScore === 0)
        ) {
          isGoalChanged = true;
        } else {
          isGoalChanged = false;
        }

        let goalsForSum = existingAwayTeamStats?.goalsFor;
        let goalsAgainstSum = existingAwayTeamStats?.goalsAgainst;
        let winsSum = existingAwayTeamStats?.wins;
        let drawsSum = existingAwayTeamStats?.draws;
        let lossesSum = existingAwayTeamStats?.losses;
        let pointsSum = existingAwayTeamStats?.points;
        const isPreviousWin =
          previousGoalsForFromResult > previousGoalsAgainstFromResult;
        const isPreviousDraw =
          previousGoalsForFromResult === previousGoalsAgainstFromResult;
        const isPreviousLoss =
          previousGoalsForFromResult < previousGoalsAgainstFromResult;

        if (isGoalChanged) {
          goalsForSum =
            existingAwayTeamStats?.goalsFor -
            previousGoalsForFromResult +
            awayTeamScore;
          goalsAgainstSum =
            existingAwayTeamStats?.goalsAgainst -
            previousGoalsAgainstFromResult +
            homeTeamScore;

          if (awayTeamScore > homeTeamScore) {
            if (!existstingResult) {
              winsSum = existingAwayTeamStats?.wins + 1;
              pointsSum = existingAwayTeamStats?.points + 3;
            } else if (isPreviousLoss || isPreviousDraw) {
              winsSum = existingAwayTeamStats?.wins + 1;
              lossesSum =
                isPreviousLoss && existingAwayTeamStats?.losses > 0
                  ? existingAwayTeamStats?.losses - 1
                  : existingAwayTeamStats?.losses;
              drawsSum = isPreviousDraw
                ? existingAwayTeamStats?.draws - 1
                : existingAwayTeamStats?.draws;
              pointsSum = isPreviousLoss
                ? existingAwayTeamStats?.points + 3
                : existingAwayTeamStats?.points + 2;
            }
          } else if (awayTeamScore < homeTeamScore) {
            if (!existstingResult) {
              lossesSum = existingAwayTeamStats?.losses + 1;
            } else if (isPreviousWin || isPreviousDraw) {
              lossesSum = existingAwayTeamStats?.losses + 1;
              winsSum = isPreviousWin
                ? existingAwayTeamStats?.wins - 1
                : existingAwayTeamStats?.wins;
              drawsSum = isPreviousDraw
                ? existingAwayTeamStats?.draws - 1
                : existingAwayTeamStats?.draws;
              pointsSum = isPreviousWin
                ? existingAwayTeamStats?.points - 3
                : existingAwayTeamStats?.points - 1;
            }
          } else {
            if (!existstingResult) {
              drawsSum = existingAwayTeamStats?.draws + 1;
              pointsSum = existingAwayTeamStats?.points + 1;
            } else if (isPreviousWin || isPreviousLoss) {
              drawsSum = existingAwayTeamStats?.draws + 1;
              winsSum = isPreviousWin
                ? existingAwayTeamStats?.wins - 1
                : existingAwayTeamStats?.wins;
              lossesSum = isPreviousLoss
                ? existingAwayTeamStats?.losses - 1
                : existingAwayTeamStats?.losses;
              pointsSum = isPreviousLoss
                ? existingAwayTeamStats?.points + 1
                : existingAwayTeamStats?.points - 2;
            }
          }
        } else {
          goalsForSum = existingAwayTeamStats?.goalsFor;
          goalsAgainstSum = existingAwayTeamStats?.goalsAgainst;
          winsSum = existingAwayTeamStats?.wins;
          drawsSum = existingAwayTeamStats?.draws;
          lossesSum = existingAwayTeamStats?.losses;
          pointsSum = existingAwayTeamStats?.points;
        }

        await TeamStats.updateOne(
          { team: awayTeam.awayTeam?._id },
          {
            $set: {
              gamesPlayed: !existstingResult
                ? existingAwayTeamStats.gamesPlayed + 1
                : existingAwayTeamStats.gamesPlayed,
              wins: winsSum,
              draws: drawsSum,
              losses: lossesSum,
              goalsFor: goalsForSum,
              goalsAgainst: goalsAgainstSum,
              goalDifference: goalsForSum - goalsAgainstSum,
              points: pointsSum,
            },
          },
          { new: true }
        );
      }
    } else {
      await awayTeamStats.save();
    }

    if (existstingResult) {
      return res.status(200).json(updatedResult);
    } else {
      res.status(201).json(result);
    }
  } catch (error) {
    next(error);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const results = await Result.find();
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

export const getResultByMatchId = async (req, res, next) => {
  try {
    const result = await Result.findOne({ match: req.params.id });

    const match = await Match.findById(req.params.id)
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name');

    res.status(200).json({ result, match });
  } catch (error) {
    next(error);
  }
};
