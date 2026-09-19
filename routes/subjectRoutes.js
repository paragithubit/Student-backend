const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const Subject = require("../models/Subject");

const { getMySubjects } = require("../controllers/subjectController");

// ==========================================
// ➕ CREATE + ASSIGN SUBJECT (ADMIN ONLY)
// ==========================================
router.post("/assign", auth, role("admin"), async (req, res) => {
  try {
    const {
      name,
      code,
      teacherId,
      department,
      semester,
      credits,
      description,
    } = req.body;

    // Validation
    if (!name || !code || !teacherId) {
      return res.status(400).json({
        message: "Name, Code, and Teacher are required",
      });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check duplicate code
    const existingSubject = await Subject.findOne({ code: cleanCode });
    if (existingSubject) {
      return res.status(400).json({
        message: "Subject code already exists",
      });
    }

    // Create subject record
    const subject = new Subject({
      name: name.trim(),
      code: cleanCode,
      teacher: teacherId,
      department: department || null,
      semester: semester || null,
      credits: credits || 0,
      description: description || "",
    });

    await subject.save();

    const populatedSubject = await Subject.findById(subject._id)
      .populate("teacher", "firstName lastName email")
      .populate("department", "name")
      .populate("semester", "name semesterNumber");

    res.status(201).json({
      message: "Subject assigned successfully",
      subject: populatedSubject,
    });
  } catch (err) {
    console.error("ASSIGN SUBJECT ERROR:", err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================================
// 🧑‍🏫 GET LOGGED-IN TEACHER SUBJECTS
// ==========================================
router.get("/my", auth, role("teacher"), getMySubjects);

// ==========================================
// 📚 GET ALL SUBJECTS (ADMIN & TEACHER)
// ==========================================
router.get("/", auth, role("admin", "teacher"), async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("teacher", "firstName lastName email")
      .populate("department", "name")
      .populate("semester", "name semesterNumber")
      .sort({ createdAt: -1 });

    res.json(subjects);
  } catch (err) {
    console.error("GET ALL SUBJECTS ERROR:", err);
    res.status(500).json({
      message: "Error fetching subjects",
      error: err.message,
    });
  }
});

// ==========================================
// ✏️ UPDATE SUBJECT (ADMIN ONLY)
// ==========================================
router.put("/:id", auth, role("admin"), async (req, res) => {
  try {
    const {
      name,
      code,
      teacherId,
      department,
      semester,
      credits,
      description,
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (code) updateData.code = code.trim().toUpperCase();
    if (teacherId !== undefined) updateData.teacher = teacherId || null;
    if (department !== undefined) updateData.department = department || null;
    if (semester !== undefined) updateData.semester = semester || null;
    if (credits !== undefined) updateData.credits = credits;
    if (description !== undefined) updateData.description = description;

    // Check duplicate code if code is changed
    if (updateData.code) {
      const existingSubject = await Subject.findOne({
        code: updateData.code,
        _id: { $ne: req.params.id },
      });

      if (existingSubject) {
        return res.status(400).json({
          message: "Subject code already exists",
        });
      }
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("teacher", "firstName lastName email")
      .populate("department", "name")
      .populate("semester", "name semesterNumber");

    if (!updatedSubject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject updated successfully",
      subject: updatedSubject,
    });
  } catch (err) {
    console.error("UPDATE SUBJECT ERROR:", err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================================
// 🗑️ DELETE SUBJECT (ADMIN ONLY)
// ==========================================
router.delete("/:id", auth, role("admin"), async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);

    if (!deletedSubject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.status(200).json({
      message: "Subject deleted successfully",
    });
  } catch (err) {
    console.error("DELETE SUBJECT ERROR:", err);
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;