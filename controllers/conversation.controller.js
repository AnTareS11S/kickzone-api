import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

export const createConversation = async (req, res, next) => {
  try {
    const { senderId, receiverId } = req.body;

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (conversation) {
      const bothUsersDeleted =
        conversation.deletedBy.includes(senderId) &&
        conversation.deletedBy.includes(receiverId);

      if (bothUsersDeleted) {
        await Conversation.findByIdAndDelete(conversation._id);
        await Message.deleteMany({ conversation: conversation._id });

        conversation = new Conversation({ members: [senderId, receiverId] });
        await conversation.save();
      } else {
        if (conversation.deletedBy.includes(senderId)) {
          await Conversation.findByIdAndUpdate(conversation._id, {
            $pull: { deletedBy: senderId },
          });
        }
      }
    } else {
      conversation = new Conversation({ members: [senderId, receiverId] });
      await conversation.save();
    }

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
      deletedBy: {
        $ne: userId,
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
      deletedBy: {
        $ne: firstUserId,
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
    const { conversationId } = req.params;
    const userId = req.body.userId;

    await Conversation.findByIdAndUpdate(conversationId, {
      $addToSet: { deletedBy: userId },
    });

    res
      .status(204)
      .json('Conversation has been marked as deleted for the user');
  } catch (error) {
    next(error);
  }
};
