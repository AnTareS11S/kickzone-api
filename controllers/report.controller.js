import Report from '../models/report.model.js';

export const addReport = async (req, res, next) => {
  try {
    const existingReport = await Report.findOne({
      reportedBy: req.body.reportedBy,
      reportedUser: req.body.reportedUser,
      contentType: req.body.contentType,
      contentId: req.body.contentId,
    });

    if (existingReport) {
      // Jeśli raport istnieje, zwiększamy licznik
      const updatedReport = await Report.findByIdAndUpdate(
        existingReport._id,
        { $inc: { numberOfReports: 1 } },
        { new: true }
      );
      res.status(200).json(updatedReport);
    } else {
      // Jeśli nie istnieje, tworzymy nowy z numberOfReports = 1
      const newReport = new Report({
        ...req.body,
        numberOfReports: 1,
      });
      await newReport.save();
      res.status(201).json(newReport);
    }
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
