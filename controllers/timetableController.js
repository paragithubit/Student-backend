const Timetable = require("../models/Timetable");
const User = require("../models/User");

// ==========================================
// CREATE TIMETABLE
// ==========================================
exports.createTimetable = async (req, res) => {
  try {

    const timetable = await Timetable.create(
      req.body
    );

    const populated =
      await Timetable.findById(
        timetable._id
      )
        .populate("division", "name")
        .populate("subject", "name code")
        .populate(
          "teacher",
          "firstName lastName email"
        );

    res.status(201).json(populated);

  } catch (error) {

    console.log(
      "CREATE TIMETABLE ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL TIMETABLES
// ==========================================
exports.getAllTimetables = async (
  req,
  res
) => {
  try {

    const timetables =
      await Timetable.find()

        .populate(
          "division",
          "name"
        )

        .populate(
          "subject",
          "name code"
        )

        .populate(
          "teacher",
          "firstName lastName email"
        )

        .sort({
          createdAt: -1,
        });

    res.json(timetables);

  } catch (error) {

    console.log(
      "GET TIMETABLE ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// GET TEACHER TIMETABLE
// ==========================================
exports.getTeacherTimetable =
  async (req, res) => {

    try {

      const teacherId =
        req.user.id ||
        req.user.user?.id;

      const timetables =
        await Timetable.find({
          teacher: teacherId,
        })

          .populate(
            "division",
            "name"
          )

          .populate(
            "subject",
            "name code"
          )

          .populate(
            "teacher",
            "firstName lastName"
          )

          .sort({
            day: 1,
          });

      res.json(timetables);

    } catch (error) {

      console.log(
        "TEACHER TIMETABLE ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Error fetching teacher timetable",
      });
    }
  };

// ==========================================
// GET TEACHERS
// ==========================================
exports.getTeachers = async (
  req,
  res
) => {
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
};

// ==========================================
// UPDATE TIMETABLE
// ==========================================
exports.updateTimetable =
  async (req, res) => {

    try {

      const timetable =
        await Timetable.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
          }
        )

          .populate(
            "division",
            "name"
          )

          .populate(
            "subject",
            "name code"
          )

          .populate(
            "teacher",
            "firstName lastName"
          );

      res.json(timetable);

    } catch (error) {

      console.log(
        "UPDATE TIMETABLE ERROR:",
        error
      );

      res.status(500).json({
        message: error.message,
      });
    }
  };

// ==========================================
// DELETE TIMETABLE
// ==========================================
exports.deleteTimetable =
  async (req, res) => {

    try {

      await Timetable.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Timetable deleted successfully",
      });

    } catch (error) {

      console.log(
        "DELETE TIMETABLE ERROR:",
        error
      );

      res.status(500).json({
        message: error.message,
      });
    }
  };