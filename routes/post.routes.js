import express from 'express';
import {
  addCommentToPost,
  addLikeToPost,
  addPost,
  deletePost,
  editComment,
  editPost,
  getPostById,
  getPosts,
  removeLikeFromPost,
} from '../controllers/post.controller.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.post('/add', upload.single('postPhoto'), addPost);
router.get('/all', getPosts);
router.get('/get/:id', getPostById);
router.post('/edit/:id', upload.single('postPhoto'), editPost);
router.post('/comment/edit/:id', editComment);
router.post('/like/:id', addLikeToPost);
router.post('/comment/:id', addCommentToPost);
router.post('/unlike/:id', removeLikeFromPost);
router.delete('/delete/:postId', deletePost);

export default router;
