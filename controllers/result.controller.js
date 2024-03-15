import Match from '../models/match.model.js';
import Result from '../models/result.model.js';
import TeamStats from '../models/teamStats.model.js';

export const addResult = async (req, res, next) => {
  try {
    const existstingResult = await Result.findOne({ match: req.body.match });

    const currentMatch = await Match.findById(req.body.match);
    const homeTeamScore = parseInt(req.body.homeTeamScore);
    const awayTeamScore = parseInt(req.body.awayTeamScore);

    const homeTeam = await currentMatch.populate('homeTeam');
    const awayTeam = await currentMatch.populate('awayTeam');

    const homeTeamStats = new TeamStats({
      team: homeTeam.homeTeam?._id,
      match: req.body.match,
      gamesPlayed: 1,
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

    await updateTeamStats(homeTeam, homeTeamStats, homeTeamScore);
    await updateTeamStats(awayTeam, awayTeamStats, awayTeamScore);

    if (existstingResult) {
      await Result.updateOne(
        { match: req.body.match },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(existstingResult);
    }

    const result = new Result(req.body);
    await result.save();

    const match = await Match.findOneAndUpdate(
      { _id: req.body.match },
      { $set: { isResultApproved: true } },
      { new: true }
    );

    await match.save();

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

async function updateTeamStats(teamData, teamStats, goalsScored) {
  const existingTeamStats = await TeamStats.findOne({
    team: teamData.homeTeam?._id || teamData.awayTeam?._id,
    match: teamStats.match,
  });

  console.log(teamData);

  if (existingTeamStats) {
    await TeamStats.updateOne(
      { team: teamData.homeTeam?._id || teamData.awayTeam?._id },
      {
        $set: {
          gamesPlayed: existingTeamStats.gamesPlayed + 1,
          goalsFor: parseInt(existingTeamStats.goalsFor) + goalsScored,
          goalsAgainst: parseInt(existingTeamStats.goalsAgainst) + goalsScored,
          goalDifference:
            parseInt(existingTeamStats.goalDifference) +
            (goalsScored - goalsScored),
          points: existingTeamStats.points + teamStats.points,
        },
      },
      { new: true }
    );
  } else {
    await teamStats.save();
  }
}

export const editResult = async (req, res, next) => {
  try {
    const result = await Result.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    await result.save();

    res.status(201).json(result);
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
