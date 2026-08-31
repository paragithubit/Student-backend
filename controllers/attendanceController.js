const Attendance = require("../models/Attendance");
const Subject = require("../models/Subject");

// ==========================================
// 🔹 HELPER: VERIFY SUBJECT OWNER
// ==========================================
const verifySubject = async (subjectId, teacherId) =>
  await Subject.findOne({
    _id: subjectId,
    teacher: teacherId,
  });

// ==========================================
// 🔹 MARK ATTENDANCE
// (BULK + SINGLE ATTENDANCE)
// ==========================================
exports.markAttendance = async (req, res) => {
  try {
    const { students, date, subject, studentId, status } = req.body;

    // Check if single attendance update
    const isSingle = !!studentId;

    // Verify teacher owns the subject
    if (!(await verifySubject(subject, req.user.id))) {
      return res.status(403).json({
        message: "Not your subject ",
      });
    }

    // Format date
    const formattedDate = date ? new Date(date) : new Date();

    // Convert single attendance into array format
    const dataList = isSingle
      ? [{ _id: studentId, status }]
      : students;

    // Prepare bulk operations
    const ops = dataList.map((s) => ({
      updateOne: {
        filter: {
          student: s._id,
          subject,
          date: formattedDate,
        },
        update: {
          student: s._id,
          teacher: req.user.id,
          subject,
          date: formattedDate,
          status: s.status,
        },
        upsert: true,
      },
    }));

    // Save attendance
    await Attendance.bulkWrite(ops);

    res.json({
      message: "Attendance saved successfully ",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error ",
    });
  }
};

// ==========================================
// 🔹 GET ATTENDANCE
// (ADMIN / TEACHER / STUDENT)
// ==========================================
exports.getAttendance = async (req, res) => {
  try {
    const { date } = req.params;

    let query = {};

    // Student can view only own attendance
    if (req.user.role === "student") {
      query.student = req.user.id;
    }

    // Teacher can view attendance of own subjects
    else if (req.user.role === "teacher") {
      const mySubjects = await Subject.find({
        teacher: req.user.id,
      }).distinct("_id");

      query.subject = {
        $in: mySubjects,
      };

      if (date) {
        query.date = new Date(date);
      }
    }

    // Admin has access to all attendance

    const data = await Attendance.find(query)
      .populate(
        "student",
        "studentId firstName lastName email"
      )
      .populate(
        "teacher",
        "firstName lastName email"
      )
      .populate(
        "subject",
        "name code"
      )
      .sort({
        date: -1,
      });

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching attendance ",
    });
  }
};

// ==========================================
// 🔹 ROUTE ALIASES
// ==========================================
exports.markSingleAttendance = exports.markAttendance;
exports.getAllAttendance = exports.getAttendance;
exports.getAttendanceByDate = exports.getAttendance;
exports.getMyAttendance = exports.getAttendance;