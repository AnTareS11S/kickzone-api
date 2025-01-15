import mongoose from 'mongoose';
import Thread from '../models/thread.model.js';

export const addNewThread = async (req, res, next) => {
  try {
    const AuthorModel = mongoose.model(req.body.authorModel);
    const author = await AuthorModel.findOne({ user: req.body.authorId });

    const newThread = new Thread({
      ...req.body,
      teamId: author?.currentTeam,
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
