import express from 'express';
import {
  addPlayer,
  getPlayerById,
  getPlayerByUserId,
  getPlayersByIds,
  getPlayersByWantedTeam,
} from '../controllers/player.controller.js';

const router = express.Router();

router.post('/add', addPlayer);

router.get('/get/:id', getPlayerByUserId);
router.get('/:id', getPlayerById);
router.get('/get-wanted-team/:id', getPlayersByWantedTeam);
router.post('/get-players', getPlayersByIds);

export default router;
