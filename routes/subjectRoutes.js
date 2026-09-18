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
// ==========================================
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

// ==========================================
// UPDATE SUBJECT (ADMIN ONLY)
// ==========================================
router.put("/:id", auth, role("admin"), async (req, res) => {
  try {
    const {
      name,
      code,
      teacherId,
      credits,
      description,
    } = req.body;

    // Build update payload
    const updateData = {};
    if (name) updateData.name = name;
    if (code) updateData.code = code;
    if (teacherId) updateData.teacher = teacherId;
    if (credits !== undefined) updateData.credits = credits;
    if (description !== undefined) updateData.description = description;

    // Check if code is being changed and already exists on another record
    if (code) {
      const existingSubject = await Subject.findOne({ 
        code, 
        _id: { $ne: req.params.id } 
      });

      if (existingSubject) {
        return res.status(400).json({
          message: "Subject code already exists",
        });
      }
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("teacher", "firstName lastName email");

    if (!updatedSubject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject updated successfully",
      subject: updatedSubject,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================================
// DELETE SUBJECT (ADMIN ONLY)
// ==========================================
router.delete("/:id", auth, role("admin"), async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

    if (!deletedSubject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject deleted successfully",
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;