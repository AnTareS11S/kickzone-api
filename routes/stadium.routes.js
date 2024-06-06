import express from 'express';
import { checkStadiumName } from '../controllers/stadium.controller.js';

const router = express.Router();

router.get('/check-stadium-name', checkStadiumName);

export default router;
