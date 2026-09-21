const Semester = require("../models/Semester");

// 🔹 CRITICAL: Load Department model so Mongoose can populate it without throwing MissingSchemaError
require("../models/Department");

// ==========================================
// 🔹 CREATE SEMESTER
// ==========================================
exports.createSemester = async (req, res) => {
  try {
    const { name, department } = req.body;

    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Semester name is required",
      });
    }

    // Sanitize department ID to avoid CastError with empty string ""
    const cleanDepartment =
      department && department.toString().trim() !== "" && department !== "All"
        ? department.toString().trim()
        : null;

    const trimmedName = name.trim();

    // Check duplicate semester name under the same department (or globally if no dept)
    const duplicateQuery = {
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
      department: cleanDepartment,
    };
    const existingSemester = await Semester.findOne(duplicateQuery);
    if (existingSemester) {
      return res.status(400).json({
        message: `Semester "${trimmedName}" already exists for this department`,
      });
    }

    // Create semester safely
    const semester = await Semester.create({
      name: trimmedName,
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
      .sort({ name: 1, createdAt: 1 });

    res.json(semesters);
  } catch (error) {
    console.error("GET SEMESTERS ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to fetch semesters",
    });
  }
};

// ==========================================
// 🔹 UPDATE SEMESTER
// ==========================================
exports.updateSemester = async (req, res) => {
  try {
    const { name, department } = req.body;
    const { id } = req.params;

    const currentSemester = await Semester.findById(id);
    if (!currentSemester) {
      return res.status(404).json({ message: "Semester not found" });
    }

    const updateData = {};
    let targetName = currentSemester.name;
    if (name && name.trim() !== "") {
      targetName = name.trim();
      updateData.name = targetName;
    }

    let targetDepartment = currentSemester.department;
    if (department !== undefined) {
      targetDepartment =
        department && department.toString().trim() !== "" && department !== "All"
          ? department.toString().trim()
          : null;
      updateData.department = targetDepartment;
    }

    // Check for duplicate name in same department (excluding this semester)
    const duplicate = await Semester.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${targetName}$`, "i") },
      department: targetDepartment,
    });

    if (duplicate) {
      return res.status(400).json({
        message: `Semester "${targetName}" already exists for this department`,
      });
    }

    const updatedSemester = await Semester.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("department", "name");

    res.json(updatedSemester);
  } catch (error) {
    console.error("UPDATE SEMESTER ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to update semester",
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
      message: error.message || "Failed to delete semester",
    });
  }
};