const Subject = require("../models/Subject");

// ==========================================
// 🔹 ASSIGN SUBJECT TO TEACHER (ADMIN)
// ==========================================
exports.assignSubject = async (req, res) => {
  try {
    const { subjectId, teacherId } = req.body;

    // Validate request data
    if (!subjectId || !teacherId) {
      return res.status(400).json({
        message: "SubjectId and TeacherId required ",
      });
    }

    // Assign teacher to subject
    const subject = await Subject.findByIdAndUpdate(
      subjectId,
      {
        teacher: teacherId,
      },
      {
        new: true,
      }
    ).populate(
      "teacher",
      "firstName lastName email"
    );

    // Check subject existence
    if (!subject) {
      return res.status(404).json({
        message: "Subject not found ",
      });
    }

    res.json({
      message: "Subject assigned successfully ",
      subject,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Assign failed ",
    });
  }
};

// ==========================================
// 🔹 GET LOGGED-IN TEACHER SUBJECTS
// ==========================================
// ==========================================
// 🔹 GET LOGGED-IN TEACHER SUBJECTS
// ==========================================
exports.getMySubjects = async (req, res) => {
  try {

    //  FIXED USER ID
    const teacherId =
      req.user.id ||
      req.user.user?.id;

    console.log("TEACHER ID:", teacherId);

    //  GET SUBJECTS
    const subjects = await Subject.find({
      teacher: teacherId,
    })

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
      );

    console.log("SUBJECTS:", subjects);

    res.json(subjects);

  } catch (err) {

    console.log("GET MY SUBJECTS ERROR:", err);

    res.status(500).json({
      message: "Error fetching subjects",
    });
  }
};

// ==========================================
// 🔹 GET TEACHER SUBJECTS WITH POPULATE
// ==========================================
exports.getTeacherSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({
      teacher: req.user.id,
    }).populate(
      "teacher",
      "firstName lastName"
    );

    res.json(subjects);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error fetching subjects ",
    });
  }
};

// ==========================================
// 🔹 GET ALL SUBJECTS (ADMIN)
// ==========================================
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate(
      "teacher",
      "firstName lastName email"
    );

    res.json(subjects);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error fetching all subjects ",
    });
  }
};