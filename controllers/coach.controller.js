import Coach from '../models/coach.model.js';
import Country from '../models/country.model.js';
import Team from '../models/team.model.js';
import sharp from 'sharp';
import { deleteImageFromS3, uploadImageToS3 } from '../utils/s3Utils.js';

export const createCoach = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      const existedCoach = await Coach.findOne({ user: req.body.user });
      if (existedCoach) {
        const updatedCoach = await Coach.findOneAndUpdate(
          { user: req.body.user },
          { ...req.body },
          { new: true }
        );
        return res.status(200).json(updatedCoach);
      }
      const newCoach = new Coach(req.body);
      await newCoach.save();
      res.status(201).json(newCoach);
    }

    const buffer = await sharp(req.file.buffer)
      .resize({ width: 200, height: 200, fit: 'cover' })
      .toBuffer();

    const photoName = await uploadImageToS3(buffer, req.file.mimetype);
    const existedCoach = await Coach.findOne({ user: req.body.user });
    if (existedCoach) {
      existedCoach.photo ? await deleteImageFromS3(existedCoach.photo) : null;

      const updatedCoach = await Coach.findOneAndUpdate(
        { user: req.body.user },
        { ...req.body, photo: photoName },
        { new: true }
      );
      return res.status(200).json(updatedCoach);
    }
    const newCoach = new Coach({
      ...req.body,
      photo: photoName,
      currentTeam: null,
    });
    await newCoach.save();
    res.status(201).json(newCoach);
  } catch (error) {
    next(error);
  }
};

export const getCoachByUserId = async (req, res, next) => {
  try {
    const coach = await Coach.findOne({ user: req?.params?.id });
    if (coach) {
      coach.imageUrl = `https://d3awt09vrts30h.cloudfront.net/${coach?.photo}`;
    }
    res.status(200).json(coach);
  } catch (error) {
    next(error);
  }
};

export const getAllCoaches = async (req, res, next) => {
  try {
    const coaches = await Coach.find().populate('nationality');

    if (!coaches) {
      return res
        .status(404)
        .json({ success: false, message: 'No coaches found!' });
    }

    res.status(200).json(coaches);
  } catch (error) {
    next(error);
  }
};

export const deleteCoach = async (req, res, next) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    const teamId = coach.teams;
    if (teamId) {
      const team = await Team.findById(teamId);
      if (team) {
        team.coach = null;
        await team.save();
      }
    }

    await Coach.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Coach deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCoachById = async (req, res, next) => {
  try {
    const coach = await Coach.findById(req.params.id);
    const teams = await Team.find({ coach: req.params.id });
    const currentTeam = await Team.findById(coach?.currentTeam);

    const nationalityName = await Country.find({
      _id: { $in: coach.nationality },
    });

    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    if (coach.photo) {
      coach.imageUrl = 'https://d3awt09vrts30h.cloudfront.net/' + coach.photo;
    } else {
      coach.imageUrl = null;
    }

    res.status(200).json({
      ...coach._doc,
      nationality: nationalityName[0].name,
      teams: teams.map((team) => team.name + ':' + team._id),
      currentTeam: currentTeam?.name,
    });
  } catch (error) {
    next(error);
  }
};

export const getCoachesWithoutCurrentTeam = async (req, res, next) => {
  try {
    const coachesWithoutTeam = await Coach.find({ currentTeam: null });

    if (!coachesWithoutTeam) {
      return res
        .status(404)
        .json({ message: 'Coaches without team not found' });
    }

    res.status(200).json(coachesWithoutTeam);
  } catch (error) {
    next(error);
  }
};
