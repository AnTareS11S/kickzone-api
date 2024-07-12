import express from 'express';
import {
  getAllPeople,
  getConversations,
  getMessages,
  sendMessage,
} from '../controllers/conversation.controller.js';

const router = express.Router();

router.get('/', getConversations);
router.get('/get-people', getAllPeople);
router.get('/messages', getMessages);
router.post('/send-message', sendMessage);

export default router;
