import express from 'express';
import {
  addCommentToPost,
  addPost,
  deletePost,
  getPostById,
  getPosts,
} from '../controllers/post.controller.js';

const router = express.Router();

router.post('/add', addPost);
router.get('/all', getPosts);
router.get('/get/:id', getPostById);
router.post('/comment/:id', addCommentToPost);
router.delete('/delete', deletePost);

export default router;
