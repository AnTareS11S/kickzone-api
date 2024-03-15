import express from 'express';
import { addTeam, getTeamById } from '../controllers/team.controller.js';
import { checkTeamName } from '../controllers/team.controller.js';
import {
  addTeamStat,
  getTeamStats,
  removeTeamStat,
} from '../controllers/teamStats.controller.js';
import { getMatchesByTeamId } from '../controllers/match.controller.js';

const router = express.Router();

router.get('/:id', getTeamById);
router.get('/team-stats', getTeamStats);
router.get('/matches/:id', getMatchesByTeamId);
router.post('/add', addTeam);
router.post('/add-stat', addTeamStat);
router.post('/check', checkTeamName);
router.post('/remove-stat', removeTeamStat);

export default router;
