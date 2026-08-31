const express = require("express");

const router = express.Router();

const User = require("../models/User");
const Timetable = require("../models/Timetable");

const auth = require("../middleware/authMiddleware");

// ==========================================
// CREATE TIMETABLE
// ==========================================
router.post("/", auth, async (req, res) => {
  try {

    const timetable =
      await Timetable.create(req.body);

    res.status(201).json(timetable);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// GET ALL TIMETABLES
// ==========================================
router.get("/", auth, async (req, res) => {

  try {

    const timetables =
      await Timetable.find()
        .populate("division", "name")
        .populate("subject", "name")
        .populate("teacher", "firstName lastName");

    res.json(timetables);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// GET LOGGED-IN TEACHER TIMETABLE
// ==========================================
router.get("/my", auth, async (req, res) => {

  try {

    const teacherId =
      req.user.id || req.user.user?.id;

    const timetables =
      await Timetable.find({
        teacher: teacherId,
      })
        .populate("division", "name")
        .populate("subject", "name")
        .populate("teacher", "firstName lastName");

    res.json(timetables);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// GET TEACHERS
// ==========================================
router.get("/teachers", auth, async (req, res) => {

  try {

    const teachers = await User.find({
      role: "teacher",
    });

    res.json(teachers);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// UPDATE TIMETABLE
// ==========================================
router.put("/:id", auth, async (req, res) => {

  try {

    const timetable =
      await Timetable.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      )
        .populate("division", "name")
        .populate("subject", "name")
        .populate("teacher", "firstName lastName");

    res.json(timetable);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// DELETE TIMETABLE
// ==========================================
router.delete("/:id", auth, async (req, res) => {

  try {

    await Timetable.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Timetable deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;