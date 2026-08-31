const express = require("express");

const router = express.Router();

const Semester = require("../models/Semester");

// CREATE SEMESTER
router.post("/", async (req, res) => {
  try {
    const semester = await Semester.create(req.body);

    res.status(201).json(semester);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET ALL SEMESTERS
router.get("/", async (req, res) => {
  try {
    const semesters = await Semester.find()
      .populate("department");

    res.json(semesters);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// UPDATE ALL SEMESTERS
router.put("/:id", async (req, res) => {
  try {
    const semester = await Semester.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(semester);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//DELETE ALL SEMSETER 
router.delete("/:id", async (req, res) => {
  try {
    await Semester.findByIdAndDelete(req.params.id);

    res.json({ message: "Semester deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;