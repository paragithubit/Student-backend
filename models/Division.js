const mongoose = require("mongoose");

const divisionSchema = new mongoose.Schema(
  {
    // Division Name
    name: {
      type: String,
      required: true,
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

    // Assigned Students
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Assigned Teachers
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Division",
  divisionSchema
);