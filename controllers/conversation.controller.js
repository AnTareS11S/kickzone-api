import Referee from '../models/referee.model.js';
import Coach from '../models/coach.model.js';
import Player from '../models/player.model.js';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

export const getAllPeople = async (req, res, next) => {
  try {
    const search = req.query.term || '';
    const searchTerms = search.split(' ').filter((term) => term.length > 0);

    let searchQuery;
    if (searchTerms.length > 1) {
      searchQuery = {
        $and: [
          { name: { $regex: searchTerms[0], $options: 'i' } },
          {
            surname: { $regex: searchTerms.slice(1).join(' '), $options: 'i' },
          },
        ],
      };
    } else {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { surname: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const [players, coaches, referees] = await Promise.all([
      Player.find(searchQuery),
      Coach.find(searchQuery),
      Referee.find(searchQuery),
    ]);

    const setImageUrl = (item) => {
      if (item.photo) {
        item.imageUrl = 'https://d3awt09vrts30h.cloudfront.net/' + item.photo;
      } else {
        item.imageUrl = null;
      }
      return item;
    };

    const modifyPlayers = players?.map((player) => setImageUrl(player));
    const modifyCoaches = coaches?.map((coach) => setImageUrl(coach));
    const modifyReferees = referees?.map((referee) => setImageUrl(referee));

    const people = [...modifyPlayers, ...modifyCoaches, ...modifyReferees];

    res.status(200).json(people);
  } catch (error) {
    next(error);
  }
};

const findUserAndRole = async (userId) => {
  const player = await Player.findOne({ user: userId });
  if (player)
    return {
      user: {
        _id: player._id,
        name: player.name,
        surname: player.surname,
        imageUrl: player.imageUrl,
      },
      role: 'player',
    };

  const coach = await Coach.findOne({ user: userId });
  if (coach)
    return {
      user: {
        _id: coach._id,
        name: coach.name,
        surname: coach.surname,
        imageUrl: coach.imageUrl,
      },
      role: 'coach',
    };

  const referee = await Referee.findOne({ user: userId });
  if (referee)
    return {
      user: {
        _id: referee._id,
        name: referee.name,
        surname: referee.surname,
        imageUrl: referee.imageUrl,
      },
      role: 'referee',
    };

  return null;
};

export const sendMessage = async (req, res, next) => {
  try {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text) {
      const error = new Error('Missing required fields');
      error.statusCode = 400;
      throw error;
    }

    // Convert string IDs to ObjectIds
    const senderObjectId = new ObjectId(senderId);
    const receiverObjectId = new ObjectId(receiverId);

    // Find sender and receiver info
    const sender = await findUserAndRole(senderObjectId);
    const receiver = await findUserAndRole(receiverObjectId);

    if (!sender || !receiver) {
      const error = new Error('Invalid sender or receiver');
      error.statusCode = 400;
      throw error;
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [sender.user._id, receiver.user._id] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [
          {
            user: sender.user._id,
            role: sender.role,
            name: `${sender.user.name} ${sender.user.surname}`,
            photo: sender.user.imageUrl,
          },
          {
            user: receiver.user._id,
            role: receiver.role,
            name: `${receiver.user.name} ${receiver.user.surname}`,
            photo: receiver.user.imageUrl,
          },
        ],
        messages: [],
      });

      await conversation.save();
    }

    const newMessage = new Message({
      sender: sender.user._id,
      conversation: conversation._id,
      text,
    });

    await newMessage.save();

    conversation.messages.push(newMessage._id);
    conversation.lastMessage = text;
    conversation.lastMessageTime = newMessage.createdAt;
    await conversation.save();

    const populatedMessage = await Message.findById(newMessage._id).populate({
      path: 'sender',
      select: 'name surname photo',
      model:
        sender.role === 'player'
          ? Player
          : sender.role === 'coach'
          ? Coach
          : Referee,
    });

    res.status(200).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { userId, currentUserId } = req.query;

    const receiverObjectId = new ObjectId(currentUserId);
    const userIdObjectId = new ObjectId(userId);

    const receiver = await findUserAndRole(receiverObjectId);

    if (!userId) {
      const error = new Error('Missing required fields');
      error.statusCode = 400;
      throw error;
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [userIdObjectId, receiver.user._id] },
    });

    if (!conversation) {
      res.status(200).json({ messages: [] });
      return;
    }

    const messages = await Message.find({
      conversation: conversation._id,
    }).populate('sender', 'name surname photo');

    res.status(200).json({ messages });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const { currentUserId } = req.query;

    if (!currentUserId) {
      const error = new Error('Missing required fields');
      error.statusCode = 400;
      throw error;
    }

    const userObjectId = new ObjectId(currentUserId);

    const user = await findUserAndRole(userObjectId);

    const conversations = await Conversation.find({
      participants: {
        $elemMatch: {
          user: user.user._id,
        },
      },
    }).populate('participants', 'name surname imageUrl _id');

    console.log(conversations);

    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};
