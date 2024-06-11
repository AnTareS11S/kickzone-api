import MatchStats from '../models/matchStats.model.js';
import Team from '../models/team.model.js';
import TeamRedCards from '../models/teamRedCards.model.js';
import TeamYellowCards from '../models/teamYellowCards.model.js';

export const getTeamRedCards = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId).populate(
      'league',
      'season name'
    );

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const teamPlayers = team.players.map((player) => player._id);

    const teamRedCards = await MatchStats.find({
      player: { $in: teamPlayers },
      redCards: { $gt: 0 },
    });

    const teamYellowCards = await MatchStats.find({
      player: { $in: teamPlayers },
      yellowCards: { $gt: 0 },
    });

    const redCardsCount = teamRedCards.reduce((acc, curr) => {
      return acc + curr.redCards;
    }, 0);

    const yellowCardsCount = teamYellowCards.reduce((acc, curr) => {
      return acc + curr.yellowCards;
    }, 0);

    const existingTeamRedCards = await TeamRedCards.findOne({
      team: req.params.teamId,
      season: team?.league?.season,
    });

    const existingTeamYellowCards = await TeamYellowCards.findOne({
      team: req.params.teamId,
      season: team?.league?.season,
    });

    if (existingTeamRedCards) {
      existingTeamRedCards.redCards = redCardsCount;
      await existingTeamRedCards.save();
    } else {
      await TeamRedCards.create({
        team: req.params.teamId,
        redCards: redCardsCount,
        season: team?.league?.season,
      });
    }

    if (existingTeamYellowCards) {
      existingTeamYellowCards.yellowCards = yellowCardsCount;
      await existingTeamYellowCards.save();
    } else {
      await TeamYellowCards.create({
        team: req.params.teamId,
        yellowCards: yellowCardsCount,
        season: team?.league?.season,
      });
    }

    res.status(200).json({
      redCards: [
        {
          season: team?.league?.name,
          count: redCardsCount,
        },
      ],
      yellowCards: [
        {
          season: team?.league?.name,
          count: yellowCardsCount,
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};
