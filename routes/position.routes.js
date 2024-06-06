import express from 'express';
import { checkPositionName } from '../controllers/position.controller.js';

const router = express.Router();

router.get('/check-position-name', checkPositionName);

export default router;
