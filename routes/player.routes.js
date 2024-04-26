import express from 'express';
import {
  addPlayer,
  getPlayerById,
  getPlayerByUserId,
  getPlayersByWantedTeam,
  searchPlayers,
} from '../controllers/player.controller.js';
import { getAllPlayersGoalsBySeasonAndLeague } from '../controllers/allPlayerStatsBySeason.controller.js';

const router = express.Router();

router.post('/add', addPlayer);

router.get('/get/:id', getPlayerByUserId);
router.get('/:id', getPlayerById);
router.get('/get-wanted-team/:id', getPlayersByWantedTeam);
router.get('/top-stats/:leagueId', getAllPlayersGoalsBySeasonAndLeague);
router.get('/', searchPlayers);

export default router;
