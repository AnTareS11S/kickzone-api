import express from 'express';
import {
  addAdmin,
  banUser,
  deleteContent,
  deleteLeague,
  deleteTeam,
  deleteUser,
  getAdminByUserId,
  getAdminNotifications,
  getAllLeagues,
  getAllUsers,
  getTeamsByIds,
  getTeamsWithoutLeague,
  getUsersRoleChanges,
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
  addTerm,
  deleteTerm,
  editTerm,
  getTerms,
} from '../controllers/terms.controller.js';
import {
  addPrivacy,
  deletePrivacy,
  editPrivacy,
  getPrivacies,
} from '../controllers/privacy.controller.js';
import {
  addAboutUs,
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
  addFaq,
  deleteFaq,
  editFaq,
  getFaqs,
} from '../controllers/faq.controller.js';
import {
  addContact,
  deleteContact,
  editContact,
  getContact,
  getOneContact,
} from '../controllers/contact.controller.js';
import {
  addTeamEquipment,
  deleteTeamEquipment,
  editTeamEquipment,
  getTeamEquipment,
} from '../controllers/teamEquipment.controller.js';
import {
  addTeamForumCategory,
  deleteTeamForumCategory,
  editTeamForumCategory,
  getTeamForumCategories,
  getTeamForumCategoriesToSelect,
} from '../controllers/teamForumCategory.controller.js';
import {
  addReport,
  getReports,
  updateReport,
} from '../controllers/report.controller.js';
import {
  addRequestTeamForm,
  deleteRequestTeamForm,
  getRequestTeamForms,
} from '../controllers/user.controller.js';

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
router.get('/role-changes', getUsersRoleChanges);
router.get('/notifications-count', getAdminNotifications);
router.get('/reports', getReports);
router.post('/add-report', addReport);
router.post('/report/:reportId', updateReport);
router.post('/update-role/:userId', setRole);
router.post('/ban-user/:userId', banUser);
router.post('/add', upload.single('photo'), addAdmin);
router.delete('/content/delete/:contentId', deleteContent);

// User
router.get('/user', getAllUsers);
router.delete('/user/delete/:id', deleteUser);
// Team
router.get('/team', getAllTeams);
router.get('/teams/no-league', getTeamsWithoutLeague);
router.post('/team/add', customUpload, addTeam);
router.post('/team/edit/:id', customUpload, editTeam);
router.post('/team-player/:id/add', customUpload, addPlayerToTeam);
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
router.post('/training/attendance/:id', customUpload, addOrRemoveAttendace);
router.delete('/training/delete/:id', deleteTraining);
router.delete('/participants/delete/:id', removePlayerFromTraining);
// Training Type
router.get('/training-type', getAllCoachTrainingTypes);
router.get('/training-type/:id', getAllCoachTrainingTypes);
router.post('/training-type/:id/add', customUpload, addTrainingType);
router.post('/training-type/edit/:id', customUpload, editTrainingType);
router.delete('/training-type/delete/:id', deleteTrainingType);
// Team Equipment
router.get('/team-equipment/:teamId', getTeamEquipment);
router.post('/team-equipment/:teamId/add', customUpload, addTeamEquipment);
router.post('/team-equipment/edit/:id', customUpload, editTeamEquipment);
router.delete('/team-equipment/delete/:id', deleteTeamEquipment);
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
// Terms
router.get('/terms', getTerms);
router.post('/terms/add', customUpload, addTerm);
router.post('/terms/edit/:id', customUpload, editTerm);
router.delete('/terms/delete/:id', deleteTerm);
// Privacy
router.get('/privacy', getPrivacies);
router.post('/privacy/add', customUpload, addPrivacy);
router.post('/privacy/edit/:id', customUpload, editPrivacy);
router.delete('/privacy/delete/:id', deletePrivacy);
// About Us
router.get('/about', getAboutUs);
router.get('/aboutOne', getOneAboutUs);
router.post('/about/add', upload.single('logo'), addAboutUs);
router.post('/about/edit/:id', upload.single('logo'), editAboutUs);
router.delete('/about/delete/:id', deleteAboutUs);
// Explore
router.get('/today-matches', getTodayMatches);
router.get('/recent-results', getRecentMatchResults);
// FAQ
router.get('/faq', getFaqs);
router.post('/faq/add', customUpload, addFaq);
router.post('/faq/edit/:id', customUpload, editFaq);
router.delete('/faq/delete/:id', deleteFaq);
// Team Forum Category
router.get('/team-forum-categories', getTeamForumCategoriesToSelect);
router.get('/team-forum-categories/:userId/:model', getTeamForumCategories);
router.post('/team-forum-categories/add', customUpload, addTeamForumCategory);
router.post(
  '/team-forum-categories/edit/:id',
  customUpload,
  editTeamForumCategory
);
router.delete('/team-forum-categories/delete/:id', deleteTeamForumCategory);
// Contact
router.get('/contact', getContact);
router.get('/contactOne', getOneContact);
router.post('/contact/add', customUpload, addContact);
router.post('/contact/edit/:id', customUpload, editContact);
router.delete('/contact/delete/:id', deleteContact);
// Team Request Form
router.post('/add/team-request-form', addRequestTeamForm);
router.get('/team-requests', getRequestTeamForms);
router.delete('/team-request/delete/:id', deleteRequestTeamForm);

export default router;
