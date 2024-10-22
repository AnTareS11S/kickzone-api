import express from 'express';
import {
  getNotificationsDetails,
  getUnreadNotificationsCount,
  markNotificationAsRead,
} from '../controllers/notifications.controller.js';

const router = express.Router();

router.get('/unread-count/:receiverId', getUnreadNotificationsCount);
router.get('/details/:receiverId', getNotificationsDetails);
router.post('/markAsRead/:receiverId', markNotificationAsRead);

export default router;
