import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

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

export const deleteConversation = async (req, res, next) => {
  try {
    await Conversation.findByIdAndDelete(req.params.conversationId);

    await Message.deleteMany({ conversation: req.params.conversationId });

    res.status(204).json('Conversation has been deleted');
  } catch (error) {
    next(error);
  }
};
