import express from 'express';
import { getMatchOverview } from '../controllers/match.controller.js';

const router = express.Router();

router.get('/overview/:matchId', getMatchOverview);

export default router;
