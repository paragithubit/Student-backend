const Notice = require("../models/Notice");



// ==========================================
// CREATE NOTICE
// ==========================================
exports.createNotice = async (req, res) => {
  try {
    const notice = await Notice.create(req.body);

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



// ==========================================
// GET ALL NOTICES
// ==========================================
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate("createdBy", "firstName lastName role")
      .sort({ createdAt: -1 });

    res.json(notices);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};