const mongoose = require("mongoose");

// ==========================================
// 🔹 RESULT SCHEMA
// ==========================================
const resultSchema = new mongoose.Schema(
  {
    // Student reference
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Department
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    // Semester reference
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },

    // Division/Class
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
    },

    // Subject details
    subjects: [
      {
        subjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
        },

        subjectName: String,

        marks: {
          type: Number,
          default: 0,
        },

        maxMarks: {
          type: Number,
          default: 100,
        },

        resultStatus: {
          type: String,
          enum: ["Pass", "Fail"],
          default: "Pass",
        },
      },
    ],

    // Total marks
    total: {
      type: Number,
      default: 0,
    },

    // Percentage
    percentage: {
      type: Number,
      default: 0,
    },

    // Grade
    grade: {
      type: String,
      default: "",
    },

    // Final Result
    finalResult: {
      type: String,
      enum: ["Pass", "Fail"],
      default: "Pass",
    },

    // Rank
    rank: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Result",
  resultSchema
);