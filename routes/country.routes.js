import express from 'express';
import { checkCountryName } from '../controllers/country.controller.js';

const router = express.Router();

router.get('/check-country-name', checkCountryName);

export default router;
