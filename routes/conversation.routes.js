import express from 'express';
import {
  createConversation,
  getAllPeople,
  getConversations,
  getMessages,
  sendMessage,
} from '../controllers/conversation.controller.js';

const router = express.Router();

router.get('/', createConversation);
router.get('/get-people', getAllPeople);
router.get('/messages', getMessages);
router.post('/send-message', sendMessage);

export default router;
