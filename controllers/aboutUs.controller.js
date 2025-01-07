import sharp from 'sharp';
import AboutUs from '../models/aboutUs.model.js';
import { deleteImageFromS3, uploadImageToS3 } from '../utils/s3Utils.js';

export const addAboutUs = async (req, res, next) => {
  try {
    const buffer = await sharp(req.file.buffer)
      .resize({ fit: 'cover' })
      .toBuffer();

    const logoName = await uploadImageToS3(buffer, req.file.mimetype);

    const aboutUs = new AboutUs({
      ...req.body,
      logo: logoName,
    });

    await aboutUs.save();
    res.status(201).json(aboutUs);
  } catch (error) {
    next(error);
  }
};

export const getAboutUs = async (req, res, next) => {
  try {
    const aboutUs = await AboutUs.find();

    res.status(200).json(aboutUs);
  } catch (error) {
    next(error);
  }
};

export const getOneAboutUs = async (req, res, next) => {
  try {
    const aboutUs = await AboutUs.findOne();

    if (aboutUs) {
      aboutUs.imageUrl = `https://d3awt09vrts30h.cloudfront.net/${aboutUs?.logo}`;
    }

    res.status(200).json(aboutUs);
  } catch (error) {
    next(error);
  }
};

export const editAboutUs = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      const existedAboutUs = await AboutUs.findOne({ _id: req.params.id });
      if (existedAboutUs) {
        const updatedAboutUs = await AboutUs.findOneAndUpdate(
          { _id: req.params.id },
          { ...req.body },
          { new: true }
        );
        return res.status(200).json(updatedAboutUs);
      }
    }

    const buffer = await sharp(req.file.buffer)
      .resize({ fit: 'cover' })
      .toBuffer();

    const logoName = await uploadImageToS3(buffer, req.file.mimetype);
    const existedAboutUs = await AboutUs.findOne({ _id: req.params.id });
    if (existedAboutUs) {
      existedAboutUs.logo ? await deleteImageFromS3(existedAboutUs.logo) : null;

      const updatedAboutUs = await AboutUs.findOneAndUpdate(
        { _id: req.params.id },
        { ...req.body, logo: logoName },
        { new: true }
      );

      return res.status(200).json(updatedAboutUs);
    }
  } catch (error) {
    next(error);
  }
};

export const deleteAboutUs = async (req, res, next) => {
  try {
    await AboutUs.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'About Us deleted successfully' });
  } catch (error) {
    next(error);
  }
};
