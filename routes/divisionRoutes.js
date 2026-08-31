const express = require("express");

const router = express.Router();

const Division = require("../models/Division");

const User = require("../models/User");

// ==========================================
// CREATE DIVISION
// ==========================================
router.post("/", async (req, res) => {
  try {
    const division = await Division.create(
      req.body
    );

    // UPDATE STUDENTS
    if (req.body.students?.length) {
      await User.updateMany(
        {
          _id: {
            $in: req.body.students,
          },
        },
        {
          division: division._id,
        }
      );
    }

    res.status(201).json(division);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// GET ALL DIVISIONS
// ==========================================
router.get("/", async (req, res) => {

  try {

    const divisions = await Division.find()

      .populate("department")

      .populate("semester")

      .populate(
        "students",
        "firstName lastName email"
      )

      .populate(
        "teachers",
        "firstName lastName email"
      );

    res.json(divisions);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// UPDATE DIVISION
// ==========================================
router.put("/:id", async (req, res) => {

  try {

    const division =
      await Division.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      )

        .populate("department")

        .populate("semester")

        .populate(
          "students",
          "firstName lastName email"
        )

        .populate(
          "teachers",
          "firstName lastName email"
        );

    // UPDATE STUDENTS DIVISION
    if (req.body.students?.length) {

      await User.updateMany(
        {
          _id: {
            $in: req.body.students,
          },
        },
        {
          division: division._id,
        }
      );
    }

    res.json(division);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

// ==========================================
// DELETE DIVISION
// ==========================================
router.delete("/:id", async (req, res) => {

  try {

    await Division.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Division deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;