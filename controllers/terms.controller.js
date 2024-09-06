import Term from '../models/terms.model.js';

export const createTerm = async (req, res, next) => {
  try {
    const term = await Term.create(req.body);

    res.status(200).json(term);
  } catch (error) {
    next(error);
  }
};

export const getTerms = async (req, res, next) => {
  try {
    const terms = await Term.find();
    res.status(200).json(terms);
  } catch (error) {
    next(error);
  }
};

export const editTerm = async (req, res, next) => {
  try {
    const term = await Term.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(term);
  } catch (error) {
    next(error);
  }
};

export const deleteTerm = async (req, res, next) => {
  try {
    await Term.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Term deleted successfully' });
  } catch (error) {
    next(error);
  }
};
