const mongoose = require("mongoose");

// ==========================================
// 🔹 SUBJECT SCHEMA
// ==========================================
const subjectSchema = new mongoose.Schema(
  {
    // Subject name
    name: {
      type: String,
      required: true,
    },

    // Subject code
    code: {
      type: String,
      required: true,
      unique: true,
    },

    // Subject credits
    credits: {
      type: Number,
      default: 0,
    },

    // Subject description
    description: {
      type: String,
      default: "",
    },

    // Assigned teacher
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Department
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    // Semester
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Subject",
  subjectSchema
);