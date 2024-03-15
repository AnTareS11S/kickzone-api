import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 30,
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
    image: {
      type: String,
      default:
        'https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png',
    },
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

export default Post;
