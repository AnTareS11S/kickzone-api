import Country from '../models/country.model.js';
import Player from '../models/player.model.js';
import PlayerStats from '../models/playerStats.model.js';
import Position from '../models/position.model.js';
import Team from '../models/team.model.js';
import User from '../models/user.model.js';

export const addPlayer = async (req, res, next) => {
  try {
    const existedPlayer = await Player.findOne({ user: req.body.user });

    const user = await User.findById(req.body.user);
    user.role = 'player';
    await user.save();

    if (existedPlayer) {
      const updatedPlayer = await Player.findOneAndUpdate(
        { user: req.body.user },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedPlayer);
    }

    const newPlayer = new Player(req.body);

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
    const player = await Player.findOne({ user: req.params.id });
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
    const player = await Player.findOneAndDelete(req.params.id);
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

    const playersNames = players.map(
      (player) => player.name + ' ' + player.surname + ':' + player._id
    );

    res.status(200).json(playersNames);
  } catch (error) {
    next(error);
  }
};

export const getPlayersByCurrentTeam = async (req, res, next) => {
  try {
    const teamId = req.params.id;

    if (!teamId) {
      return res.status(400).json({ error: 'Team id is required' });
    }

    const players = await Player.find({ currentTeam: teamId });

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

    const players = await Player.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { surname: { $regex: search, $options: 'i' } },
      ],
    });

    const teams = await Team.find({
      $or: [{ name: { $regex: search, $options: 'i' } }],
    });

    const playersCount = await Player.countDocuments();

    res.status(200).json({ players, teams, playersCount });
  } catch (error) {
    next(error);
  }
};
