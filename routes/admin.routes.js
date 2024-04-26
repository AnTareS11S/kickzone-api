import express from 'express';
import {
  deleteLeague,
  deleteTeam,
  deleteUser,
  getAllLeagues,
  getAllUsers,
  getTeamsByIds,
  getTeamsWithoutLeague,
  setRole,
} from '../controllers/admin.controller.js';
import {
  addCountry,
  checkCountry,
  deleteCountry,
  editCountry,
  getAllCountries,
} from '../controllers/country.controller.js';
import {
  addStadium,
  checkStadiumName,
  deleteStadium,
  editStadium,
  getStadiumById,
  getStadiums,
} from '../controllers/stadium.controller.js';
import {
  addPosition,
  checkPosition,
  deletePosition,
  editPosition,
  getPositions,
} from '../controllers/position.controller.js';
import {
  addPlayerToTeam,
  addTeam,
  deletePlayerFromTeam,
  editTeam,
  getAllTeams,
} from '../controllers/team.controller.js';
import { deleteCoach, getAllCoaches } from '../controllers/coach.controller.js';
import { addLeague, editLeague } from '../controllers/league.controller.js';
import {
  deletePlayer,
  getPlayers,
  getPlayersByCurrentTeam,
} from '../controllers/player.controller.js';
import {
  addOrRemoveAttendace,
  addPlayerToTraining,
  addTraining,
  deleteTraining,
  editTraining,
  getAllCoachTrainings,
  getParticipants,
  getTrainingById,
  removePlayerFromTraining,
} from '../controllers/training.controller.js';
import {
  addTrainingType,
  deleteTrainingType,
  editTrainingType,
  getAllCoachTrainingTypes,
} from '../controllers/trainingType.controller.js';
import {
  addSeason,
  deleteSeason,
  editSeason,
  getSeasons,
} from '../controllers/season.controller.js';
import { buildPDF } from '../utils/pdf-service.js';

const router = express.Router();

router.get('/users', getAllUsers);
router.post('/users/:id/role', setRole);
router.delete('/users/delete/:id', deleteUser);

router.get('/team', getAllTeams);
router.get('/teams/no-league', getTeamsWithoutLeague);
router.post('/team/add', addTeam);
router.post('/team/edit/:id', editTeam);
router.post('/team-player/:id/add', addPlayerToTeam);
router.delete('/team/delete/:id', deleteTeam);
router.delete('/team-player/delete/:id', deletePlayerFromTeam);

router.get('/coach', getAllCoaches);
router.delete('/coach/delete/:id', deleteCoach);

router.get('/league', getAllLeagues);
router.post('/league/add', addLeague);
router.post('/league/edit/:id', editLeague);
router.post('/league/teams', getTeamsByIds);
router.delete('/league/delete/:id', deleteLeague);

router.get('/country', getAllCountries);
router.post('/country/add', addCountry);
router.post('/country/edit/:id', editCountry);
router.post('/country/check', checkCountry);
router.delete('/country/delete/:id', deleteCountry);

router.get('/stadium', getStadiums);
router.get('/stadium/:stadiumId', getStadiumById);
router.post('/stadium/add', addStadium);
router.post('/stadium/edit/:id', editStadium);
router.post('/stadium/check', checkStadiumName);
router.delete('/stadium/delete/:id', deleteStadium);

router.get('/position', getPositions);
router.post('/position/add', addPosition);
router.post('/position/edit/:id', editPosition);
router.post('/position/check', checkPosition);
router.delete('/position/delete/:id', deletePosition);

router.get('/player', getPlayers);
router.get('/team-player/:id', getPlayersByCurrentTeam);
router.delete('/player/delete/:id', deletePlayer);

router.get('/training', getAllCoachTrainings);
router.get('/training/:id', getAllCoachTrainings);
router.get('/participants/:id', getParticipants);
router.get('/training/get/:id', getTrainingById);
router.post('/participants/:id/add', addPlayerToTraining);
router.post('/training/:id/add', addTraining);
router.post('/training/edit/:id', editTraining);
router.post('/training/attendace/:id', addOrRemoveAttendace);
router.delete('/training/delete/:id', deleteTraining);
router.delete('/participants/delete/:id', removePlayerFromTraining);

router.get('/training-type', getAllCoachTrainingTypes);
router.get('/training-type/:id', getAllCoachTrainingTypes);
router.post('/training-type/:id/add', addTrainingType);
router.post('/training-type/edit/:id', editTrainingType);
router.delete('/training-type/delete/:id', deleteTrainingType);

router.get('/season', getSeasons);
router.post('/season/add', addSeason);
router.post('/season/edit/:id', editSeason);
router.delete('/season/delete/:id', deleteSeason);

export default router;
