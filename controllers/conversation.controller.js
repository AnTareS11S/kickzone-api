import Conversation from '../models/conversation.model.js';

export const createConversation = async (req, res, next) => {
  try {
    const conversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });

    await conversation.save();

    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const conversation = await Conversation.find({
      members: {
        $in: [userId],
      },
    });

    res.status(200).json(conversation);
  } catch (error) {
    next(error);
  }
};

export const getConversationIncludesTwoUsers = async (req, res, next) => {
  try {
    const { firstUserId, secondUserId } = req.params;

    const conversation = await Conversation.findOne({
      members: {
        $all: [firstUserId, secondUserId],
      },
    });

    res.status(200).json(conversation);
  } catch (error) {
    next(error);
  }
};
