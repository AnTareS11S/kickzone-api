import mongoose from 'mongoose';
import Thread from '../models/thread.model.js';
import ThreadCategory from '../models/threadCategory.model.js';

export const addTeamForumCategory = async (req, res, next) => {
  try {
    const teamForumCategory = new ThreadCategory(req.body);
    await teamForumCategory.save();
    res.status(201).json(teamForumCategory);
  } catch (error) {
    next(error);
  }
};

export const getTeamForumCategories = async (req, res, next) => {
  try {
    const AuthorModel = mongoose.model(req.params.model);
    const author = await AuthorModel.findOne({ user: req.params.userId });
    const teamId = author?.currentTeam;

    const categories = await ThreadCategory.find().sort({ order: 1 });

    const categoriesWithTeamCounts = categories.map((category) => {
      const teamCount = category.teamCounts.find(
        (tc) => tc.teamId.toString() === teamId.toString()
      );

      return {
        ...category.toObject(),
        count: teamCount?.count || 0,
        teamCounts: undefined,
      };
    });

    res.status(200).json(categoriesWithTeamCounts);
  } catch (error) {
    next(error);
  }
};

export const getTeamForumCategoriesToSelect = async (req, res, next) => {
  try {
    const teamForumCategories = await ThreadCategory.find({}).sort({
      order: 1,
    });

    if (!teamForumCategories) {
      return res
        .status(404)
        .json({ success: false, message: 'No team forum categories found!' });
    }

    res.status(200).json(teamForumCategories);
  } catch (error) {
    next(error);
  }
};

export const editTeamForumCategory = async (req, res, next) => {
  try {
    const teamForumCategory = await ThreadCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.status(200).json(teamForumCategory);
  } catch (error) {
    next(error);
  }
};

export const deleteTeamForumCategory = async (req, res, next) => {
  try {
    await ThreadCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
