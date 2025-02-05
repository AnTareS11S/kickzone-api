import User from '../models/user.model.js';
import Team from '../models/team.model.js';
import League from '../models/league.model.js';
import Season from '../models/season.model.js';
import Admin from '../models/admin.model.js';
import sharp from 'sharp';
import { deleteImageFromS3, uploadImageToS3 } from '../utils/s3Utils.js';
import RoleChangeNotification from '../models/roleChangeNotification.model.js';
import AdminNotification from '../models/adminNotifications.model.js';
import Report from '../models/report.model.js';
import mongoose from 'mongoose';
import Notification from '../models/notifications.model.js';
import Ban from '../models/ban.model.js';
import ContentDeleted from '../models/contentDeleted.model.js';

export const addAdmin = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      const existedAdmin = await Admin.findOne({ user: req.body.user });
      if (existedAdmin) {
        const updatedAdmin = await Admin.findOneAndUpdate(
          { user: req.body.user },
          { ...req.body },
          { new: true }
        );
        await User.findOneAndUpdate(
          { _id: req.body.user },
          { isProfileFilled: true },
          { new: true }
        );
        return res.status(200).json(updatedAdmin);
      }
      const newAdmin = new Admin(req.body);
      await newAdmin.save();
      res.status(201).json(newAdmin);
    }

    const buffer = await sharp(req.file.buffer)
      .resize({ width: 200, height: 200, fit: 'cover' })
      .toBuffer();

    const photoName = await uploadImageToS3(buffer, req.file.mimetype);
    const existedAdmin = await Admin.findOne({ user: req.body.user });
    if (existedAdmin) {
      existedAdmin.photo ? await deleteImageFromS3(existedAdmin.photo) : null;

      const updatedAdmin = await Admin.findOneAndUpdate(
        { user: req.body.user },
        { ...req.body, photo: photoName },
        { new: true }
      );
      await User.findOneAndUpdate(
        { _id: req.body.user },
        { isProfileFilled: true },
        { new: true }
      );
      return res.status(200).json(updatedAdmin);
    }
    const newAdmin = new Admin({
      ...req.body,
      photo: photoName,
      currentTeam: null,
    });

    await User.findOneAndUpdate(
      { _id: req.body.user },
      { isProfileFilled: true },
      { new: true }
    );

    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (error) {
    next(error);
  }
};

