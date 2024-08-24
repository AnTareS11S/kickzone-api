import express from 'express';
import {
  changePassword,
  deleteUser,
  getActivity,
  getUserById,
  addUser,
  getUserComments,
  getUserAccountByUserId,
  getAccountByUserId,
  getAllAccounts,
} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.post('/add/:id', verifyToken, upload.single('photo'), addUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.post('/change-password/:id', verifyToken, changePassword);
router.get('/activity/:id', verifyToken, getActivity);
router.get('/get/:id', getUserById);
router.get('/get-user-info/:userId', getUserAccountByUserId);
router.get('/get-account-id/:userId', getAccountByUserId);
router.get('/get-comments/:id', getUserComments);
router.get('/get-accounts', getAllAccounts);

export default router;
