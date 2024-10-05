import Faq from '../models/faq.model.js';

export const createFaq = async (req, res, next) => {
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
    const faq = await Faq.findById(req.params.id);

    if (!faq) {
      return res
        .status(404)
        .json({ success: false, message: 'Faq not found!' });
    }

    const updatedFaq = await Faq.findByIdAndUpdate(
      { _id: req.params.id },
      { question: req.body.question, answer: req.body.answer },
      { new: true }
    );

    res.status(200).json(updatedFaq);
  } catch (error) {
    next(error);
  }
};

export const deleteFaq = async (req, res, next) => {
  try {
    const faq = await Faq.findById(req.params.id);

    if (!faq) {
      return res
        .status(404)
        .json({ success: false, message: 'Faq not found!' });
    }

    await faq.remove();

    res.status(200).json({ success: true, message: 'Faq deleted!' });
  } catch (error) {
    next(error);
  }
};
