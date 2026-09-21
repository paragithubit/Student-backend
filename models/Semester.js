const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
  {
    // Semester Name (e.g., "Semester 1", "Fall 2026")
    name: {
      type: String,
      required: [true, "Semester name is required"],
      trim: true,
    },

    // Department Reference (Optional / Global)
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Prevent duplicate semester names under the same department
semesterSchema.index({ name: 1, department: 1 }, { unique: true });

module.exports = mongoose.model("Semester", semesterSchema);