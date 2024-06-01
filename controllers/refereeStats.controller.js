import Match from '../models/match.model.js';
import MatchStats from '../models/matchStats.model.js';
import RefereeStats from '../models/refereeStats.model.js';
import Result from '../models/result.model.js';

export const getRefereeStats = async (req, res) => {
  try {
    const refereeId = req.params.id;
    const refereeStats = await RefereeStats.findOne({
      referee: refereeId,
    });

    const matchesAsAssistant = await Match.find({
      $or: [
        { firstAssistantReferee: refereeId },
        { secondAssistantReferee: refereeId },
      ],
    });

    const matchesAsMainReferee = await Match.find({ mainReferee: refereeId })
      .populate('homeTeam')
      .populate('awayTeam');

    const matchesIds = matchesAsMainReferee.map((match) => match._id);

    const matchStats = await MatchStats.find({
      match: { $in: matchesIds },
    });

    const yellowCards = matchStats.reduce(
      (acc, curr) => acc + curr.yellowCards,
      0
    );
    const redCards = matchStats.reduce((acc, curr) => acc + curr.redCards, 0);

    const lastMatchAsMainReferee = matchesAsMainReferee.reduce(
      (acc, curr) => {
        if (acc.date > curr.endDate) {
          return acc;
        }
        return curr;
      },
      { date: new Date(0) }
    );

    const lastMatchAsAssistant = matchesAsAssistant.reduce(
      (acc, curr) => {
        if (acc.date > curr.endDate) {
          return acc;
        }
        return curr;
      },
      { date: new Date(0) }
    );

    const resultId = await Result.findOne({
      $or: [
        { match: lastMatchAsMainReferee?._id },
        { match: lastMatchAsAssistant?._id },
      ],
    }).select('_id');

    console.log(resultId);

    refereeStats.matches =
      matchesAsAssistant.length + matchesAsMainReferee.length;

    refereeStats.lastMatchId = resultId;

    refereeStats.lastMatchName =
      lastMatchAsMainReferee.homeTeam.name +
      ' vs ' +
      lastMatchAsMainReferee.awayTeam.name;

    refereeStats.yellowCards = yellowCards;
    refereeStats.redCards = redCards;

    await refereeStats.save();

    res.status(200).json(refereeStats);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
