import express from 'express';
import {
  addTeam,
  getTeamById,
  getTeamPDF,
  getTeamResults,
  getTeamStandingsXlsx,
} from '../controllers/team.controller.js';
import { checkTeamName } from '../controllers/team.controller.js';
import {
  addTeamStat,
  getSquad,
  getTeamStats,
  removeTeamStat,
} from '../controllers/teamStats.controller.js';
import { getMatchesByTeamId } from '../controllers/match.controller.js';

const router = express.Router();

router.get('/download-pdf/:teamId', getTeamPDF);
router.get('/download-xlsx/:leagueId', getTeamStandingsXlsx);
router.get('/:id', getTeamById);
router.get('/team-stats', getTeamStats);
router.get('/matches/:id', getMatchesByTeamId);
router.get('/squad/:squadId', getSquad);
router.get('/results/:teamId', getTeamResults);
router.post('/add', addTeam);
router.post('/add-stat', addTeamStat);
router.post('/check', checkTeamName);
router.post('/remove-stat', removeTeamStat);

export default router;
