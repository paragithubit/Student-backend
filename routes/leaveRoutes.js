const express = require("express");

const router = express.Router();

// MIDDLEWARE
const auth = require(
  "../middleware/authMiddleware"
);

const role = require(
  "../middleware/roleMiddleware"
);

// CONTROLLER
const {
  createLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require(
  "../controllers/leaveController"
);

// ==========================================
// CREATE LEAVE
// STUDENT + TEACHER
// ==========================================
router.post(
  "/",
  auth,
  role("student", "teacher"),
  createLeave
);

// ==========================================
// GET MY LEAVES
// ==========================================
router.get(
  "/my",
  auth,
  role("student", "teacher"),
  getMyLeaves
);

// ==========================================
// GET ALL LEAVES
// ADMIN ONLY
// ==========================================
router.get(
  "/",
  auth,
  role("admin"),
  getAllLeaves
);

// ==========================================
// UPDATE LEAVE STATUS
// ADMIN ONLY
// ==========================================
router.put(
  "/:id",
  auth,
  role("admin"),
  updateLeaveStatus
);

module.exports = router;