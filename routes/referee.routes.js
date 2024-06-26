import express from 'express';
import {
  addReferee,
  assignRefereesToMatch,
  getMatchDetailsDocx,
  getMatchDetailsPDF,
  getMatchDetailsXlsx,
  getRefereeById,
  getRefereeByUserId,
} from '../controllers/referee.controller.js';
import {
  deleteMatchesByLeagueId,
  editMatch,
  generateMatchSchedule,
  getCompletedMatchesByLeagueId,
  getFilledMatchesByLeagueId,
  getMatchById,
  getRefereeMatches,
  getSeasonByMatchId,
} from '../controllers/match.controller.js';
import {
  deleteSchedule,
  getRoundByLeagueId,
} from '../controllers/round.controller.js';
import {
  addResult,
  getResultByMatchId,
  getResultDetailsById,
} from '../controllers/result.controller.js';
import {
  addMatchStats,
  getMatchStatsByMatchId,
  removeMatchStatsByMatchId,
} from '../controllers/matchStats.controller.js';

import upload from '../utils/upload.js';
import { getRefereeStats } from '../controllers/refereeStats.controller.js';

const router = express.Router();

router.post('/add', upload.single('photo'), addReferee);

router.get('/:id', getRefereeById);
router.get('/get/:id', getRefereeByUserId);
router.get('/get-rounds/:id', getRoundByLeagueId);
router.get('/get-match/:id', getMatchById);
router.get('/match-result/:id', getResultByMatchId);
router.get('/match-stats/:id/:playerId', getMatchStatsByMatchId);
router.get('/completed-matches/:id', getCompletedMatchesByLeagueId);
router.get('/filled-matches/:id', getFilledMatchesByLeagueId);
router.get('/referee-matches/:id', getRefereeMatches);
router.get('/download-match-details-pdf/:id', getMatchDetailsPDF);
router.get('/download-match-details-xlsx/:id', getMatchDetailsXlsx);
router.get('/download-match-details-docx/:id', getMatchDetailsDocx);
router.get('/season/:id', getSeasonByMatchId);
router.get('/result-details/:resultId', getResultDetailsById);
router.get('/referee-stats/:id', getRefereeStats);
router.post('/generate-schedule/:id', generateMatchSchedule);
router.post('/edit-match/:id', editMatch);
router.post('/add-result', addResult);
router.post('/assign-referees/:id', assignRefereesToMatch);
router.post('/add-match-stats', addMatchStats);
router.delete('/delete-matches/:id', deleteMatchesByLeagueId);
router.delete('/delete-schedule/:id', deleteSchedule);
router.delete('/delete-stats/:matchId/:player', removeMatchStatsByMatchId);

export default router;
