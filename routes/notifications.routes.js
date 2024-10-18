import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  updateNotificationCount,
} from '../controllers/notifications.controller.js';

const router = express.Router();

router.get('/:receiverId', getNotifications);
router.post('/update/:receiverId', updateNotificationCount);
router.post('/markAsRead/:receiverId', markNotificationAsRead);

export default router;
