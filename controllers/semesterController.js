const Semester = require("../models/Semester");

// 🔹 CRITICAL: Load Department model so Mongoose can populate it without throwing MissingSchemaError
require("../models/Department");

// ==========================================
// 🔹 CREATE SEMESTER
// ==========================================
exports.createSemester = async (req, res) => {
  try {
    const { name, semesterNumber, department } = req.body;

    // Validate required fields
    if (!name || semesterNumber === undefined || semesterNumber === null || semesterNumber === "") {
      return res.status(400).json({
        message: "Semester name and semester number are required",
      });
    }

    const parsedSemesterNumber = Number(semesterNumber);
    if (isNaN(parsedSemesterNumber)) {
      return res.status(400).json({
        message: "Semester number must be a valid number",
      });
    }

    // Sanitize department ID to avoid CastError with empty string ""
    const cleanDepartment =
      department && department.toString().trim() !== "" && department !== "All"
        ? department
        : null;

    // Check duplicate semester number under the same department (or globally if no dept)
    const duplicateQuery = {
      semesterNumber: parsedSemesterNumber,
      department: cleanDepartment,
    };
    const existingSemester = await Semester.findOne(duplicateQuery);
    if (existingSemester) {
      return res.status(400).json({
        message: `Semester ${parsedSemesterNumber} already exists for this department`,
      });
    }

    // Create semester safely
    const semester = await Semester.create({
      name: name.toString().trim(),
      semesterNumber: parsedSemesterNumber,
      department: cleanDepartment,
    });

    const populatedSemester = await Semester.findById(semester._id).populate(
      "department",
      "name"
    );

    res.status(201).json(populatedSemester);
  } catch (error) {
    console.error("CREATE SEMESTER ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to create semester",
    });
  }
};

// ==========================================
// 🔹 GET ALL SEMESTERS
// ==========================================
exports.getAllSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find()
      .populate("department", "name")
      .sort({ semesterNumber: 1 });

    res.json(semesters);
  } catch (error) {
    console.error("GET SEMESTERS ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// 🔹 UPDATE SEMESTER
// ==========================================
exports.updateSemester = async (req, res) => {
  try {
    const { name, semesterNumber, department } = req.body;

    const updateData = {};
    if (name) updateData.name = name.toString().trim();
    if (semesterNumber !== undefined && semesterNumber !== "") {
      const parsedNum = Number(semesterNumber);
      if (!isNaN(parsedNum)) updateData.semesterNumber = parsedNum;
    }
    if (department !== undefined) {
      updateData.department =
        department && department.toString().trim() !== "" && department !== "All"
          ? department
          : null;
    }

    const semester = await Semester.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after", runValidators: true }
    ).populate("department", "name");

    if (!semester) {
      return res.status(404).json({ message: "Semester not found" });
    }

    res.json(semester);
  } catch (error) {
    console.error("UPDATE SEMESTER ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// 🔹 DELETE SEMESTER
// ==========================================
exports.deleteSemester = async (req, res) => {
  try {
    const deletedSemester = await Semester.findByIdAndDelete(req.params.id);

    if (!deletedSemester) {
      return res.status(404).json({ message: "Semester not found" });
    }

    res.json({ message: "Semester deleted successfully" });
  } catch (error) {
    console.error("DELETE SEMESTER ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};