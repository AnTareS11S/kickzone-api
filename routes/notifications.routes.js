import express from 'express';
import {
  deleteNotification,
  getNotificationsDetails,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../controllers/notifications.controller.js';

const router = express.Router();

router.get('/unread-count/:receiverId', getUnreadNotificationsCount);
router.get('/details/:receiverId', getNotificationsDetails);
router.post('/mark-as-read/:receiverId', markNotificationAsRead);
router.post('/mark-all-as-read/:receiverId', markAllNotificationsAsRead);
router.delete('/delete/:receiverId', deleteNotification);

export default router;
