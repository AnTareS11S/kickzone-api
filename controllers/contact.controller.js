import Contact from '../models/contact.model.js';

export const createContact = async (req, res, next) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
};

export const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.find();
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOne();
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

export const editContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
