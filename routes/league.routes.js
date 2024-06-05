import express from 'express';
import {
  addTeamToLeague,
  checkLeagueName,
  getStatsByLeagueId,
  getTeamsByLeagueId,
  removeTeamFromLeague,
} from '../controllers/league.controller.js';

const router = express.Router();

router.post('/addTeam/:id', addTeamToLeague);
router.put('/delete/:id', removeTeamFromLeague);
router.get('/check-league-name', checkLeagueName);
router.get('/teams-stats/:id', getStatsByLeagueId);
router.get('/teams/:id', getTeamsByLeagueId);

export default router;