export const getAdminByUserId = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ user: req.params.adminId });
    if (admin) {
      admin.imageUrl = `https://d3awt09vrts30h.cloudfront.net/${admin?.photo}`;
    }
    res.status(200).json(admin);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const setRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = req.body.newRole;
    user.isRoleChangeNotificationRead = false;
    user.isRoleSet = true;

    const notificationMessage = `Your role has been changed to "${req.body.newRole}". Please log in again for the changes to take effect.`;

    const roleChangeNotification = new RoleChangeNotification({
      userId: user._id,
      role: req.body.newRole,
      message: notificationMessage,
    });

    const adminNotification = await AdminNotification.findOne({
      userId: user._id,
    });

    if (adminNotification) {
      adminNotification.isRead = true;
      await adminNotification.save();
    }

    await user.save();
    await roleChangeNotification.save();
    res.status(200).json({ message: 'Role updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({}).populate('coach').sort({ createdAt: -1 });

    // Get coach name and surname
    const teamsWithCoaches = teams.map((team) => {
      const { name, surname } = team.coach;
      return {
        ...team._doc,
        coach: `${name} ${surname}`,
      };
    });

    res.status(200).json(teamsWithCoaches);
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    await Team.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllLeagues = async (req, res, next) => {
  try {
    const leagues = await League.find({}).populate('teams').sort({ name: 1 });

    if (req.query.season) {
      const leagues = await League.find({ season: req.query.season })
        .populate('teams')
        .sort({ name: 1 });

      return res.status(200).json(leagues);
    }

    const seasons = await Season.find({});

    const seasonMap = seasons.reduce((map, season) => {
      map[season._id.toString()] = season.name;

      return map;
    }, {});

    const leaguesWithSeasonNames = leagues.map((league) => {
      return {
        ...league.toObject(),
        seasonName: seasonMap[league.season.toString()] || 'Unknown Season',
      };
    });

    res.status(200).json(leaguesWithSeasonNames);
  } catch (error) {
    next(error);
  }
};

export const deleteLeague = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    await League.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'League deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getTeamsWithoutLeague = async (req, res, next) => {
  try {
    const teams = await Team.find({});

    if (!teams) {
      return res.status(404).json({ message: 'Teams not found' });
    }

    const filteredTeams = teams.filter((team) => {
      return team.league === null;
    });

    res.status(200).json(filteredTeams);
  } catch (error) {
    next(error);
  }
};

export const getTeamsByIds = async (req, res, next) => {
  try {
    const teamsIds = req.body.teams;

    const teams = await Team.find({ _id: { $in: teamsIds } });

    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
};

export const getAdminNotifications = async (req, res, next) => {
  try {
    const notificationsCount = await AdminNotification.countDocuments({
      isRead: false,
    });

    const reportsCount = await Report.countDocuments({ status: 'Pending' });

    res.status(200).json({ notificationsCount, reportsCount });
  } catch (error) {
    next(error);
  }
};

export const getUsersRoleChanges = async (req, res, next) => {
  try {
    const users = await User.find({
      isRoleSet: false,
      wantedRole: { $ne: '' },
    })
      .select('username email createdAt role wantedRole')
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const deleteContent = async (req, res, next) => {
  try {
    const contentType =
      req.body.contentModel === 'Comment' ? 'Post' : req.body.contentModel;

    const ContentModel = mongoose.model(contentType);
    const contentToDelete = await ContentModel.findById(
      req.params.contentId
    ).populate('author');

    if (!contentToDelete) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Handle parent-child relationships
    if (contentToDelete.parentId) {
      await ContentModel.findByIdAndUpdate(contentToDelete.parentId, {
        $pull: { children: contentToDelete._id },
      });
    }

    // Get all descendant content (comments/replies)
    const getAllDescendants = async (contentId) => {
      const descendants = [];
      const queue = [contentId];

      while (queue.length > 0) {
        const currentId = queue.shift();
        const children = await ContentModel.find({ parentId: currentId });

        for (const child of children) {
          descendants.push(child);
          queue.push(child._id);
        }
      }

      return descendants;
    };

    const descendantContent = await getAllDescendants(req.params.contentId);

    // Collect all content IDs to be deleted
    const contentIdsToDelete = [
      req.params.contentId,
      ...descendantContent.map((content) => content._id),
    ];

    // Collect unique author IDs
    const uniqueAuthorIds = new Set(
      [
        ...descendantContent.map((content) => content.author?._id?.toString()),
        contentToDelete.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Delete associated files if they exist
    if (contentToDelete.postPhoto) {
      await deleteImageFromS3(contentToDelete.postPhoto);
    }

    // Delete all descendant content and the main content
    await ContentModel.deleteMany({ _id: { $in: contentIdsToDelete } });

    // Update user relationships
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { posts: { $in: contentIdsToDelete } } }
    );

    // Handle specific content type cleanup
    if (req.body.contentModel.toLowerCase() === 'post') {
      // Additional cleanup specific to posts if needed
      // For example: delete associated likes, notifications, etc.
      await Promise.all([
        Notification.deleteMany({
          notifications: {
            $elemMatch: { postId: { $in: contentIdsToDelete } },
          },
        }),
      ]);
    }

    const report = await Report.findOne({
      _id: req.body.reportId,
    });

    if (report) {
      report.actionTaken = 'Content_removed';
      report.status = 'Resolved';
      report.reasonInfo = req.body.reasonInfo;
      await report.save();

      if (report.numberOfReports > 1) {
        await ContentModel.findByIdAndUpdate(req.params.contentId, {
          isDeleted: true,
        });
      }
    }

    const notification = new ContentDeleted({
      deletedBy: req.body.deletedBy,
      contentId: req.params.contentId,
      contentType: req.body.contentModel,
      deletedUser: contentToDelete.author?._id,
      reason: req.body.reason,
      description: req.body.description,
    });

    await notification.save();

    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req, res, next) => {
  try {
    const { duration, reason, reportId } = req.body;

    const endDate = new Date();
    if (duration === 'permanent') {
      endDate.setFullYear(endDate.getFullYear() + 100);
    } else {
      endDate.setDate(endDate.getDate() + parseInt(duration));
    }

    await Ban.updateMany(
      { user: req.params.userId, status: 'Active' },
      { status: 'Cancelled' }
    );

    const ban = new Ban({
      bannedBy: req.body.bannedBy,
      user: req.params.userId,
      reason,
      description: req.body.description,
      startDate: new Date(),
      endDate,
      reportId,
    });

    await ban.save();

    await User.findByIdAndUpdate(req.params.userId, {
      isBanned: true,
      banExpiresAt: endDate,
    });

    await Report.findByIdAndUpdate(reportId, {
      actionTaken: 'User_banned',
      status: 'resolved',
    });

    res.status(200).json({ message: 'User banned successfully', ban });
  } catch (error) {
    next(error);
  }
};
