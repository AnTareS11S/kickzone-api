import express from 'express';
import {
  addCommentToThread,
  addNewThread,
  deleteComment,
  deleteThread,
  editComment,
  editThread,
  getThreadById,
  getThreads,
  handleLikeComment,
  handleLikeThread,
} from '../controllers/teamForum.controller.js';

const router = express.Router();

router.post('/new-thread', addNewThread);
router.post('/thread/edit/:threadId', editThread);
router.post('/thread/:threadId/like', handleLikeThread);
router.post('/thread/:threadId/comment', addCommentToThread);
router.post('/comment/edit/:commentId', editComment);
router.post('/comment/:commentId/like', handleLikeComment);
router.get('/threads/:userId/:model', getThreads);
router.get('/thread/:threadId', getThreadById);
router.delete('/thread/delete/:threadId', deleteThread);
router.delete('/comment/delete/:commentId', deleteComment);

export default router;
