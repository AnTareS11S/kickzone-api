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
import {
  addTeamFan,
  checkIsTeamFan,
  removeTeamFan,
} from '../controllers/teamFans.controller.js';
import { getTeamRedCards } from '../controllers/teamRedCard.controller.js';

const router = express.Router();

router.get('/download-pdf/:teamId', getTeamPDF);
router.get('/download-xlsx/:leagueId', getTeamStandingsXlsx);
router.get('/check-team-name', checkTeamName);
router.get('/:id', getTeamById);
router.get('/team-stats', getTeamStats);
router.get('/matches/:id', getMatchesByTeamId);
router.get('/squad/:squadId', getSquad);
router.get('/results/:teamId', getTeamResults);
router.get('/team-cards/:teamId', getTeamRedCards);
router.post('/add', addTeam);
router.post('/add-stat', addTeamStat);
router.post('/follow/:id', addTeamFan);
router.post('/unfollow/:id', removeTeamFan);
router.post('/is-fan/:id', checkIsTeamFan);
router.post('/remove-stat', removeTeamStat);

export default router;
