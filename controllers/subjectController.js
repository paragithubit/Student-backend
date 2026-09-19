const Subject = require("../models/Subject");

// ==========================================
// 🔹 CREATE / ADD SUBJECT (ADMIN)
// ==========================================
exports.createSubject = async (req, res) => {
  try {
    const { name, code, teacherId, department, semester, credits, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Subject name and code are required",
      });
    }

    const existingSubject = await Subject.findOne({ code: code.trim().toUpperCase() });
    if (existingSubject) {
      return res.status(400).json({
        message: "Subject code already exists",
      });
    }

    const newSubject = new Subject({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      teacher: teacherId || null,
      department: department || null,
      semester: semester || null,
      credits: credits || 0,
      description: description || "",
    });

    await newSubject.save();

    const populatedSubject = await Subject.findById(newSubject._id)
      .populate("teacher", "firstName lastName email")
      .populate("department", "name")
      .populate("semester", "name semesterNumber");

    res.status(201).json({
      message: "Subject created successfully",
      subject: populatedSubject,
    });
  } catch (err) {
    console.error("CREATE SUBJECT ERROR:", err);
    res.status(500).json({
      message: "Error creating subject",
      error: err.message,
    });
  }
};

// ==========================================
// 🔹 ASSIGN SUBJECT TO TEACHER (ADMIN)
// ==========================================
exports.assignSubject = async (req, res) => {
  try {
    const { subjectId, teacherId } = req.body;

    if (!subjectId || !teacherId) {
      return res.status(400).json({
        message: "SubjectId and TeacherId required",
      });
    }

    const subject = await Subject.findByIdAndUpdate(
      subjectId,
      { teacher: teacherId },
      { new: true }
    )
      .populate("teacher", "firstName lastName email")
      .populate("department", "name")
      .populate("semester", "name semesterNumber");

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.json({
      message: "Subject assigned successfully",
      subject,
    });
  } catch (err) {
    console.error("ASSIGN SUBJECT ERROR:", err);
    res.status(500).json({
      message: "Assign failed",
      error: err.message,
    });
  }
};

// ==========================================
// 🔹 GET LOGGED-IN TEACHER SUBJECTS
// ==========================================
exports.getMySubjects = async (req, res) => {
  try {
    const teacherId = req.user.id || req.user.user?.id;

    const subjects = await Subject.find({ teacher: teacherId })
      .populate("teacher", "firstName lastName email")
      .populate("department", "name")
      .populate("semester", "name semesterNumber");

    res.json(subjects);
  } catch (err) {
    console.error("GET MY SUBJECTS ERROR:", err);
    res.status(500).json({
      message: "Error fetching subjects",
      error: err.message,
    });
  }
};

// ==========================================
// 🔹 GET TEACHER SUBJECTS WITH POPULATE
// ==========================================
exports.getTeacherSubjects = async (req, res) => {
  try {
    const teacherId = req.user.id || req.user.user?.id;

    const subjects = await Subject.find({ teacher: teacherId })
      .populate("teacher", "firstName lastName email")
      .populate("department", "name")
      .populate("semester", "name semesterNumber");

    res.json(subjects);
  } catch (err) {
    console.error("GET TEACHER SUBJECTS ERROR:", err);
    res.status(500).json({
      message: "Error fetching subjects",
      error: err.message,
    });
  }
};

// ==========================================
// 🔹 GET ALL SUBJECTS (ADMIN & TEACHER)
// ==========================================
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("teacher", "firstName lastName email")
      .populate("department", "name")
      .populate("semester", "name semesterNumber")
      .sort({ name: 1 });

    res.json(subjects);
  } catch (err) {
    console.error("GET ALL SUBJECTS ERROR:", err);
    res.status(500).json({
      message: "Error fetching all subjects",
      error: err.message,
    });
  }
};

// ==========================================
// 🔹 UPDATE SUBJECT (ADMIN)
// ==========================================
exports.updateSubject = async (req, res) => {
  try {
    const { name, code, teacherId, department, semester, credits, description } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (code) updateData.code = code.trim().toUpperCase();
    if (teacherId !== undefined) updateData.teacher = teacherId || null;
    if (department !== undefined) updateData.department = department || null;
    if (semester !== undefined) updateData.semester = semester || null;
    if (credits !== undefined) updateData.credits = credits;
    if (description !== undefined) updateData.description = description;

    if (code) {
      const existingSubject = await Subject.findOne({
        code: code.trim().toUpperCase(),
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
};

// ==========================================
// 🔹 DELETE SUBJECT (ADMIN)
// ==========================================
exports.deleteSubject = async (req, res) => {
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
};