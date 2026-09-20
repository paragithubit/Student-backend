const express = require("express");
const router = express.Router();

const {
  createSemester,
  getAllSemesters,
  updateSemester,
  deleteSemester,
} = require("../controllers/semesterController");

// Connect routes directly to controller functions
router.post("/", createSemester);
router.get("/", getAllSemesters);
router.put("/:id", updateSemester);
router.delete("/:id", deleteSemester);

module.exports = router;