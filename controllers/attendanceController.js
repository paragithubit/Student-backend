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
// 🔹 MARK ATTENDANCE (BULK + SINGLE)
// ==========================================
exports.markAttendance = async (req, res) => {
  try {
    const { students, date, subject, studentId, status } = req.body;

    const isSingle = !!studentId;

    // Verify teacher owns the subject (Admin bypasses subject ownership check)
    if (req.user.role !== "admin") {
      const isOwner = await verifySubject(subject, req.user.id);
      if (!isOwner) {
        return res.status(403).json({
          message: "Not your subject",
        });
      }
    }

    // Format date
    const formattedDate = date ? new Date(date) : new Date();

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

    await Attendance.bulkWrite(ops);

    res.json({
      message: "Attendance saved successfully",
    });
  } catch (err) {
    console.error("Mark Attendance Error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// 🔹 GET ATTENDANCE (ADMIN / TEACHER / STUDENT)
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

    // Admin has access to all attendance records

    const data = await Attendance.find(query)
      .populate(
        "student",
        "studentId rollNumber firstName lastName email"
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
    console.error("Get Attendance Error:", err);
    res.status(500).json({
      message: "Error fetching attendance",
    });
  }
};

// ==========================================
// 🔹 UPDATE ATTENDANCE (ADMIN & TEACHER)
// ==========================================
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, date } = req.body;

    const record = await Attendance.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Teachers can only edit attendance for subjects they teach
    if (req.user.role === "teacher") {
      const isOwner = await verifySubject(record.subject, req.user.id);
      if (!isOwner) {
        return res.status(403).json({ message: "Access denied: Not your subject" });
      }
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (date) updateFields.date = new Date(date);

    const updatedRecord = await Attendance.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate("student", "studentId rollNumber firstName lastName email")
      .populate("teacher", "firstName lastName email")
      .populate("subject", "name code");

    res.json({
      message: "Attendance updated successfully",
      record: updatedRecord,
    });
  } catch (err) {
    console.error("Update Attendance Error:", err);
    res.status(500).json({
      message: "Server error updating attendance",
      error: err.message,
    });
  }
};

// ==========================================
// 🔹 DELETE ATTENDANCE (ADMIN ONLY)
// ==========================================
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecord = await Attendance.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.json({
      message: "Attendance record deleted successfully",
    });
  } catch (err) {
    console.error("Delete Attendance Error:", err);
    res.status(500).json({
      message: "Server error deleting attendance",
      error: err.message,
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