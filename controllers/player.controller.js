import Country from '../models/country.model.js';
import Player from '../models/player.model.js';
import PlayerStats from '../models/playerStats.model.js';
import Position from '../models/position.model.js';
import Team from '../models/team.model.js';
import User from '../models/user.model.js';
import sharp from 'sharp';
import { deleteImageFromS3, uploadImageToS3 } from '../utils/s3Utils.js';
import Coach from '../models/coach.model.js';
import Referee from '../models/referee.model.js';
import MatchStats from '../models/matchStats.model.js';
import AllPlayerStatsBySeason from '../models/allPlayerStatsBySeason.model.js';

export const addPlayer = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      const existedPlayer = await Player.findOne({ user: req.body.user });
      if (existedPlayer) {
        const updatedPlayer = await Player.findOneAndUpdate(
          { user: req.body.user },
          { ...req.body },
          { new: true }
        );
        await User.findOneAndUpdate(
          { _id: req.body.user },
          { isProfileFilled: true },
          { new: true }
        );
        return res.status(200).json(updatedPlayer);
      }
      const newPlayer = new Player(req.body);
      await newPlayer.save();
      return res.status(201).json(newPlayer);
    }

    const buffer = await sharp(req.file.buffer)
      .resize({ width: 200, height: 200, fit: 'cover' })
      .toBuffer();

    const photoName = await uploadImageToS3(buffer, req.file.mimetype);

    const existedPlayer = await Player.findOne({ user: req.body.user });
    if (existedPlayer) {
      existedPlayer.photo
        ? await deleteImageFromS3(existedPlayer?.photo)
        : null;
      const updatedPlayer = await Player.findOneAndUpdate(
        { user: req.body.user },
        { ...req.body, photo: photoName },
        { new: true }
      );
      await User.findOneAndUpdate(
        { _id: req.body.user },
        { isProfileFilled: true },
        { new: true }
      );
      return res.status(200).json(updatedPlayer);
    }

    const newPlayer = new Player({
      ...req.body,
      photo: photoName,
    });

    await User.findOneAndUpdate(
      { _id: req.body.user },
      { isProfileFilled: true },
      { new: true }
    );

    const playerStats = new PlayerStats({
      player: newPlayer._id,
      appearances: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      ownGoals: 0,
    });

    await playerStats.save();

    await newPlayer.save();
    res.status(201).json(newPlayer);
  } catch (error) {
    next(error);
  }
};

export const getPlayers = async (req, res, next) => {
  try {
    const players = await Player.find();

    const nationalityIds = [
      ...new Set(players.map((player) => player.nationality)),
    ];

    const positionIds = [...new Set(players.map((player) => player.position))];

    const wantedTeamIds = [
      ...new Set(players.map((player) => player.wantedTeam)),
    ];

    const currentTeamIds = [
      ...new Set(players.map((player) => player.currentTeam)),
    ];

    const nationalityName = await Country.find({
      _id: { $in: nationalityIds },
    });

    const positionName = await Position.find({
      _id: { $in: positionIds },
    });

    const wantedTeamName = await Team.find({
      _id: { $in: wantedTeamIds },
    });

    const currentTeamName = await Team.find({
      _id: { $in: currentTeamIds },
    });

    const playersWithCountryNames = players.map((player) => {
      const country = nationalityName.find(
        (country) => String(country._id) === String(player.nationality)
      );
      const position = positionName.find(
        (position) => String(position._id) === String(player.position)
      );
      const wantedTeam = wantedTeamName.find(
        (team) => String(team._id) === String(player.wantedTeam)
      );

      const currentTeam = currentTeamName.find(
        (team) => String(team._id) === String(player.currentTeam)
      );

      return {
        ...player.toObject(),
        nationality: country ? country.name : '',
        position: position ? position.name : '',
        positionShortcut: position ? position.shortcut : '',
        wantedTeam: wantedTeam ? wantedTeam.name : '',
        currentTeam: currentTeam ? currentTeam.name : '',
      };
    });

    res.status(200).json(playersWithCountryNames);
  } catch (error) {
    next(error);
  }
};

export const getPlayerByUserId = async (req, res, next) => {
  try {
    const player = await Player.findOne({ user: req.params.id }).populate(
      'currentTeam',
      'name'
    );
    if (!player) {
      return res.status(404).json({ success: false, message: 'Not found!' });
    }

    if (player.photo) {
      player.imageUrl = 'https://d3awt09vrts30h.cloudfront.net/' + player.photo;
    } else {
      player.imageUrl = null;
    }

    res.status(200).json(player);
  } catch (error) {
    next(error);
  }
};

