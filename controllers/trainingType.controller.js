import Coach from '../models/coach.model.js';
import TrainingType from '../models/trainingType.model.js';

export const addTrainingType = async (req, res, next) => {
  try {
    const coach = await Coach.findById(req.params.id);
    const trainingType = new TrainingType(req.body);

    coach?.trainingsTypes.push(trainingType._id);
    await coach?.save();

    trainingType.coachId = coach?._id;

    await trainingType.save();
    res.status(201).json(trainingType);
  } catch (error) {
    next(error);
  }
};

export const editTrainingType = async (req, res, next) => {
  try {
    const trainingType = await TrainingType.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json(trainingType);
  } catch (error) {
    next(error);
  }
};
export const getAllCoachTrainingTypes = async (req, res, next) => {
  try {
    const coachId = req.params.id;

    const trainingTypes = await TrainingType.find({ coachId });

    res.status(200).json(trainingTypes);
  } catch (error) {
    next(error);
  }
};

export const deleteTrainingType = async (req, res, next) => {
  try {
    const trainingType = await TrainingType.findByIdAndDelete(req.params.id);

    const coach = await Coach.findById(trainingType.coachId);
    coach?.trainingsTypes.pull(trainingType._id);
    await coach?.save();

    res.status(200).json(trainingType);
  } catch (error) {
    next(error);
  }
};
