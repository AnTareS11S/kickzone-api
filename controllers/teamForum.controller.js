import mongoose from 'mongoose';
import Thread from '../models/thread.model.js';

export const addNewThread = async (req, res, next) => {
  try {
    const AuthorModel = mongoose.model(req.body.authorModel);
    const author = await AuthorModel.findOne({ user: req.body.authorId });

    const newThread = new Thread({
      ...req.body,
      teamId: author?.currentTeam,
      user: req.body.authorId,
      author: {
        id: req.body.authorId,
        model: req.body.authorModel,
      },
    });

    await newThread.save();
    res.status(201).json(newThread);
  } catch (error) {
    next(error);
  }
};

export const getThreads = async (req, res, next) => {
  try {
    const threads = await Thread.find().sort({ createdAt: -1 });

    const populatedThreads = await Promise.all(
      threads.map(async (thread) => {
        const threadObj = thread.toObject();

        const AuthorModel = mongoose.model(thread.author.model);
        const author = await AuthorModel.findOne({ user: thread.author.id });

        const preview =
          thread.content.length > 150
            ? `${thread.content.substring(0, 150)}...`
            : thread.content;

        return {
          ...threadObj,
          preview,
          likesCount: thread.likes.length,
          repliesCount: thread.replies.length,
          author: author
            ? {
                id: author._id,
                name: author.name + ' ' + author.surname,
                avatar: author.imageUrl,
              }
            : {},
        };
      })
    );

    res.status(200).json(populatedThreads);
  } catch (error) {
    next(error);
  }
};

export const getThreadById = async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.threadId);

    const AuthorModel = mongoose.model(thread.author.model);
    const author = await AuthorModel.findOne({ user: thread.author.id });

    const populatedThread = {
      ...thread.toObject(),
      likesCount: thread.likes.length,
      repliesCount: thread.replies.length,
      author: author
        ? {
            id: author._id,
            name: author.name + ' ' + author.surname,
            avatar: author.imageUrl,
          }
        : {},
    };

    res.status(200).json(populatedThread);
  } catch (error) {
    next(error);
  }
};

export const editThread = async (req, res, next) => {
  try {
    const existedThread = await Thread.findById(req.params.threadId);

    if (!existedThread) {
      return res
        .status(404)
        .json({ success: false, message: 'Thread not found!' });
    }

    const updatedThread = await Thread.findByIdAndUpdate(
      { _id: req.params.threadId },
      { ...req.body },
      {
        new: true,
      }
    );

    res.status(200).json(updatedThread);
  } catch (error) {
    next(error);
  }
};

export const handleLikeThread = async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.threadId);

    if (!thread) {
      return res
        .status(404)
        .json({ success: false, message: 'Thread not found!' });
    }

    const isLiked = thread.likes.includes(req.body.userId);

    if (isLiked) {
      thread.likes = thread.likes.filter(
        (like) => like.toString() !== req.body.userId
      );
    } else {
      thread.likes.push(req.body.userId);
    }

    await thread.save();
    res.status(200).json(thread);
  } catch (error) {
    next(error);
  }
};
