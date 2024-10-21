import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
} from '../controllers/notifications.controller.js';

const router = express.Router();

router.get('/:receiverId', getNotifications);
router.post('/markAsRead/:receiverId', markNotificationAsRead);

export default router;
