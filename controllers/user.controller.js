import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, 'You are not authorized to edit this user'));
  }

  try {
    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          photo: req.body.photo,
          bio: req.body.bio,
        },
      },
      { new: true }
    ); // new: true returns the updated document

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(
      errorHandler(403, 'You are not authorized to delete this user')
    );
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, 'You are not authorized to edit this user'));
  }

  try {
    const user = await User.findById(req.params.id);
    const validPassword = bcrypt.compareSync(
      req.body.currentPassword,
      user.password
    );
    if (!validPassword) {
      return next(errorHandler(403, 'Invalid password'));
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.newPassword, salt);

    await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: { password: hashedPassword },
      },
      { new: true }
    );

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

export const getActivity = async (req, res, next) => {
  try {
    const userPosts = await Post.find({ author: req.params.id });

    const childPostIds = userPosts.reduce((acc, userPost) => {
      return acc.concat(userPost.children);
    }, []);

    const replies = await Post.find({
      _id: { $in: childPostIds },
      author: { $ne: req.params.id },
    }).populate({
      path: 'author',
      model: User,
      select: 'username photo _id',
    });

    const likes = await Post.find({
      _id: { $in: childPostIds },
      likes: { $ne: [] },
    }).populate({
      path: 'likes',
      model: User,
      select: 'username photo _id',
    });

    const activity = [...replies, ...likes];

    res.status(200).json(activity);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
