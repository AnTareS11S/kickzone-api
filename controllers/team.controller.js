import Coach from '../models/coach.model.js';
import Player from '../models/player.model.js';
import Stadium from '../models/stadium.model.js';
import Team from '../models/team.model.js';
import Sponsor from '../models/sponsor.model.js';
import TeamStats from '../models/teamStats.model.js';
import Match from '../models/match.model.js';
import Result from '../models/result.model.js';
import { buildTeamDetailsPDF } from '../utils/pdf-service.js';
import xlsx from 'node-xlsx';
import sharp from 'sharp';
import { deleteImageFromS3, uploadImageToS3 } from '../utils/s3Utils.js';
import { isValidObjectId } from 'mongoose';

export const addTeam = async (req, res, next) => {
  try {
    const buffer = await sharp(req.file.buffer)
      .resize({ fit: 'contain' })
      .toBuffer();

    const logoName = await uploadImageToS3(buffer, req.file.mimetype);

    const newTeam = new Team({
      ...req.body,
      logo: logoName,
      Team: null,
      coach: null,
      stadium: null,
      sponsor: null,
    });

    await newTeam.save();

    if (req.body.coach) {
      const coach = await Coach.findById(req.body.coach);

      if (coach) {
        coach.currentTeam = newTeam._id;
        coach.teams.push(newTeam._id);
        await coach.save();

        newTeam.coach = coach._id;
        await newTeam.save();
      }
    } else {
      newTeam.coach = null;
      await newTeam.save();
    }

    if (req.body.stadium) {
      const stadium = await Stadium.findById(req.body.stadium);

      if (stadium) {
        stadium.teams.push(newTeam._id);
        await stadium.save();

        newTeam.stadium = stadium._id;
        await newTeam.save();
      }
    } else {
      newTeam.stadium = null;
      await newTeam.save();
    }

    res.status(201).json(newTeam);
  } catch (error) {
    next(error);
  }
};

export const checkTeamName = async (req, res, next) => {
  try {
    const { name, id } = req.query;

    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      if (id && existingTeam._id.toString() === id) {
        res.status(200).json({ exists: false });
      } else {
        res.status(200).json({ exists: true });
      }
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    next(error);
  }
};

export const editTeam = async (req, res, next) => {
  try {
    const existedTeam = await Team.findOne({ _id: req.params.id });

    if (!existedTeam) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Handling logo upload
    if (req.file && req.file.buffer) {
      const buffer = await sharp(req.file.buffer)
        .resize({ fit: 'contain' })
        .toBuffer();
      const logoName = await uploadImageToS3(buffer, req.file.mimetype);
      // Delete previous logo from S3 if it exists
      if (existedTeam.logo) {
        await deleteImageFromS3(existedTeam.logo);
      }
      // Update logo field
      existedTeam.logo = logoName;
    }

    // Handling coach update
    if (isValidObjectId(req.body.coach)) {
      if (req.body.coach !== undefined) {
        if (existedTeam.coach) {
          const oldCoach = await Coach.findById(existedTeam.coach);
          if (oldCoach) {
            oldCoach.teams.pull(existedTeam._id);
            await oldCoach.save();
          }
        }
        if (req.body.coach !== null) {
          const newCoach = await Coach.findById(req.body.coach);
          if (newCoach) {
            newCoach.currentTeam = existedTeam._id;
            newCoach.teams.push(existedTeam._id);
            await newCoach.save();
          }
        }
        // Update coach field
        existedTeam.coach = req.body.coach;

        await existedTeam.save();
      }
    }

    if (isValidObjectId(req.body.sponsor)) {
      if (req.body.sponsor !== undefined) {
        if (existedTeam.sponsor) {
          const oldSponsor = await Sponsor.findById(existedTeam.sponsor);
          if (oldSponsor) {
            oldSponsor.teams.pull(existedTeam._id);
            await oldSponsor.save();
          }
        }
        if (req.body.sponsor !== null) {
          const newSponsor = await Sponsor.findById(req.body.sponsor);
          if (newSponsor) {
            newSponsor.teams.push(existedTeam._id);
            await newSponsor.save();
          }
        }

        // Update sponsor field
        existedTeam.sponsor = req.body.sponsor;

        await existedTeam.save();
      }
    }

    if (isValidObjectId(req.body.stadium)) {
      if (req.body.stadium !== undefined) {
        if (existedTeam.stadium) {
          const oldStadium = await Stadium.findById(existedTeam.stadium);
          if (oldStadium) {
            oldStadium.teams.pull(existedTeam._id);
            await oldStadium.save();
          }
        }
        if (req.body.stadium !== null) {
          const newStadium = await Stadium.findById(req.body.stadium);

          if (newStadium) {
            newStadium.teams.push(existedTeam._id);
            await newStadium.save();
          }

          // Update stadium field
          existedTeam.stadium = req.body.stadium;

          await existedTeam.save();
        }
      }
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      {
        name: req.body.name,
        yearFounded: req.body.yearFounded,
        bio: req.body.bio,
        country: req.body.country,
        city: req.body.city,
      },
      { new: true }
    );

    res.status(200).json(updatedTeam);
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('coach', 'name surname currentTeam')
      .populate('stadium')
      .populate('country')
      .populate('league')
      .populate('sponsor', 'name website');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.logo) {
      team.logoUrl = 'https://d3awt09vrts30h.cloudfront.net/' + team.logo;
    } else {
      team.logoUrl = null;
    }

    team.save();

    res.status(200).json(team);
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

    teams.forEach(async (team) => {
      if (team.logo) {
        team.logoUrl = 'https://d3awt09vrts30h.cloudfront.net/' + team.logo;
      } else {
        team.logoUrl = null;
      }
    });

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
  try {
    const teamId = req.params.teamId;
    const team = await Team.findById(teamId)
      .populate('coach', 'name surname -_id')
      .populate('stadium', 'name -_id')
      .populate('country', 'name city capacity -_id')
      .populate('league', 'name -_id')
      .populate('players', 'name surname age number -_id');

    const sanitizedTeamName = sanitizeFileName(team?.name);

    const stream = res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${sanitizedTeamName}.pdf`,
    });

    team.name = sanitizedTeamName;

    buildTeamDetailsPDF(
      (chunk) => stream.write(chunk),
      () => stream.end(),
      team
    );
  } catch (error) {
    next(error);
  }
};

const polishToEnglish = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ż: 'z',
  ź: 'z',
};

const sanitizeFileName = (fileName) => {
  return fileName.replace(
    /[ąćęłńóśżź]/g,
    (match) => polishToEnglish[match] || match
  );
};

export const getTeamStandingsXlsx = async (req, res, next) => {
  try {
    const Team = await Team.findById(req.params.TeamId);

    if (Team) {
      const teams = await Team.find({ _id: { $in: Team.teams } });
      let teamStats = await TeamStats.find({ team: { $in: Team.teams } });

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
      res.status(404).json({ message: 'Team not found' });
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

    const matchesIds = matches.map((match) => match._id);

    const results = await Result.find({ match: { $in: matchesIds } });

    res.status(200).json({ results, matches });
  } catch (error) {
    next(error);
  }
};
