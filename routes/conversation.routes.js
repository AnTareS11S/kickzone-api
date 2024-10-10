import express from 'express';
import {
  createConversation,
  deleteConversation,
  getConversationIncludesTwoUsers,
  getConversations,
} from '../controllers/conversation.controller.js';

const router = express.Router();

router.post('/', createConversation);
router.get('/:userId', getConversations);
router.get('/find/:firstUserId/:secondUserId', getConversationIncludesTwoUsers);
router.delete('/delete/:conversationId', deleteConversation);

export default router;
