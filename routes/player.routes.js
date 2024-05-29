import express from 'express';
import {
  addPlayer,
  getPlayerById,
  getPlayerByUserId,
  getPlayersByWantedTeam,
  searchPlayers,
} from '../controllers/player.controller.js';
import {
  getAllPlayersStatsBySeasonAndLeague,
  getAllPlayerStatsByPlayerId,
} from '../controllers/allPlayerStatsBySeason.controller.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.post('/add', upload.single('photo'), addPlayer);

router.get('/get/:id', getPlayerByUserId);
router.get('/:id', getPlayerById);
router.get('/get-wanted-team/:id', getPlayersByWantedTeam);
router.get('/top-stats/:leagueId', getAllPlayersStatsBySeasonAndLeague);
router.get('/player-top-stats/:playerId', getAllPlayerStatsByPlayerId);
router.get('/', searchPlayers);

export default router;
