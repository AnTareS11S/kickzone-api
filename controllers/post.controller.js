import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { getAllChildPosts } from '../utils/postUtils.js';

export const addPost = async (req, res, next) => {
  try {
    const newPost = new Post(req.body);
    await newPost.save();

    await User.findByIdAndUpdate(req.body.author, {
      $push: { posts: newPost._id },
    });

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: -1 })
      .populate({ path: 'author', model: User })
      .populate({
        path: 'children',
        populate: {
          path: 'author',
          model: User,
          select: '_id username parentId photo',
        },
      });
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: 'author',
        model: User,
        select: '_id id username photo',
      })
      .populate({
        path: 'children',
        populate: [
          {
            path: 'author',
            model: User,
            select: '_id username parentId photo',
          },
          {
            path: 'children',
            model: Post,
            populate: {
              path: 'author',
              model: User,
              select: '_id username parentId photo',
            },
          },
        ],
      });
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

export const addCommentToPost = async (req, res, next) => {
  try {
    const originalPost = await Post.findById(req.params.id);

    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = new Post({
      postContent: req.body.commentContent,
      author: req.body.author,
      parentId: req.params.id,
    });

    const savedComment = await newComment.save();

    originalPost.children.push(savedComment._id);

    await originalPost.save();

    res.status(201).json(savedComment);
  } catch (error) {
    next(error);
  }
};

export const addLikeToPost = async (req, res, next) => {
  try {
    const originalPost = await Post.findById(req.params.id);

    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { likes: req.body.userId },
      },
      { new: true }
    );

    res.status(200).json(likedPost);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const mainPost = await Post.findById(req.body.id).populate('author');

    if (!mainPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const descendantPosts = await getAllChildPosts(req.body.id);

    const descendantPostIds = [
      req.body.id,
      ...descendantPosts.map((post) => post._id),
    ];

    const uniqueAuthorIds = new Set(
      [
        ...descendantPosts.map((post) => post.author?._id?.toString()),
        mainPost.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    await Post.deleteMany({ _id: { $in: descendantPostIds } });

    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { posts: { $in: descendantPostIds } } }
    );

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};
