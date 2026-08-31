const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const role = require("../middleware/roleMiddleware");

const {
  addResult,
  getResults,
  getMyResults,
  updateResult,
  deleteResult,
} = require("../controllers/resultController");

// ==========================================
// ADD RESULT
// ==========================================
router.post(
  "/add",
  auth,
  role("admin", "teacher"),
  addResult
);

// ==========================================
// GET ALL RESULTS
// ADMIN + TEACHER
// ==========================================
router.get(
  "/",
  auth,
  role("admin", "teacher"),
  getResults
);

// ==========================================
// GET MY RESULTS
// STUDENT
// ==========================================
router.get(
  "/my",
  auth,
  role("student"),
  getMyResults
);

// ==========================================
// UPDATE RESULT
// ==========================================
router.put(
  "/:id",
  auth,
  role("admin", "teacher"),
  updateResult
);

// ==========================================
// DELETE RESULT
// ==========================================
router.delete(
  "/:id",
  auth,
  role("admin", "teacher"),
  deleteResult
);

module.exports = router;