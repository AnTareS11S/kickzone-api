import express from 'express';
import { checkFormationName } from '../controllers/formation.controller.js';

const router = express.Router();

router.get('/check-formation-name', checkFormationName);

export default router;
