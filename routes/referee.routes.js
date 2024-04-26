import express from 'express';
import {
  addReferee,
  getRefereeByUserId,
} from '../controllers/referee.controller.js';
import {
  deleteMatchesByLeagueId,
  editMatch,
  generateMatchSchedule,
  getCompletedMatchesByLeagueId,
  getFilledMatchesByLeagueId,
  getMatchById,
  getSchedule,
  getSeasonByMatchId,
} from '../controllers/match.controller.js';
import {
  deleteRoundsAndMatches,
  getRoundById,
  getRoundByLeagueId,
} from '../controllers/round.controller.js';
import {
  addResult,
  getResultByMatchId,
} from '../controllers/result.controller.js';
import {
  addMatchStats,
  getMatchStatsByMatchId,
  removeMatchStatsByMatchId,
} from '../controllers/matchStats.controller.js';

const router = express.Router();

router.post('/create', addReferee);

router.get('/get/:id', getRefereeByUserId);
router.get('/get-schedule/:id', getSchedule);
router.get('/get-rounds/:id', getRoundByLeagueId);
router.get('/get-round/:id', getRoundById);
router.get('/get-match/:id', getMatchById);
router.get('/match-result/:id', getResultByMatchId);
router.get('/match-stats/:id/:playerId', getMatchStatsByMatchId);
router.get('/completed-matches/:id', getCompletedMatchesByLeagueId);
router.get('/filled-matches/:id', getFilledMatchesByLeagueId);
router.get('/season/:id', getSeasonByMatchId);
router.post('/generate-schedule/:id', generateMatchSchedule);
router.post('/edit-match/:id', editMatch);
router.post('/add-result', addResult);
router.post('/add-match-stats', addMatchStats);
router.delete('/delete-matches/:id', deleteMatchesByLeagueId);
router.delete('/delete-rounds/:id', deleteRoundsAndMatches);
router.delete('/delete-stats/:matchId/:player', removeMatchStatsByMatchId);

export default router;
