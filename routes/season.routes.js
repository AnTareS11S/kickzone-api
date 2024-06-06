import express from 'express';
import { checkSeasonName } from '../controllers/season.controller.js';

const router = express.Router();

router.get('/check-season-name', checkSeasonName);

export default router;
