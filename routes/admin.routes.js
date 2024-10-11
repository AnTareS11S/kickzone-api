import express from 'express';
import {
  createAdmin,
  deleteLeague,
  deleteTeam,
  deleteUser,
  getAdminByUserId,
  getAllLeagues,
  getAllUsers,
  getTeamsByIds,
  getTeamsWithoutLeague,
  setRole,
} from '../controllers/admin.controller.js';
import {
  addCountry,
  deleteCountry,
  editCountry,
  getAllCountries,
} from '../controllers/country.controller.js';
import {
  addStadium,
  deleteStadium,
  editStadium,
  getStadiumById,
  getStadiums,
} from '../controllers/stadium.controller.js';
import {
  addPosition,
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
import upload from '../utils/upload.js';
import {
  deleteReferee,
  getAllReferees,
} from '../controllers/referee.controller.js';
import {
  addSponsor,
  deleteSponsor,
  editSponsor,
  getAllSponsors,
} from '../controllers/sponsor.controller.js';
import {
  addFormation,
  deleteFormation,
  editFormation,
  getFormations,
} from '../controllers/formation.controller.js';
import { sendNotification } from '../controllers/notification.controller.js';
import {
  createTerm,
  deleteTerm,
  editTerm,
  getTerms,
} from '../controllers/terms.controller.js';
import {
  createPrivacy,
  deletePrivacy,
  editPrivacy,
  getPrivacies,
} from '../controllers/privacy.controller.js';
import {
  createAboutUs,
  deleteAboutUs,
  editAboutUs,
  getAboutUs,
  getOneAboutUs,
} from '../controllers/aboutUs.controller.js';
import {
  getRecentMatchResults,
  getTodayMatches,
} from '../controllers/match.controller.js';
import {
  createFaq,
  deleteFaq,
  editFaq,
  getFaqs,
} from '../controllers/faq.controller.js';
import {
  createContact,
  deleteContact,
  editContact,
  getContact,
  getOneContact,
} from '../controllers/contact.controller.js';

const customUpload = (req, res, next) => {
  if (
    req.headers['content-type'] &&
    req.headers['content-type'].startsWith('multipart/form-data')
  ) {
    return upload.single('logo')(req, res, next);
  }
  next();
};

const router = express.Router();

// Admin
router.get('/get/:adminId', getAdminByUserId);
router.post('/create', upload.single('photo'), createAdmin);

// User
router.get('/user', getAllUsers);
router.post('/users/:id/role', setRole);
router.delete('/user/delete/:id', deleteUser);
// Team
router.get('/team', getAllTeams);
router.get('/teams/no-league', getTeamsWithoutLeague);
router.post('/team/add', customUpload, addTeam);
router.post('/team/edit/:id', customUpload, editTeam);
router.post('/team-player/:id/add', addPlayerToTeam);
router.delete('/team/delete/:id', deleteTeam);
router.delete('/team-player/delete/:id', deletePlayerFromTeam);
// Coach
router.get('/coach', getAllCoaches);
router.delete('/coach/delete/:id', deleteCoach);
// League
router.get('/league', getAllLeagues);
router.post('/league/add', customUpload, addLeague);
router.post('/league/edit/:id', customUpload, editLeague);
router.post('/league/teams', getTeamsByIds);
router.delete('/league/delete/:id', deleteLeague);
// Country
router.get('/country', getAllCountries);
router.post('/country/add', customUpload, addCountry);
router.post('/country/edit/:id', customUpload, editCountry);
router.delete('/country/delete/:id', deleteCountry);
// Stadium
router.get('/stadium', getStadiums);
router.get('/stadium/:stadiumId', getStadiumById);
router.post('/stadium/add', customUpload, addStadium);
router.post('/stadium/edit/:id', customUpload, editStadium);
router.delete('/stadium/delete/:id', deleteStadium);
// Position
router.get('/position', getPositions);
router.post('/position/add', customUpload, addPosition);
router.post('/position/edit/:id', customUpload, editPosition);
router.delete('/position/delete/:id', deletePosition);
// Formation
router.get('/formation', getFormations);
router.post('/formation/add', customUpload, addFormation);
router.post('/formation/edit/:id', customUpload, editFormation);
router.delete('/formation/delete/:id', deleteFormation);
// Player
router.get('/player', getPlayers);
router.get('/team-player/:id', getPlayersByCurrentTeam);
router.delete('/player/delete/:id', deletePlayer);
// Training
router.get('/training', getAllCoachTrainings);
router.get('/training/:id', getAllCoachTrainings);
router.get('/participants/:id', getParticipants);
router.get('/training/get/:id', getTrainingById);
router.post('/participants/:id/add', customUpload, addPlayerToTraining);
router.post('/training/:id/add', customUpload, addTraining);
router.post('/training/edit/:id', customUpload, editTraining);
router.post('/training/attendace/:id', addOrRemoveAttendace);
router.delete('/training/delete/:id', deleteTraining);
router.delete('/participants/delete/:id', removePlayerFromTraining);
// Training Type
router.get('/training-type', getAllCoachTrainingTypes);
router.get('/training-type/:id', getAllCoachTrainingTypes);
router.post('/training-type/:id/add', customUpload, addTrainingType);
router.post('/training-type/edit/:id', customUpload, editTrainingType);
router.delete('/training-type/delete/:id', deleteTrainingType);
// Season
router.get('/season', getSeasons);
router.post('/season/add', customUpload, addSeason);
router.post('/season/edit/:id', customUpload, editSeason);
router.delete('/season/delete/:id', deleteSeason);
// Referee
router.get('/referee', getAllReferees);
router.delete('/referee/delete/:id', deleteReferee);
// Sponsor
router.get('/sponsor', getAllSponsors);
router.post('/sponsor/add', customUpload, addSponsor);
router.post('/sponsor/edit/:id', customUpload, editSponsor);
router.delete('/sponsor/delete/:id', deleteSponsor);
// Notification
router.post('/notification/:recipientId', sendNotification);
router.get('/get-notification/:recipientId', sendNotification);
// Terms
router.get('/terms', getTerms);
router.post('/terms/add', customUpload, createTerm);
router.post('/terms/edit/:id', customUpload, editTerm);
router.delete('/terms/delete/:id', deleteTerm);
// Privacy
router.get('/privacy', getPrivacies);
router.post('/privacy/add', customUpload, createPrivacy);
router.post('/privacy/edit/:id', customUpload, editPrivacy);
router.delete('/privacy/delete/:id', deletePrivacy);
// About Us
router.get('/about', getAboutUs);
router.get('/aboutOne', getOneAboutUs);
router.post('/about/add', upload.single('logo'), createAboutUs);
router.post('/about/edit/:id', upload.single('logo'), editAboutUs);
router.delete('/about/delete/:id', deleteAboutUs);
// Explore
router.get('/today-matches', getTodayMatches);
router.get('/recent-results', getRecentMatchResults);
// FAQ
router.get('/faq', getFaqs);
router.post('/faq/add', customUpload, createFaq);
router.post('/faq/edit/:id', customUpload, editFaq);
router.delete('/faq/delete/:id', deleteFaq);
// Contact
router.get('/contact', getContact);
router.get('/contactOne', getOneContact);
router.post('/contact/add', customUpload, createContact);
router.post('/contact/edit/:id', customUpload, editContact);
router.delete('/contact/delete/:id', deleteContact);

export default router;
