import express from 'express';
import {
  changePassword,
  deleteUser,
  getActivity,
  getUserById,
  updateUser,
} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/edit/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.post('/change-password/:id', verifyToken, changePassword);
router.get('/activity/:id', verifyToken, getActivity);
router.get('/get/:id', getUserById);

export default router;
