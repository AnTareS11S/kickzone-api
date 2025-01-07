import Privacy from '../models/privacy.model.js';

export const addPrivacy = async (req, res, next) => {
  try {
    const privacy = await Privacy.create(req.body);

    res.status(200).json(privacy);
  } catch (error) {
    next(error);
  }
};

export const getPrivacies = async (req, res, next) => {
  try {
    const privacies = await Privacy.find();
    res.status(200).json(privacies);
  } catch (error) {
    next(error);
  }
};

export const editPrivacy = async (req, res, next) => {
  try {
    const privacy = await Privacy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(privacy);
  } catch (error) {
    next(error);
  }
};

export const deletePrivacy = async (req, res, next) => {
  try {
    await Privacy.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Privacy deleted successfully' });
  } catch (error) {
    next(error);
  }
};
