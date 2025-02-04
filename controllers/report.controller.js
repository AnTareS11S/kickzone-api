import Report from '../models/report.model.js';

export const addReport = async (req, res, next) => {
  try {
    const newReport = new Report(req.body);

    await newReport.save();

    res.status(201).json(newReport);
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'username')
      .populate('reportedUser', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const { status, adminNotes, actionTaken } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      { status, adminNotes, actionTaken },
      { new: true }
    );
    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};
