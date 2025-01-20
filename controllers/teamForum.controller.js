import mongoose from 'mongoose';
import Thread from '../models/thread.model.js';
import ThreadReply from '../models/threadReply.model.js';
import ThreadCategory from '../models/threadCategory.model.js';

export const addNewThread = async (req, res, next) => {
  try {
    const AuthorModel = mongoose.model(req.body.authorModel);
    const author = await AuthorModel.findOne({ user: req.body.authorId });

    const threadCategory = await ThreadCategory.findOne({
      _id: req.body.category,
    });

    threadCategory.count += 1;

    await threadCategory.save();

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
    const thread = await Thread.findById(req.params.threadId).populate({
      path: 'replies',
      options: { sort: { createdAt: -1 } },
    });

    const ThreadAuthorModel = mongoose.model(thread.author.model);
    const threadAuthor = await ThreadAuthorModel.findOne({
      user: thread.author.id,
    });

    const replyAuthorsPromises = thread.replies.map(async (reply) => {
      const ReplyAuthorModel = mongoose.model(reply.author.model);
      return ReplyAuthorModel.findOne({ _id: reply.author.id });
    });

    const replyAuthors = await Promise.all(replyAuthorsPromises);

    const populatedThread = {
      ...thread.toObject(),
      likesCount: thread.likes.length,
      repliesCount: thread.replies.length,
      author: threadAuthor
        ? {
            id: threadAuthor._id,
            name: `${threadAuthor.name} ${threadAuthor.surname}`,
            avatar: threadAuthor.imageUrl,
          }
        : {},
      replies: thread.replies.map((reply, index) => {
        const replyAuthor = replyAuthors[index];
        return {
          ...reply.toObject(),
          likesCount: reply.likes.length,
          author: replyAuthor
            ? {
                id: replyAuthor._id,
                name: `${replyAuthor.name} ${replyAuthor.surname}`,
                avatar: replyAuthor.imageUrl,
              }
            : {},
        };
      }),
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

    const LinkingUserModel = mongoose.model(req.body.role);
    const likingUser = await LinkingUserModel.findOne({
      user: req.body.userId,
    });

    if (!thread) {
      return res
        .status(404)
        .json({ success: false, message: 'Thread not found!' });
    }

    const isLiked = thread.likes.some(
      (like) =>
        like.id.toString() === likingUser._id.toString() &&
        like.model === req.body.role
    );

    if (isLiked) {
      thread.likes = thread.likes.filter(
        (like) =>
          !(
            like.id.toString() === likingUser._id.toString() &&
            like.model === req.body.role
          )
      );
    } else {
      thread.likes.push({
        model: req.body.role,
        id: likingUser._id,
      });
    }

    await thread.save();
    res.status(200).json(thread);
  } catch (error) {
    next(error);
  }
};

export const deleteThread = async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.threadId);

    if (!thread) {
      return res
        .status(404)
        .json({ success: false, message: 'Thread not found!' });
    }

    const threadRepliesPromises = thread.replies.map(async (reply) => {
      await ThreadReply.findByIdAndDelete(reply);
    });

    await Promise.all(threadRepliesPromises);

    const threadCategory = await ThreadCategory.findById(thread.category);
    if (threadCategory && threadCategory.count > 0) {
      threadCategory.count -= 1;
      await threadCategory.save();
    }

    await Thread.findByIdAndDelete(req.params.threadId);
    res.status(200).json({ success: true, message: 'Thread deleted!' });
  } catch (error) {
    next(error);
  }
};

export const addCommentToThread = async (req, res, next) => {
  try {
    const originalThread = await Thread.findById(req.params.threadId);

    const AuthorModel = mongoose.model(req.body.model);
    const author = await AuthorModel.findOne({ user: req.body.userId });

    if (!originalThread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    const newComment = new ThreadReply({
      ...req.body,
      threadId: req.params.threadId,
      author: {
        id: author._id,
        model: req.body.model,
      },
      user: req.body.userId,
    });

    const savedComment = await newComment.save();

    originalThread.replies.push(savedComment._id);

    await originalThread.save();

    res.status(201).json(savedComment);
  } catch (error) {
    next(error);
  }
};

export const editComment = async (req, res, next) => {
  try {
    const existedComment = await ThreadReply.findById(req.params.commentId);

    if (!existedComment) {
      return res
        .status(404)
        .json({ success: false, message: 'Comment not found!' });
    }

    const updatedComment = await ThreadReply.findByIdAndUpdate(
      { _id: req.params.commentId },
      { ...req.body },
      {
        new: true,
      }
    );

    res.status(200).json(updatedComment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await ThreadReply.findById(req.params.commentId);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: 'Comment not found!' });
    }

    const thread = await Thread.findById({ _id: comment.threadId });

    if (!thread) {
      return res
        .status(404)
        .json({ success: false, message: 'Thread not found!' });
    }

    thread.replies = thread.replies.filter(
      (reply) => reply.toString() !== req.params.commentId
    );

    await thread.save();

    await ThreadReply.findByIdAndDelete(req.params.commentId);
    res.status(200).json({ success: true, message: 'Comment deleted!' });
  } catch (error) {
    next(error);
  }
};

export const handleLikeComment = async (req, res, next) => {
  try {
    const comment = await ThreadReply.findById(req.params.commentId);

    const LinkingUserModel = mongoose.model(req.body.role);
    const likingUser = await LinkingUserModel.findOne({
      user: req.body.userId,
    });

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: 'Comment not found!' });
    }

    const isLiked = comment.likes.some(
      (like) =>
        like.id.toString() === likingUser._id.toString() &&
        like.model === req.body.role
    );

    if (isLiked) {
      comment.likes = comment.likes.filter(
        (like) =>
          !(
            like.id.toString() === likingUser._id.toString() &&
            like.model === req.body.role
          )
      );
    } else {
      comment.likes.push({
        model: req.body.role,
        id: likingUser._id,
      });
    }

    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};
