import Post from '../models/post.model.js';

export const getAllChildPosts = async (postId) => {
  const childPosts = await Post.find({ parentId: postId });

  const descendantPosts = [];
  for (const childPost of childPosts) {
    const descendants = await getAllChildPosts(childPost._id);
    descendantPosts.push(childPost, ...descendants);
  }

  return descendantPosts;
};