export const getPlayerById = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);

    const nationalityId = player.nationality;

    const positionId = player.position;

    const currentTeamId = player.currentTeam;

    const teamsIds = [...new Set(player.teams)];

    const nationalityName = await Country.findById(nationalityId);

    const positionName = await Position.findById(positionId);

    const currentTeamName = await Team.findById(currentTeamId);

    const teamsNames = await Team.find({ _id: { $in: teamsIds } });

    const teamsNamesArray = teamsNames.map((team) => team.name);

    if (player.photo) {
      player.imageUrl = 'https://d3awt09vrts30h.cloudfront.net/' + player.photo;
    } else {
      player.imageUrl = null;
    }

    res.status(200).json({
      ...player.toObject(),
      nationality: nationalityName ? nationalityName.name : '-',
      position: positionName ? positionName.name : '-',
      currentTeam: currentTeamName ? currentTeamName.name : '-',
      teams: teamsNamesArray,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);

    if (player.photo) {
      await deleteImageFromS3(player.photo);
    }

    await User.findOneAndUpdate(
      { _id: player.user },
      { isProfileFilled: false },
      { new: true }
    );

    const matchStatsIds = await PlayerStats.find({
      player: req.params.id,
    });

    await MatchStats.deleteMany({ _id: { $in: matchStatsIds } });

    await PlayerStats.deleteMany({ player: req.params.id });

    await AllPlayerStatsBySeason.deleteMany({ player: req.params.id });

    await Player.findByIdAndDelete(req.params.id);

    res.status(200).json(player);
  } catch (error) {
    next(error);
  }
};

export const getPlayersByWantedTeam = async (req, res, next) => {
  try {
    const teamId = req.params.id;

    if (!teamId) {
      return res.status(400).json({ error: 'Team id is required' });
    }
    const players = await Player.find({ wantedTeam: req.params.id });

    res.status(200).json(players);
  } catch (error) {
    next(error);
  }
};

export const getPlayersByCurrentTeam = async (req, res, next) => {
  try {
    const teamId = req.params.id;

    if (!teamId) {
      return res.status(404).json({ error: 'Team id is required' });
    }

    const players = await Player.find({ currentTeam: teamId });

    if (!players) {
      return res.status(404).json({ error: 'Players not found' });
    }

    const nationalityIds = [
      ...new Set(players.map((player) => player.nationality)),
    ];

    const positionIds = [...new Set(players.map((player) => player.position))];

    const nationalityName = await Country.find({
      _id: { $in: nationalityIds },
    });

    const positionName = await Position.find({
      _id: { $in: positionIds },
    });

    const playersWithCountryNames = players.map((player) => {
      const country = nationalityName.find(
        (country) => String(country._id) === String(player.nationality)
      );
      const position = positionName.find(
        (position) => String(position._id) === String(player.position)
      );

      if (player.photo) {
        player.imageUrl =
          'https://d3awt09vrts30h.cloudfront.net/' + player.photo;
      } else {
        player.imageUrl = null;
      }

      return {
        ...player.toObject(),
        nationality: country ? country.name : '',
        position: position ? position.name : '',
        positionShortcut: position ? position.shortcut : '',
      };
    });

    res.status(200).json(playersWithCountryNames);
  } catch (error) {
    next(error);
  }
};

export const searchPlayers = async (req, res, next) => {
  try {
    const search = req.query.q || '';

    const [players, teams, coaches, referees] = await Promise.all([
      Player.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { surname: { $regex: search, $options: 'i' } },
        ],
      }),
      Team.find({
        $or: [{ name: { $regex: search, $options: 'i' } }],
      }),
      Coach.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { surname: { $regex: search, $options: 'i' } },
        ],
      }),
      Referee.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { surname: { $regex: search, $options: 'i' } },
        ],
      }),
    ]);

    const setImageUrl = (item) => {
      if (item.photo) {
        item.imageUrl = 'https://d3awt09vrts30h.cloudfront.net/' + item.photo;
      } else {
        item.imageUrl = null;
      }
      return item;
    };

    const setLogoUrl = (item) => {
      if (item.logo) {
        item.logoUrl = 'https://d3awt09vrts30h.cloudfront.net/' + item.logo;
      } else {
        item.logoUrl = null;
      }
      return item;
    };

    const modifyPlayers = players.map((player) => setImageUrl(player));
    const modifyTeams = teams.map((team) => setLogoUrl(team));
    const modifyCoaches = coaches.map((coach) => setImageUrl(coach));
    const modifyReferees = referees.map((referee) => setImageUrl(referee));

    const playersCount = await Player.countDocuments();

    res.status(200).json({
      players: modifyPlayers,
      teams: modifyTeams,
      coaches: modifyCoaches,
      referees: modifyReferees,
      playersCount,
    });
  } catch (error) {
    next(error);
  }
};
