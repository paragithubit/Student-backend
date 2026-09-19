const mongoose = require("mongoose");

// ==========================================
// 🔹 USER SCHEMA
// ==========================================
const userSchema = new mongoose.Schema(
  {
    // First name
    firstName: {
      type: String,
      required: true,
    },

    // Last name
    lastName: {
      type: String,
      required: true,
    },

    // User email
    email: {
      type: String,
      unique: true,
      required: true,
    },

    // User password
    password: {
      type: String,
      required: true,
    },

    // User role
    role: {
      type: String,
      enum: [
        "admin",
        "teacher",
        "student",
      ],
      default: "student",
    },

    // Student Roll Number
    rollNumber: {
      type: String,
      default: "N/A",
      trim: true,
    },

    // Profile picture (Base64 string or URL)
    profilePic: {
      type: String,
      default: "",
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

    // Reset password token
    resetPasswordToken: String,

    // Reset password expiry
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);