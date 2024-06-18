import League from '../models/league.model.js';
import Match from '../models/match.model.js';
import Referee from '../models/referee.model.js';
import Round from '../models/round.model.js';
import Team from '../models/team.model.js';
import moment from 'moment';
import cron from 'node-cron';

cron.schedule('0 0 * * *', async () => {
  try {
    const currentDate = new Date();

    const activeMatchesToUpdate = await Match.find({
      isCompleted: false,
      endDate: { $lt: currentDate },
    });

    for (const matchToUpdate of activeMatchesToUpdate) {
      matchToUpdate.isCompleted = true;
      await matchToUpdate.save();
    }

    console.log('Updated matches: ', activeMatchesToUpdate.length);
  } catch (error) {
    console.log(error);
  }
});

export const generateMatchSchedule = async (req, res, next) => {
  try {
    const league = await League.find({ _id: req.params.id });
    const { seasonId } = req.body;

    const match = await Match.find({ league: req.params.id, season: seasonId });

    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    if (match.length > 0) {
      return res.status(405).json({
        message: 'Schedule is already generated. Delete rounds first',
      });
    }

    const teams = await Team.find({ league: req.params.id });

    if (!teams || teams.length < 2) {
      return res
        .status(404)
        .json({ message: 'Not enough teams found to generate schedule' });
    }

    const startDate = moment(req.body.startDate);

    if (
      !moment(startDate).isValid() ||
      moment(startDate).isSameOrBefore(moment(), 'day')
    ) {
      throw new Error('Invalid start date');
    }

    const shuffledTeams = shuffleArray(teams);
    const matches = [];
    let currentDate = moment(startDate)
      .clone()
      .endOf('week')
      .add(1, 'day')
      .isoWeekday('Saturday');

    let teamss = [...shuffledTeams];

    if (teamss.length % 2 !== 0) {
      teamss.push(null);
    }

    const numTeams = teamss.length;
    const numRounds = numTeams - 1;
    const numMatchesPerRound = numTeams / 2;

    let matchesInRound;

    for (let round = 0; round < numRounds; round++) {
      matchesInRound = [];

      for (let i = 0; i < numMatchesPerRound; i++) {
        let homeTeam, awayTeam;

        if (round % 2 === 0) {
          homeTeam = teamss[i];
          awayTeam = teamss[numTeams - 1 - i];
        } else {
          awayTeam = teamss[i];
          homeTeam = teamss[numTeams - 1 - i];
        }

        const matchDateSaturday = generateMatchDate(
          currentDate,
          round,
          'Saturday'
        );
        const matchDateSunday = generateMatchDate(currentDate, round, 'Sunday');

        matchesInRound.push({
          homeTeam,
          awayTeam,
          league: req.params.id,
          season: seasonId,
          startDate:
            i % 2 === 0 ? matchDateSaturday.toDate() : matchDateSunday.toDate(),
          endDate: generateMatchEndDate(
            i % 2 === 0 ? matchDateSaturday : matchDateSunday,
            2
          ),
          round: null,
        });
      }

      teamss.splice(1, 0, teamss.pop());

      matches.push(matchesInRound);

      // Move the start date for the next round by a week
      currentDate = currentDate.clone().add(1, 'week').isoWeekday('Saturday');
    }

    const flattenedMatches = matches.flat();

    const newMatches = await Match.insertMany(flattenedMatches);

    const rounds = [];

    for (let i = 0; i < matches.length; i++) {
      const roundStartDate = flattenedMatches[i * (teams.length / 2)].startDate;
      const roundEndDate =
        flattenedMatches[(i + 1) * (teams.length / 2) - 1].endDate;
      const round = new Round({
        name: `Round ${i + 1} - ${moment(roundStartDate).format(
          'MMM DD, YYYY'
        )}`,
        startDate: roundStartDate,
        endDate: roundEndDate,
        season: seasonId,
        league: req.params.id,
      });
      round.matches = newMatches
        .slice(i * (teams.length / 2), (i + 1) * (teams.length / 2))
        .map((match) => {
          match.round = round._id;
          match.save();
          return match._id;
        });

      rounds.push(round);
    }

    await Round.insertMany(rounds);

    const populatedMatches = await Match.populate(newMatches, {
      path: 'homeTeam awayTeam',
      select: 'name',
    });

    res.status(201).json(populatedMatches);
  } catch (error) {
    next(error);
  }
};

