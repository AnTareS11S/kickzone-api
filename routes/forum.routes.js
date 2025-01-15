import express from 'express';
import {
  addNewThread,
  getThreads,
} from '../controllers/teamForum.controller.js';

const router = express.Router();

router.post('/new-thread', addNewThread);
router.get('/threads', getThreads);

export default router;
