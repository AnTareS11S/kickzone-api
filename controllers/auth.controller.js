import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';
import AdminNotification from '../models/adminNotifications.model.js';
import Ban from '../models/ban.model.js';

export const signUp = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(password, 10); // 10 is the salt is the number of rounds of hashing
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isOnboardingCompleted: false,
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    const { password: userPassword, ...rest } = newUser._doc;

    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const checkUsername = async (req, res, next) => {
  const { username } = req.query;

  // Basic validation
  if (!username || typeof username !== 'string') {
    return res.status(400).json({
      message: 'Valid username parameter is required',
    });
  }

  try {
    // Only check existence, don't retrieve full document
    const exists = await User.exists({
      username: { $regex: new RegExp(`^${username}$`, 'i') },
    });

    res.status(200).json({ exists: !!exists });
  } catch (error) {
    next(error);
  }
};

export const checkEmail = async (req, res, next) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email });

    if (user) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, 'User not found'));
    }

    const validPassword = await bcrypt.compare(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(403, 'Invalid credentials'));
    }

    const activeBan = await Ban.findOne({
      user: validUser._id,
      status: 'Active',
      endDate: { $gte: new Date() },
    });

    if (activeBan) {
      return res.status(405).json({
        statusCode: 405,
        error: 'Account is banned',
        banInfo: {
          reason: activeBan.reason,
          endDate: activeBan.endDate,
          remainingTime: activeBan.endDate - new Date(),
        },
      });
    }

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    }); // 1d = 1 day

    console.log('Generated Token:', token);

    const { password: userPassword, ...rest } = validUser._doc; // _doc is the document that we get from the database
    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : '',
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
      const { password: userPassword, ...rest } = user._doc;
      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8); // generate a random password
      const hashedPassword = bcrypt.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(' ').join('').toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        photo: req.body.photo,
        isOnboardingCompleted: false,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
      const { password: userPassword, ...rest } = newUser._doc;
      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = (req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json({ message: 'Sign out successfully' });
  } catch (error) {
    next(error);
  }
};

export const completeOnboarding = async (req, res, next) => {
  const { userId, wantedRole, bio, username } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { wantedRole, bio, isOnboardingCompleted: true, username } },
      { new: true }
    );

    const notification = new AdminNotification({
      title: 'New User',
      content: `${username} has completed onboarding`,
      userId,
      type: 'newUser',
    });

    await notification.save();

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
