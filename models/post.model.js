import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    postContent: { type: String, trim: true, required: true },
    parentId: {
      type: String,
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    postPhoto: {
      type: String,
    },
    imageUrl: {
      type: String,
      default: 'https://d3awt09vrts30h.cloudfront.net/default_post_image.webp',
    },
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

export default Post;
