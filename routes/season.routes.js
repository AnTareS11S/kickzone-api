import express from 'express';
import {
  checkSeasonName,
  getSeasonByLeagueId,
} from '../controllers/season.controller.js';

const router = express.Router();

router.get('/check-season-name', checkSeasonName);
router.get('/get-season/:leagueId', getSeasonByLeagueId);

export default router;
