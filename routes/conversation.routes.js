import express from 'express';
import {
  createConversation,
  deleteConversation,
  getConversationIncludesTwoUsers,
  getConversations,
  getUnreadConversations,
  markConversationAsRead,
} from '../controllers/conversation.controller.js';

const router = express.Router();

router.post('/', createConversation);
router.get('/:userId', getConversations);
router.get('/find/:firstUserId/:secondUserId', getConversationIncludesTwoUsers);
router.get('/unread/:userId', getUnreadConversations);
router.post('/mark-as-read', markConversationAsRead);
router.delete('/delete/:conversationId', deleteConversation);

export default router;
