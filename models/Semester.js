const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
  {
    // Semester Name
    name: {
      type: String,
      required: true,
    },

    // Semester Number
    semesterNumber: {
      type: Number,
      required: true,
    },

    // Department Reference
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Semester",
  semesterSchema
);