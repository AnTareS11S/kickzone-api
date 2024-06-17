import League from '../models/league.model.js';
import MatchStats from '../models/matchStats.model.js';
import Team from '../models/team.model.js';
import TeamRedCards from '../models/teamRedCards.model.js';
import TeamYellowCards from '../models/teamYellowCards.model.js';

export const getTeamCards = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId).populate(
      'league',
      'season'
    );

    const league = await League.findOne({
      season: req.query.season ? req.query.season : team?.league?.season,
    })
      .populate('season', 'name')
      .select('name');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const teamPlayers = team.players.map((player) => player._id);

    const teamRedCards = await MatchStats.find({
      player: { $in: teamPlayers },
      season: req.query.season ? req.query.season : league?.season,
      redCards: { $gt: 0 },
    });

    const teamYellowCards = await MatchStats.find({
      player: { $in: teamPlayers },
      season: req.query.season ? req.query.season : league?.season,
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
      season: req.query.season ? req.query.season : league?.season,
      league: league?._id,
    });

    const existingTeamYellowCards = await TeamYellowCards.findOne({
      team: req.params.teamId,
      season: req.query.season ? req.query.season : league?.season,
      league: league?._id,
    });

    if (existingTeamRedCards) {
      existingTeamRedCards.redCards = redCardsCount;
      await existingTeamRedCards.save();
    } else {
      await TeamRedCards.create({
        team: req.params.teamId,
        redCards: redCardsCount,
        season: req.query.season ? req.query.season : league?.season,
        league: league?._id,
      });
    }

    if (existingTeamYellowCards) {
      existingTeamYellowCards.yellowCards = yellowCardsCount;
      await existingTeamYellowCards.save();
    } else {
      await TeamYellowCards.create({
        team: req.params.teamId,
        yellowCards: yellowCardsCount,
        season: req.query.season ? req.query.season : league?.season,
        league: league?._id,
      });
    }

    res.status(200).json({
      redCards: [
        {
          league: league?.name,
          season: league?.season?.name,
          count: redCardsCount,
        },
      ],
      yellowCards: [
        {
          league: league?.name,
          season: league?.season?.name,
          count: yellowCardsCount,
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};
