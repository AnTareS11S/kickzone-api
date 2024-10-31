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

    const conversations = await Conversation.find({
      members: {
        $in: [userId],
      },
    });

    const unreadConversations = (
      await Promise.all(
        conversations.map(async (conversation) => {
          const unreadMessages = await Message.find({
            conversation: conversation._id,
            receiver: userId,
            isRead: false,
          });

          return unreadMessages.length > 0 ? conversation._id : null;
        })
      )
    ).filter(Boolean);

    res.status(200).json({
      conversations,
      unreadConversations,
    });
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

export const getUnreadConversationsCount = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      members: {
        $in: [userId],
      },
    });

    let unreadConversationsCount = 0;

    await Promise.all(
      conversations.map(async (conversation) => {
        const unreadMessages = await Message.find({
          conversation: conversation._id,
          isRead: false,
        });

        if (unreadMessages.length > 0) {
          unreadConversationsCount += 1;
        }
      })
    );

    res.status(200).json(unreadConversationsCount);
  } catch (error) {
    next(error);
  }
};

export const markConversationAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true });
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
