import Coach from '../models/coach.model.js';
import Player from '../models/player.model.js';
import Training from '../models/training.model.js';
import TrainingType from '../models/trainingType.model.js';
import cron from 'node-cron';

cron.schedule('0 0 * * *', async () => {
  try {
    const currentDate = new Date();

    const activeTrainingsToUpdate = await Training.find({
      isActive: true,
      trainingDate: { $lt: currentDate },
    });

    for (const trainingToUpdate of activeTrainingsToUpdate) {
      trainingToUpdate.isActive = false;
      trainingToUpdate.isCompleted = true;
      await trainingToUpdate.save();
    }

    console.log('Updated trainings: ', activeTrainingsToUpdate.length);
  } catch (error) {
    console.log(error);
  }
});

export const addTraining = async (req, res, next) => {
  try {
    const coach = await Coach.findById(req.params.id);
    const training = new Training(req.body);

    coach?.trainings.push(training._id);
    await coach?.save();

    training.coachId = coach?._id;
    await training.save();
    res.status(201).json(training);
  } catch (error) {
    next(error);
  }
};

export const editTraining = async (req, res, next) => {
  try {
    const training = await Training.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(training);
  } catch (error) {
    next(error);
  }
};

export const getAllCoachTrainings = async (req, res, next) => {
  try {
    const coachId = req.params.id;

    const trainings = await Training.find({ coachId });

    res.status(200).json(trainings);
  } catch (error) {
    next(error);
  }
};
export const deleteTraining = async (req, res, next) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);

    const coach = await Coach.findById(training.coachId);
    coach?.trainings.pull(training._id);
    await coach?.save();

    res.status(200).json(training);
  } catch (error) {
    next(error);
  }
};

export const getTrainingById = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);

    const trainingType = await TrainingType.findById(training.trainingType);

    training.trainingType = trainingType;

    res.status(200).json(training);
  } catch (error) {
    next(error);
  }
};

export const addOrRemoveAttendace = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res
        .status(404)
        .json({ success: false, message: 'Training not found' });
    }

    const playerId = req.body.playerId;
    const attendance = req.body.attendance;

    const isPlayerAlreadyRegistered = training.participants?.includes(playerId);

    if (attendance === true) {
      if (!isPlayerAlreadyRegistered) {
        training?.participants.push(playerId);
      }
    } else if (attendance === false) {
      if (isPlayerAlreadyRegistered) {
        training.participants = training.participants.pull(playerId);
      }
    }

    await training.save();

    res.status(200).json(training);
  } catch (error) {
    next(error);
  }
};

export const removePlayerFromTraining = async (req, res, next) => {
  try {
    const trainingId = await Training.find({
      participants: req.params.id,
    }).select('_id');

    const training = await Training.findById(trainingId);

    training.participants = training.participants.pull(req.params.id);
    await training?.save();

    res.status(200).json(training);
  } catch (error) {
    next(error);
  }
};

export const getParticipants = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);

    const participants = await Player.find({ _id: training.participants });

    res.status(200).json(participants);
  } catch (error) {
    next(error);
  }
};

export const addPlayerToTraining = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);

    if (training?.participants?.includes(req.body.player)) {
      return res.status(200).json(training);
    }

    training?.participants.push(req.body.player);
    await training?.save();

    res.status(200).json(training);
  } catch (error) {
    next(error);
  }
};
