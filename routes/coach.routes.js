import express from 'express';
import {
  createCoach,
  getCoachById,
  getCoachByUserId,
  getCoachesWithoutCurrentTeam,
} from '../controllers/coach.controller.js';
import upload from '../utils/upload.js';
import { getCoachStatsByTeamId } from '../controllers/coachStats.controller.js';

const router = express.Router();

router.post('/create', upload.single('photo'), createCoach);
router.get('/coaches-without-team', getCoachesWithoutCurrentTeam);
router.get('/get/:id', getCoachByUserId);
router.get('/:id', getCoachById);
router.get('/coach-stats/:coachId/:teamId', getCoachStatsByTeamId);

export default router;
