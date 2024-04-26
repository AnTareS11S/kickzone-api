import Coach from '../models/coach.model.js';
import Country from '../models/country.model.js';
import League from '../models/league.model.js';
import Player from '../models/player.model.js';
import Stadium from '../models/stadium.model.js';
import Position from '../models/position.model.js';
import Team from '../models/team.model.js';
import { buildPDF } from '../utils/pdf-service.js';
import xlsx from 'node-xlsx';
import TeamStats from '../models/teamStats.model.js';
import Match from '../models/match.model.js';
import Result from '../models/result.model.js';

export const addTeam = async (req, res, next) => {
  try {
    const newTeam = new Team(req.body);
    console.log(req.body._id);

    await newTeam.save();

    if (req.body.coach) {
      const coach = await Coach.findById(req.body.coach);

      if (coach) {
        coach.currentTeam = newTeam._id;
        coach.teams.push(newTeam._id);
        await coach.save();
      }
    }

    res.status(201).json(newTeam);
  } catch (error) {
    next(error);
  }
};

export const checkTeamName = async (req, res, next) => {
  try {
    const { name, isEdit } = req.body;

    if (isEdit) {
      return res.status(200).json({ success: true });
    }

    const existingTeam = await Team.findOne({ name });

    if (existingTeam) {
      return res.status(200).json({ success: false });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const editTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);

    if (team) {
      if (req.body.name && req.body.name !== team.name) {
        const existingTeam = await Team.findOne({ name: req.body.name });
        if (existingTeam) {
          return res
            .status(200)
            .json({ success: false, message: 'Team name already exists!' });
        }
      }

      if (team.coach) {
        const oldCoach = await Coach.findById(team.coach);
        if (oldCoach) {
          oldCoach.teams.pull(team._id);
          await oldCoach.save();
        }
      }

      if (req.body.coach) {
        const newCoach = await Coach.findById(req.body.coach);
        if (newCoach) {
          newCoach.currentTeam = team._id;
          newCoach.teams.push(team._id);
          await newCoach.save();
        }
      }

      const updatedTeam = await Team.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedTeam);
    }
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    const coach = await Coach.findById(team.coach);
    const stadium = await Stadium.findById(team.stadium);
    const league = await League.find({ teams: { $in: [req.params.id] } });
    const country = await Country.findById(team.country);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.status(200).json({
      ...team._doc,
      coach: coach
        ? coach.name + ' ' + coach.surname + ':' + coach._id
        : 'No coach',
      stadium: stadium ? stadium.name + ':' + stadium._id : 'No stadium',
      league: league ? league[0].name : 'No league',
      country: country ? country.name : 'No country',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.find();

    if (!teams) {
      return res
        .status(404)
        .json({ success: false, message: 'No teams found!' });
    }

    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
};

export const addPlayerToTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    const player = await Player.findById(req.body.player);

    if (team) {
      player.currentTeam = team._id;
      player.wantedTeam = null;
      await player.save();
      team.players.push(req.body.player);
      await team.save();

      res.status(200).json(team);
    }
  } catch (error) {
    next(error);
  }
};

export const deletePlayerFromTeam = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    const team = await Team.findById(player.currentTeam);

    if (team) {
      player.currentTeam = null;
      if (!player.teams.includes(team._id)) {
        player.teams.push(team._id);
      }

      await player.save();
      team.players.pull(req.params.id);
      await team.save();

      res.status(200).json(team);
    }
  } catch (error) {
    next(error);
  }
};

export const getTeamPDF = async (req, res, next) => {
  const teamId = req.params.teamId;
  const team = await Team.findById(teamId)
    .populate('coach', 'name surname -_id')
    .populate('stadium', 'name -_id')
    .populate('country', 'name city capacity -_id')
    .populate('league', 'name -_id')
    .populate('players', 'name surname age number -_id');

  const stream = res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=${team?.name}.pdf`,
  });

  buildPDF(
    (chunk) => stream.write(chunk),
    () => stream.end(),
    team
  );
};

export const getTeamStandingsXlsx = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.leagueId);

    if (league) {
      const teams = await Team.find({ _id: { $in: league.teams } });
      let teamStats = await TeamStats.find({ team: { $in: league.teams } });

      const teamMap = new Map(teams.map((team) => [team._id.toString(), team]));

      teamStats = teamStats.map((teamStat) => {
        const team = teamMap.get(teamStat.team.toString());
        return {
          ...teamStat._doc,
          name: team ? team.name : 'Unknown Team',
          logo: team ? team.logo : '',
        };
      });

      const teamsWithoutStats = teams.filter(
        (team) =>
          !teamStats.some(
            (teamStat) => teamStat.team.toString() === team._id.toString()
          )
      );

      teamsWithoutStats.forEach((team) => {
        teamStats.push({
          name: team.name,
          team: team._id,
          logo: team.logo,
          gamesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        });
      });

      teamStats.sort((a, b) => b.points - a.points);

      const data = [
        [
          'Team',
          'Games Played',
          'Wins',
          'Draws',
          'Losses',
          'Goals For',
          'Goals Against',
          'Goal Difference',
          'Points',
        ],
        ...teamStats.map((team) => [
          team.name,
          team.gamesPlayed,
          team.wins,
          team.draws,
          team.losses,
          team.goalsFor,
          team.goalsAgainst,
          team.goalDifference,
          team.points,
        ]),
      ];

      const buffer = xlsx.build([{ name: 'Standings', data }]);

      res.writeHead(200, {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=Standings.xlsx`,
      });

      res.status(200).end(buffer, 'binary');
    } else {
      res.status(404).json({ message: 'League not found' });
    }
  } catch (error) {
    next(error);
  }
};

export const getTeamResults = async (req, res, next) => {
  try {
    const teamId = req.params.teamId;

    const matches = await Match.find({
      $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
      $and: [{ isCompleted: true }],
      $and: [{ isResultApproved: true }],
    }).populate('homeTeam awayTeam');

    console.log(matches);

    const matchesIds = matches.map((match) => match._id);

    const results = await Result.find({ match: { $in: matchesIds } });

    res.status(200).json({ results, matches });
  } catch (error) {
    next(error);
  }
};
