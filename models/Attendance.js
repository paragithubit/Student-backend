const mongoose = require("mongoose");

// ==========================================
// 🔹 ATTENDANCE SCHEMA
// ==========================================
const attendanceSchema = new mongoose.Schema(
  {
    // Student reference
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Teacher reference
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Subject reference
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
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

    // Division/Class
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
    },

    // Attendance date
    date: {
      type: Date,
      default: Date.now,
    },

    // Attendance status
    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Late",
        "Excused",
      ],
      required: true,
    },

    // Lecture Number
    lectureNumber: {
      type: Number,
      default: 1,
    },

    // Remarks
    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);