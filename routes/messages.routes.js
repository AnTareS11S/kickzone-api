import express from 'express';
import {
  getMessages,
  sendMessage,
} from '../controllers/messages.controller.js';

const router = express.Router();

router.post('/send-message', sendMessage);
router.get('/:conversationId', getMessages);

export default router;
