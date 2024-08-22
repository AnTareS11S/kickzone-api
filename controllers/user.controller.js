import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Player from '../models/player.model.js';
import { errorHandler } from '../utils/error.js';
import { deleteImageFromS3, uploadImageToS3 } from '../utils/s3Utils.js';
import sharp from 'sharp';
import Referee from '../models/referee.model.js';
import Coach from '../models/coach.model.js';
import Conversation from '../models/conversation.model.js';

export const addUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, 'You are not authorized to edit this user'));
  }

  try {
    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    if (!req.file || !req.file.buffer) {
      const existedUser = await User.findOne({ _id: req.params.id });
      if (existedUser) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: req.params.id },
          { ...req.body },
          { new: true }
        );
        const { password, ...rest } = updatedUser._doc;
        return res.status(200).json(rest);
      }
    }

    const buffer = await sharp(req.file.buffer)
      .resize({ width: 200, height: 200, fit: 'cover' })
      .toBuffer();

    const photoName = await uploadImageToS3(buffer, req.file.mimetype);
    const existedUser = await User.findById(req.params.id);

    if (existedUser) {
      existedUser.photo ? await deleteImageFromS3(existedUser.photo) : null;

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            ...req.body,
            photo: photoName,
          },
        },
        { new: true }
      );

      const { password, ...rest } = updatedUser._doc;
      return res.status(200).json(rest);
    }

    const newUser = new User({
      ...req.body,
      photo: photoName,
    });

    await newUser.save();
    const { password, ...rest } = newUser._doc;
    res.status(201).json(rest);
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
    })
      .populate({
        path: 'author',
        model: User,
        select: 'username photo _id imageUrl',
      })
      .sort({ createdAt: -1 });

    const likes = await Post.find({
      _id: { $in: childPostIds },
      likes: { $ne: [req.params.id] },
    })
      .populate({
        path: 'author',
        model: User,
        select: 'username photo _id imageUrl',
      })
      .where('author')
      .ne(req.params.id)
      .sort({ createdAt: -1 });

    res.status(200).json({ replies, likes });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'posts',
        model: Post,
        select: 'title createdAt',
        options: { sort: { createdAt: -1 } },
      });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Not found!' });
    }

    if (user.photo) {
      user.imageUrl = 'https://d3awt09vrts30h.cloudfront.net/' + user.photo;
    } else {
      user.imageUrl = null;
    }

    user.save();

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getUserComments = async (req, res, next) => {
  try {
    const userComments = await Post.find({
      author: req.params.id,
      parentId: { $ne: null },
    })
      .sort({ createdAt: -1 })
      .populate({ path: 'author', model: User });

    res.status(200).json(userComments);
  } catch (error) {
    next(error);
  }
};

export const getUserAccountByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      members: { $in: [userId] },
    });

    const participantIds = conversations.reduce((ids, conversation) => {
      const otherMember = conversation.members.find(
        (member) => member.toString() !== userId
      );
      if (otherMember) {
        ids.push(otherMember);
      }
      return ids;
    }, []);

    console.log(participantIds);

    const [player, referee, coach] = await Promise.all([
      Player.findOne({ _id: { $in: participantIds } }),
      Referee.findOne({ _id: { $in: participantIds } }),
      Coach.findOne({ _id: { $in: participantIds } }),
    ]);

    if (!player && !referee && !coach) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userAccount = player || referee || coach;

    res.status(200).json(userAccount);
  } catch (error) {
    next(error);
  }
};
