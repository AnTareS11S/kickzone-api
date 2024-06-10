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
import {
  addPlayerFan,
  checkIsPlayerFan,
  removePlayerFan,
} from '../controllers/playerFans.controller.js';

const router = express.Router();

router.post('/add', upload.single('photo'), addPlayer);

router.get('/get/:id', getPlayerByUserId);
router.get('/:id', getPlayerById);
router.get('/get-wanted-team/:id', getPlayersByWantedTeam);
router.get('/top-stats/:leagueId', getAllPlayersStatsBySeasonAndLeague);
router.get('/player-top-stats/:playerId', getAllPlayerStatsByPlayerId);
router.get('/', searchPlayers);
router.post('/follow/:id', addPlayerFan);
router.post('/is-fan/:id', checkIsPlayerFan);
router.post('/unfollow/:id', removePlayerFan);

export default router;
