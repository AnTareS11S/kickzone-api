import Sponsor from '../models/sponsor.model.js';
import { uploadImageToS3 } from '../utils/s3Utils.js';
import sharp from 'sharp';

export const addSponsor = async (req, res, next) => {
  try {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 100, height: 100, fit: 'contain' })
      .toBuffer();

    const logoName = await uploadImageToS3(buffer, req.file.mimetype);
    const sponsor = new Sponsor({
      ...req.body,
      logo: logoName,
    });
    await sponsor.save();
    res.status(201).json(sponsor);
  } catch (error) {
    next(error);
  }
};

export const editSponsor = async (req, res, next) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);

    if (sponsor) {
      const updatedSponsor = await Sponsor.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
      );
      return res.status(200).json(updatedSponsor);
    }
  } catch (error) {
    next(error);
  }
};

export const getAllSponsors = async (req, res, next) => {
  try {
    const sponsors = await Sponsor.find();

    if (!sponsors) {
      return res
        .status(404)
        .json({ success: false, message: 'No sponsors found!' });
    }

    res.status(200).json(sponsors);
  } catch (error) {
    next(error);
  }
};

export const getSponsorById = async (req, res, next) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      return res.status(404).json({ success: false, message: 'Not found!' });
    }

    res.status(200).json(sponsor);
  } catch (error) {
    next(error);
  }
};

export const deleteSponsor = async (req, res, next) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      return res.status(404).json({ success: false, message: 'Not found!' });
    }

    await Sponsor.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Sponsor deleted' });
  } catch (error) {
    next(error);
  }
};
