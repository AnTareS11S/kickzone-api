import express from 'express';
import {
  createConversation,
  deleteConversation,
  getConversationIncludesTwoUsers,
  getConversations,
  getUnreadConversationsCount,
  markConversationAsRead,
} from '../controllers/conversation.controller.js';

const router = express.Router();

router.post('/', createConversation);
router.get('/:userId', getConversations);
router.get('/find/:firstUserId/:secondUserId', getConversationIncludesTwoUsers);
router.get('/unread/:userId', getUnreadConversationsCount);
router.post('/mark-as-read/:conversationId', markConversationAsRead);
router.delete('/delete/:conversationId', deleteConversation);

export default router;