// Function to generate the date and time of a match
function generateMatchDate(startDate, round, day) {
  let matchDate = startDate.clone().add(round, 'days').isoWeekday(day);
  return matchDate.hour(Math.floor(Math.random() * 7) + 11).minute(0);
}
// Function to generate the end date and time of a match
function generateMatchEndDate(startDate, matchDuration = 2) {
  return startDate.clone().add(matchDuration, 'hours').toDate();
}

// Function to shuffle an array
function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

export const saveSchedule = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    const matches = await Match.find({ league: req.params.id });
    if (!matches) {
      return res.status(404).json({ message: 'Matches not found' });
    }

    const newMatches = await Match.insertMany(matches);
    res.status(201).json(newMatches);
  } catch (error) {
    next(error);
  }
};

export const deleteMatchesByLeagueId = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    const matches = await Match.find({ league: req.params.id });
    if (!matches) {
      return res.status(404).json({ message: 'Matches not found' });
    }

    const deletedMatches = await Match.deleteMany({ league: req.params.id });
    res.status(201).json(deletedMatches);
  } catch (error) {
    next(error);
  }
};

export const getMatchesByTeamId = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id).populate(
      'league',
      'season'
    );
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const matches = await Match.find({
      $or: [{ homeTeam: req.params.id }, { awayTeam: req.params.id }],
      season: req.query.season ? req.query.season : team.league.season,
    })
      .sort({ startDate: 1 })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .populate('league', 'name')
      .populate('round', 'name');

    const teamOpponents = matches.map((match) => {
      if (match.homeTeam._id.toString() === req.params.id) {
        return match.awayTeam;
      } else {
        return match.homeTeam;
      }
    });

    res.status(200).json({ matches, teamOpponents });
  } catch (error) {
    next(error);
  }
};

export const getMatchById = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('homeTeam', '_id, name')
      .populate('awayTeam', '_id, name')
      .populate('league', 'name')
      .populate('round', 'name')
      .populate('season', 'name');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.status(200).json(match);
  } catch (error) {
    next(error);
  }
};

export const editMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const updatedMatch = await Match.findByIdAndUpdate(
      req.params.id,
      {
        homeTeam: req.body?.homeTeam,
        awayTeam: req.body?.awayTeam,
        startDate: req.body?.startDate,
      },
      { new: true }
    );

    res.status(201).json(updatedMatch);
  } catch (error) {
    next(error);
  }
};

export const getCompletedMatchesByLeagueId = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    const season = league?.season;

    const refereeId = await Referee.findOne({ user: req.query.userId }).select(
      '_id'
    );

    const refereeMatches = await Match.find({
      league: req.params.id,
      isCompleted: true,
      isResultApproved: false,
      mainReferee: refereeId,
      season,
    })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .populate('league', 'name')
      .populate('round', 'name');

    res.status(200).json(refereeMatches);
  } catch (error) {
    next(error);
  }
};

export const getFilledMatchesByLeagueId = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    const season = league?.season;

    const refereeId = await Referee.findOne({ user: req.query.userId }).select(
      '_id'
    );

    const refereeMatches = await Match.find({
      league: req.params.id,
      isCompleted: true,
      isResultApproved: true,
      mainReferee: refereeId,
      season,
    })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .populate('league', 'name')
      .populate('round', 'name');

    res.status(200).json(refereeMatches);
  } catch (error) {
    next(error);
  }
};

export const getSeasonByMatchId = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.status(200).json(match.season);
  } catch (error) {
    next(error);
  }
};

export const getRefereeMatches = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }

    const refereeId = await Referee.findOne({ user: req.query.userId }).select(
      '_id'
    );

    const refereeMatches = await Match.find({
      league: req.params.id,
      mainReferee: refereeId,
      season: league.season,
    })
      .populate('homeTeam', 'name')
      .populate('awayTeam', 'name')
      .populate('league', 'name')
      .populate('round', 'name');

    res.status(200).json(refereeMatches);
  } catch (error) {
    next(error);
  }
};
