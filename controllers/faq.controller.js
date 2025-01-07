import Faq from '../models/faq.model.js';

export const addFaq = async (req, res, next) => {
  try {
    const faq = new Faq(req.body);
    await faq.save();
    res.status(201).json(faq);
  } catch (error) {
    next(error);
  }
};

export const getFaqs = async (req, res, next) => {
  try {
    const faqs = await Faq.find();

    if (!faqs) {
      return res
        .status(404)
        .json({ success: false, message: 'No faqs found!' });
    }

    res.status(200).json(faqs);
  } catch (error) {
    next(error);
  }
};

export const editFaq = async (req, res, next) => {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(faq);
  } catch (error) {
    next(error);
  }
};

export const deleteFaq = async (req, res, next) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
