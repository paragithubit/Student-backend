const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  markAttendance,
  markSingleAttendance,
  getAllAttendance,
  getAttendanceByDate,
  getMyAttendance,
  updateAttendance,
  deleteAttendance
} = require("../controllers/attendanceController");

// ==========================================
// 🔹 ATTENDANCE ROUTES
// ==========================================

// 📋 Bulk attendance (Teacher & Admin)
router.post("/mark-bulk", auth, role("teacher", "admin"), markAttendance);

// ➕ Single attendance (Teacher & Admin)
router.post("/mark", auth, role("teacher", "admin"), markSingleAttendance);

// 📊 Admin + Teacher view all attendance
router.get("/", auth, role("admin", "teacher"), getAllAttendance);

// 🎓 Student own attendance (Must precede dynamic /:id or /:date routes)
router.get("/my", auth, role("student"), getMyAttendance);

// ✏️ Update attendance record (Admin & Teacher)
router.put("/:id", auth, role("admin", "teacher"), updateAttendance);

// 🗑️ Delete attendance record (Admin only)
router.delete("/:id", auth, role("admin"), deleteAttendance);

// 📅 Filter by date (Keep at the end to prevent collision with fixed routes)
router.get("/:date", auth, role("teacher", "admin"), getAttendanceByDate);

module.exports = router;