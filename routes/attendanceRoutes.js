const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  markAttendance,
  markSingleAttendance,
  getAllAttendance, //  FIXED
  getAttendanceByDate,
  getMyAttendance
} = require("../controllers/attendanceController");

//  Bulk attendance
router.post("/mark-bulk", auth, role("teacher"), markAttendance);

//  Single attendance
router.post("/mark", auth, role("teacher"), markSingleAttendance);

//  Admin + Teacher view all attendance
router.get("/", auth, role("admin", "teacher"), getAllAttendance);

//  Student own attendance (IMPORTANT ORDER FIX)
router.get("/my", auth, role("student"), getMyAttendance);

//  Filter by date (LAST)
router.get("/:date", auth, role("teacher"), getAttendanceByDate);

module.exports = router;