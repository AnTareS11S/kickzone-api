import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
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
import formationRoutes from './routes/formation.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import matchRoutes from './routes/match.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import cookieParser from 'cookie-parser';
import { S3Client } from '@aws-sdk/client-s3';

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

// Socket.IO Setup
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
  },
});

// Socket.IO State
let users = [];
let userUnreadMessagesCount = new Map();
let notificationCount = new Map();

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

const incrementUnreadCount = (userId) => {
  const currentCount = userUnreadMessagesCount.get(userId) || 0;
  userUnreadMessagesCount.set(userId, currentCount + 1);
  return currentCount + 1;
};

const incrementUnreadNotificationCount = (userId) => {
  const currentCount = notificationCount.get(userId) || 0;
  notificationCount.set(userId, currentCount + 1);
  return currentCount + 1;
};

const decrementUnreadNotificationCount = (userId, amount = 1) => {
  const currentCount = notificationCount.get(userId) || 0;
  const newCount = Math.max(0, currentCount - amount);
  notificationCount.set(userId, newCount);
  return newCount;
};

const decrementUnreadCount = (userId, amount = 1) => {
  const currentCount = userUnreadMessagesCount.get(userId) || 0;
  const newCount = Math.max(0, currentCount - amount);
  userUnreadMessagesCount.set(userId, newCount);
  return newCount;
};

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit('getUsers', users);
    const unreadCount = userUnreadMessagesCount.get(userId) || 0;
    socket.emit('getUnreadCount', unreadCount);
  });

  socket.on(
    'sendMessage',
    async ({ senderId, receiverId, text, conversationId }) => {
      const user = getUser(receiverId);
      if (user) {
        io.to(user.socketId).emit('getMessage', {
          senderId,
          text,
          conversationId,
          createdAt: Date.now(),
        });
        io.emit('conversationCreated', {
          senderId,
          receiverId,
          conversationId,
        });
      }
      const newUnreadCount = incrementUnreadCount(receiverId);
      if (user) {
        io.to(user.socketId).emit('getUnreadCount', newUnreadCount);
        io.to(user.socketId).emit('getUnreadMessage', {
          conversationId,
          senderId,
        });
      }
    }
  );

  socket.on('newConversation', ({ senderId, receiverId, conversationId }) => {
    const receiverSocket = getUser(receiverId);
    if (receiverSocket) {
      io.emit('conversationCreated', {
        senderId,
        receiverId,
        conversationId,
      });
    }
  });

  socket.on('sendNotification', ({ senderId, receiverId, type }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit('getNotification', {
        senderId,
        type,
      });
    }
  });

  socket.on(
    'newUnreadNotification',
    ({ userId, authorId, isLiked, isComment }) => {
      const user = getUser(authorId);
      if (user) {
        if (isLiked || isComment) {
          const newUnreadNotificationCount =
            incrementUnreadNotificationCount(authorId);
          io.to(user.socketId).emit(
            'getUnreadNotificationCount',
            newUnreadNotificationCount
          );
        } else {
          const newUnreadNotificationCount =
            decrementUnreadNotificationCount(authorId);
          io.to(user.socketId).emit(
            'getUnreadNotificationCount',
            newUnreadNotificationCount
          );
        }
      }
    }
  );

  socket.on('newUnreadMessage', ({ userId, conversationId }) => {
    const user = getUser(userId);
    if (user) {
      const newUnreadNotificationCount = incrementUnreadCount(userId);
      io.to(user.socketId).emit(
        'getUnreadNotificationCount',
        newUnreadNotificationCount
      );
    }
  });

  socket.on('markAsRead', ({ conversationId, userId }) => {
    try {
      const user = getUser(userId);
      if (user) {
        const newUnreadCount = decrementUnreadCount(userId);
        io.to(user.socketId).emit('getUnreadCount', newUnreadCount);
        io.emit('messageRead', { conversationId, userId });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
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
app.use('/api/formation', formationRoutes);
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
    httpServer.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.log(err));
