import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import refereeRoutes from './routes/referee.routes.js';
import coachRoutes from './routes/coach.routes.js';
import teamRoutes from './routes/team.routes.js';
import leagueRoutes from './routes/league.routes.js';
import postRoutes from './routes/post.routes.js';
import playerRoutes from './routes/player.routes.js';
import countryRoutes from './routes/country.routes.js';
import seasonRoutes from './routes/season.routes.js';
import positionRoutes from './routes/position.routes.js';
import stadiumRoutes from './routes/stadium.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import matchRoutes from './routes/match.routes.js';
import forumRoutes from './routes/forum.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import cookieParser from 'cookie-parser';
import { S3Client } from '@aws-sdk/client-s3';
import {
  getForumNotification,
  updateNotificationCount,
  updateTeamForumNotification,
  updateTeamTrainingNotification,
} from './utils/helper.js';
import TrainingNotifications from './models/trainingNotifications.model.js';

dotenv.config();

// AWS Configuration
export const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

export const s3 = new S3Client({
  accessKeyId: accessKey,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

// Express App Setup
const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

const PORT = process.env.PORT || 3000;

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTED_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const connections = {};
let users = [];
let teamTrainingNotifications = new Map();
let teamForumNotifications = new Map();

// Socket.IO State
let userUnreadMessagesCount = new Map();

// Socket.IO Helper Functions
const addUser = (userId, socketId) => {
  if (!userId) return;
  users = users.filter((user) => user.userId !== userId);
  users.push({ userId, socketId });
  if (!userUnreadMessagesCount.has(userId)) {
    userUnreadMessagesCount.set(userId, 0);
  }
};

const removeUser = (socketId) => {
  const user = users.find((user) => user.socketId === socketId);
  if (user) {
    userUnreadMessagesCount.delete(user.userId);
  }
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const incrementUnreadMessageCount = (userId) => {
  const count = userUnreadMessagesCount.get(userId) || 0;
  userUnreadMessagesCount.set(userId, count + 1);
  return count + 1;
};

const decrementUnreadMessageCount = (userId) => {
  const count = userUnreadMessagesCount.get(userId) || 0;
  userUnreadMessagesCount.set(userId, count - 1);
  return count - 1;
};

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit('getUsers', users);

    if (!connections[userId]) {
      connections[userId] = {
        socketId: socket.id,
        unreadConversations: [],
      };
    }
  });

  socket.on(
    'sendMessage',
    async ({ senderId, receiverId, text, conversationId }) => {
      const user = getUser(receiverId);
      if (user) {
        io.to(user?.socketId).emit('getMessage', {
          senderId,
          text,
          conversationId,
          createdAt: Date.now(),
        });
      }

      if (!connections[senderId]) {
        connections[senderId] = {
          socketId: socket.id,
          unreadConversations: [],
        };
      } else {
        if (
          !connections[senderId]?.unreadConversations?.includes(conversationId)
        ) {
          connections[senderId].unreadConversations.push(conversationId);
        }
      }

      const newUnreadMessageCount = incrementUnreadMessageCount(senderId);
      io.to(user?.socketId).emit(
        'getUnreadMessageCount',
        newUnreadMessageCount
      );
    }
  );

  socket.on('newConversation', ({ receiverId }) => {
    const receiverSocket = getUser(receiverId);
    if (receiverSocket) {
      io.emit('conversationCreated');
    }
  });

  // Send notification to receiver
  socket.on(
    'sendNotification',
    ({ senderId, receiverId, type, postId, createdAt }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit('getNotification', {
          senderId,
          type,
          postId,
          createdAt,
        });
      }
    }
  );
  // Upadate unread notification count
  socket.on(
    'newUnreadNotification',
    async ({
      userId,
      authorId,
      postId,
      type,
      action,
      notificationId,
      username,
      userImg,
    }) => {
      const user = getUser(authorId);
      try {
        const result = await updateNotificationCount(
          authorId,
          userId,
          postId,
          type,
          action,
          notificationId
        );

        if (user) {
          io.to(user.socketId).emit(
            'getUnreadNotificationCount',
            result?.unreadCount
          );

          switch (action) {
            case 'create':
              if (result?.notification) {
                io.to(user.socketId).emit('getNotification', {
                  senderId: userId,
                  type,
                  postId,
                  username: username,
                  userImg: userImg,
                  ...result?.notification,
                });
              }
              break;
            case 'delete':
              io.to(user.socketId).emit('removeNotification', {
                senderId: userId,
                authorId,
                postId,
                type,
              });
              break;
            default:
              break;
          }
        }
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  );
  // Mark notification as read
  socket.on('updateUnreadNotificationCount', ({ userId, count }) => {
    const user = getUser(userId);
    if (user) {
      io.to(user.socketId).emit('getCount', count);
    }
  });

  socket.on('updateUnreadMessageCount', ({ userId, count }) => {
    const user = getUser(userId);
    if (user) {
      io.to(user?.socketId).emit('getUnreadCount', count);
    }
  });

  socket.on('messagesRead', ({ userId, conversationId }) => {
    const user = getUser(userId);
    if (user && connections[userId]) {
      const unreadConversations =
        connections[userId]?.unreadConversations || [];
      if (unreadConversations.includes(conversationId)) {
        connections[userId].unreadConversations = unreadConversations.filter(
          (id) => id !== conversationId
        );
        const newUnreadMessageCount = decrementUnreadMessageCount(userId);
        io.to(user?.socketId).emit(
          'getUnreadMessageCount',
          newUnreadMessageCount
        );
      }
    }
  });

  socket.on('initializeTeamTrainingNotifications', async ({ teamId }) => {
    try {
      teamTrainingNotifications.set(teamId, {
        unreadCount:
          teamTrainingNotifications.get(teamId)?.unreadCount + 1 || 1,
        readBy: new Set(),
      });

      io.emit('teamTrainingNotificationStatus', {
        unreadCount: teamTrainingNotifications.get(teamId).unreadCount,
      });
    } catch (error) {
      console.error('Error sending team training notification', error);
    }
  });

  socket.on(
    'markTeamTrainingNotificationRead',
    async ({ teamId, userId, trainingId }) => {
      try {
        // Update in database
        const updatedNotification = await updateTeamTrainingNotification(
          teamId,
          userId,
          trainingId
        );
        if (updatedNotification) {
          // Update in-memory store
          const currentNotification = teamTrainingNotifications.get(teamId);
          if (currentNotification) {
            currentNotification?.readBy?.add(userId);
            currentNotification.unreadCount = Math.max(
              0,
              currentNotification.unreadCount - 1
            );
          }

          // Emit updated unread count
          if (updatedNotification?.readBy.includes(userId)) {
            socket.emit('unreadTeamTrainingNotification', {
              unreadCount: currentNotification?.unreadCount,
            });
          }
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  );

  socket.on('removeTeamTraining', ({ teamId }) => {
    try {
      const currentNotification = teamTrainingNotifications.get(teamId);

      if (currentNotification) {
        currentNotification.unreadCount = Math.max(
          0,
          currentNotification.unreadCount - 1
        );

        if (currentNotification.unreadCount === 0) {
          teamTrainingNotifications.delete(teamId);
        } else {
          teamTrainingNotifications.set(teamId, currentNotification);
        }

        io.emit('teamTrainingNotificationStatusAfterDeletion', {
          unreadCount: currentNotification?.unreadCount || 0,
        });
      }
    } catch (error) {
      console.error('Error removing team training notification:', error);
    }
  });

  socket.on(
    'initializeTeamForumNotifications',
    async ({ teamId, threadId }) => {
      try {
        teamForumNotifications.set(teamId, {
          unreadCount: teamForumNotifications.get(teamId)?.unreadCount + 1 || 1,
          readBy: new Set(),
        });

        const notification = await getForumNotification(teamId, threadId);

        io.emit('teamForumNotificationsStatus', {
          unreadCount: teamForumNotifications.get(teamId).unreadCount,
        });
        io.emit('teamForumNotificationDetails', {
          notification,
        });
      } catch (error) {
        console.error('Error sending team forum notification', error);
      }
    }
  );

  socket.on(
    'markTeamForumNotificationRead',
    async ({ teamId, userId, notificationId }) => {
      try {
        // Update in database
        const updatedNotification = await updateTeamForumNotification(
          teamId,
          userId,
          notificationId
        );
        const currentNotification = teamForumNotifications.get(teamId);
        if (currentNotification) {
          currentNotification?.readBy?.add(userId);
          currentNotification.unreadCount = Math.max(
            0,
            currentNotification.unreadCount - 1
          );

          if (updatedNotification?.readBy.includes(userId)) {
            socket.emit('teamForumNotificationStatusAfterUpdate', {
              unreadCount: currentNotification?.unreadCount || 0,
            });
          }
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  );

  socket.on('removeTeamForum', ({ teamId }) => {
    try {
      const currentNotification = teamForumNotifications.get(teamId);

      if (currentNotification) {
        currentNotification.unreadCount = Math.max(
          0,
          currentNotification.unreadCount - 1
        );

        if (currentNotification.unreadCount === 0) {
          teamForumNotifications.delete(teamId);
        } else {
          teamForumNotifications.set(teamId, currentNotification);
        }

        io.emit('teamForumNotificationStatusAfterDeletion', {
          unreadCount: currentNotification?.unreadCount || 0,
        });
      }
    } catch (error) {
      console.error('Error removing team forum notification:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    removeUser(socket.id);
    io.emit('getUsers', users);
  });
});

// Express Middleware
app.use(express.json());
app.use(cookieParser());

// Express Routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/referee', refereeRoutes);
app.use('/api/country', countryRoutes);
app.use('/api/position', positionRoutes);
app.use('/api/stadium', stadiumRoutes);
app.use('/api/season', seasonRoutes);
app.use('/api/league', leagueRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/post', postRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/auth', authRoutes);

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({ success: false, statusCode, message });
});

// Connect to MongoDB and Start Server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.log(err));
