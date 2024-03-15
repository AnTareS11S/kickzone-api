import express from 'express';
import {
  createCoach,
  getCoachById,
  getCoachByUserId,
} from '../controllers/coach.controller.js';

const router = express.Router();

router.post('/create', createCoach);
router.get('/get/:id', getCoachByUserId);
router.get('/:id', getCoachById);

export default router;
