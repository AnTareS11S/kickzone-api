import express from 'express';
import {
  changePassword,
  deleteUser,
  getUserById,
  addUser,
  getUserComments,
  getUserInfoByUserId,
  getAccountByUserId,
  getAllAccounts,
  getContentDeletedNotificationByUserId,
} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import upload from '../utils/upload.js';
import {
  getRoleChangeNotificationByUserId,
  hasRoleChangeNotification,
  markContentDeletedNotificationAsRead,
  markRoleChangeNotificationAsRead,
} from '../controllers/roleChangeNotification.controller.js';

const router = express.Router();

router.post('/add/:id', verifyToken, upload.single('photo'), addUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.post('/change-password/:id', verifyToken, changePassword);
router.get('/get/:id', getUserById);
router.get('/get-user-info/:userId', getUserInfoByUserId);
router.get('/get-account-id/:userId', getAccountByUserId);
router.get('/get-comments/:id', getUserComments);
router.get('/get-accounts', getAllAccounts);
router.get('/has-admin-notification/:userId', hasRoleChangeNotification);
router.get('/get-content-notif/:userId', getContentDeletedNotificationByUserId);
router.get(
  '/get-role-change-notifications/:userId',
  getRoleChangeNotificationByUserId
);
router.post(
  '/mark-role-change-notification-as-read',
  markRoleChangeNotificationAsRead
);
router.post(
  '/mark-content-notification-as-read',
  markContentDeletedNotificationAsRead
);

export default router;
