const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const role = require("../middleware/roleMiddleware");

const Subject = require("../models/Subject");

const {
  getMySubjects,
} = require("../controllers/subjectController");

// ==========================================
// CREATE + ASSIGN SUBJECT
// ADMIN ONLY
// ASSIGN SUBJECT (ADMIN)
router.post("/assign", auth, role("admin"), async (req, res) => {

  try {

    const {
      name,
      code,
      teacherId,
      credits,
      description,
    } = req.body;

    // VALIDATION
    if (
      !name ||
      !code ||
      !teacherId
    ) {

      return res.status(400).json({
        message: "Name, Code and Teacher required",
      });
    }

    // CHECK DUPLICATE
    const existingSubject =
      await Subject.findOne({ code });

    if (existingSubject) {

      return res.status(400).json({
        message: "Subject code already exists",
      });
    }

    // CREATE SUBJECT
    const subject = new Subject({
      name,
      code,
      teacher: teacherId,
      credits,
      description,
    });

    await subject.save();

    res.status(201).json({
      message: "Subject assigned successfully",
      subject,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================================
// GET TEACHER SUBJECTS
// ==========================================
router.get(
  "/my",
  auth,
  role("teacher"),
  getMySubjects
);

// ==========================================
// GET ALL SUBJECTS
// ==========================================
router.get(
  "/",
  auth,
  async (req, res) => {
    try {

      const subjects =
        await Subject.find()

          .populate(
            "teacher",
            "firstName lastName email"
          )

          .populate(
            "department",
            "name"
          )

          .populate(
            "semester",
            "name semesterNumber"
          )

          .sort({
            createdAt: -1,
          });

      res.json(subjects);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message:
          "Error fetching subjects",
      });
    }
  }
);

module.exports = router;