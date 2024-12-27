import CoachStats from '../models/coachStats.model.js';
import Match from '../models/match.model.js';
import Result from '../models/result.model.js';

export const getCoachStatsByTeamId = async (req, res, next) => {
  try {
    const coachId = req.params.coachId;
    const teamId = req.params.teamId;
    let coachStats = await CoachStats.findOne({ coach: coachId, team: teamId });

    if (!coachStats) {
      coachStats = new CoachStats({
        coach: coachId,
        team: teamId,
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
      });
    } else {
      coachStats.matches = 0;
      coachStats.wins = 0;
      coachStats.draws = 0;
      coachStats.losses = 0;
    }

    const teamMatches = await Match.find({
      $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
      isResultApproved: true,
    })
      .populate('homeTeam', 'name coach')
      .populate('awayTeam', 'name coach');

    const matchIds = teamMatches.map((match) => match._id);
    const results = await Result.find({ match: { $in: matchIds } });

    const resultMap = new Map(
      results.map((result) => [result.match.toString(), result])
    );

    teamMatches.forEach((match) => {
      const isHomeTeam = match.homeTeam._id.toString() === teamId;
      const matchCoachId = isHomeTeam
        ? match.homeTeam.coach.toString()
        : match.awayTeam.coach.toString();
      const matchResult = resultMap.get(match._id.toString());

      if (matchCoachId === coachId && matchResult) {
        coachStats.matches++;

        if (matchResult.homeTeamScore === matchResult.awayTeamScore) {
          coachStats.draws++;
        } else if (isHomeTeam) {
          matchResult.homeTeamScore > matchResult.awayTeamScore
            ? coachStats.wins++
            : coachStats.losses++;
        } else {
          matchResult.awayTeamScore > matchResult.homeTeamScore
            ? coachStats.wins++
            : coachStats.losses++;
        }
      }
    });

    await coachStats.save();

    res.status(200).json(coachStats);
  } catch (error) {
    next(error);
  }
};
