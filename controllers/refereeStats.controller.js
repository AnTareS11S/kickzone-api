import Match from '../models/match.model.js';
import MatchStats from '../models/matchStats.model.js';
import RefereeStats from '../models/refereeStats.model.js';
import Result from '../models/result.model.js';

export const getRefereeStats = async (req, res) => {
  try {
    const refereeId = req.params.id;
    let refereeStats = await RefereeStats.findOne({
      referee: refereeId,
    });

    if (!refereeStats) {
      refereeStats = new RefereeStats({
        referee: refereeId,
        matches: 0,
        yellowCards: 0,
        redCards: 0,
        lastMatchId: null,
        lastMatchName: '',
      });
    }

    const matchesAsAssistant = await Match.find({
      $or: [
        { firstAssistantReferee: refereeId },
        { secondAssistantReferee: refereeId },
      ],
      isResultApproved: true,
    })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name');

    const matchesAsMainReferee = await Match.find({
      mainReferee: refereeId,
      isResultApproved: true,
    })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name');

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

    refereeStats.matches =
      matchesAsAssistant.length + matchesAsMainReferee.length;

    refereeStats.lastMatchId = resultId;

    if (lastMatchAsMainReferee._id) {
      refereeStats.lastMatchName =
        lastMatchAsMainReferee.homeTeam?.name +
        ' vs ' +
        lastMatchAsMainReferee.awayTeam?.name;
    } else {
      refereeStats.lastMatchName =
        lastMatchAsAssistant.homeTeam?.name +
        ' vs ' +
        lastMatchAsAssistant.awayTeam?.name;
    }

    refereeStats.yellowCards = yellowCards;
    refereeStats.redCards = redCards;

    await refereeStats.save();

    res.status(200).json(refereeStats);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
