import Message from '../models/message.model.js';

export const sendMessage = async (req, res, next) => {
  try {
    const newMessage = new Message(req.body);

    const savedMessage = await newMessage.save();

    res.status(201).json(savedMessage);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};
