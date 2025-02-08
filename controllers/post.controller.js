import sharp from 'sharp';
import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { getAllChildPosts } from '../utils/postUtils.js';
import { deleteImageFromS3, uploadImageToS3 } from '../utils/s3Utils.js';

export const addPost = async (req, res, next) => {
  try {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 1200, height: 900, fit: 'fill' })
      .toBuffer();

    const postPhotoName = await uploadImageToS3(buffer, req.file.mimetype);

    const newPost = new Post({
      ...req.body,
      postPhoto: postPhotoName,
    });
    await newPost.save();

    await User.findByIdAndUpdate(req.body.author, {
      $push: { posts: newPost._id },
    });

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

export const editPost = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      const updatedPost = await Post.findOneAndUpdate(
        { _id: req.params.id },
        { ...req.body },
        { new: true }
      );

      return res.status(200).json(updatedPost);
    }

    const buffer = await sharp(req.file.buffer)
      .resize({ width: 1200, height: 900, fit: 'fill' })
      .toBuffer();

    const postPhotoName = await uploadImageToS3(buffer, req.file.mimetype);

    const existingPost = await Post.findOne({ _id: req.params.id });

    if (existingPost) {
      existingPost.postPhoto
        ? await deleteImageFromS3(existingPost.postPhoto)
        : null;
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id },
      {
        ...req.body,
        postPhoto: postPhotoName,
      },
      { new: true }
    );

    res.status(200).json(updatedPost);
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
          select: '_id username parentId photo imageUrl',
        },
      });

    posts.forEach(async (post) => {
      if (post.author?.photo) {
        post.author.imageUrl =
          'https://d3awt09vrts30h.cloudfront.net/' + post.author.photo;
      } else {
        post.author.imageUrl = null;
      }

      if (post.postPhoto) {
        post.imageUrl =
          'https://d3awt09vrts30h.cloudfront.net/' + post.postPhoto;
      } else {
        post.imageUrl = null;
      }
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
        select: '_id id username photo imageUrl',
      })
      .populate({
        path: 'children',
        options: { sort: { createdAt: -1 } },
        populate: [
          {
            path: 'author',
            model: User,
            select: '_id username parentId photo imageUrl',
          },
          {
            path: 'children',
            model: Post,
            options: { sort: { createdAt: -1 } },
            populate: {
              path: 'author',
              model: User,
              select: '_id username parentId photo imageUrl',
            },
          },
        ],
      });

    if (post.author?.photo) {
      post.author.imageUrl =
        'https://d3awt09vrts30h.cloudfront.net/' + post.author.photo;
    } else {
      post.author.imageUrl = null;
    }

    if (post.postPhoto) {
      post.imageUrl = 'https://d3awt09vrts30h.cloudfront.net/' + post.postPhoto;
    } else {
      post.imageUrl = null;
    }

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

    res.status(200).json(savedComment);
  } catch (error) {
    next(error);
  }
};

export const editComment = async (req, res, next) => {
  try {
    const updatedComment = await Post.findOneAndUpdate(
      { _id: req.params.id },
      { postContent: req.body.post },
      { new: true }
    );

    res.status(200).json(updatedComment);
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

export const removeLikeFromPost = async (req, res, next) => {
  try {
    const originalPost = await Post.findById(req.params.id);

    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const unlikedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likes: req.body.userId },
      },
      { new: true }
    );

    res.status(200).json(unlikedPost);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const postToDelete = await Post.findById(req.body.id).populate('author');

    if (!postToDelete) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (postToDelete.parentId) {
      await Post.findByIdAndUpdate(postToDelete.parentId, {
        $pull: { children: postToDelete._id },
      });
    }

    const descendantPosts = await getAllChildPosts(req.body.id);

    const descendantPostIds = [
      req.body.id,
      ...descendantPosts.map((post) => post._id),
    ];

    const uniqueAuthorIds = new Set(
      [
        ...descendantPosts.map((post) => post.author?._id?.toString()),
        postToDelete.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    if (postToDelete.postPhoto) {
      await deleteImageFromS3(postToDelete.postPhoto);
    }

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
