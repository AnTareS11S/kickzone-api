import Referee from '../models/referee.model.js';
import Coach from '../models/coach.model.js';
import Player from '../models/player.model.js';
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
