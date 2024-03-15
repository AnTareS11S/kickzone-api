import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import refereeRoutes from './routes/referee.routes.js';
import coachRoutes from './routes/coach.routes.js';
import teamRoutes from './routes/team.routes.js';
import leagueRoutes from './routes/league.routes.js';
import postRoutes from './routes/post.routes.js';
import playerRoutes from './routes/player.routes.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

app.use(express.json());

app.use(cookieParser());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(3000);
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.log(err));

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/referee', refereeRoutes);
app.use('/api/league', leagueRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/post', postRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({ success: false, statusCode, message });
});
