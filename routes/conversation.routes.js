import express from 'express';
import {
  createConversation,
  getAllPeople,
  getConversations,
} from '../controllers/conversation.controller.js';

const router = express.Router();

router.post('/', createConversation);
router.get('/:userId', getConversations);
router.get('/get-people', getAllPeople);

export default router;
