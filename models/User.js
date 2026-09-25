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
      trim: true,
    },

    // Last name
    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    // User email
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },

    // User password
    password: {
      type: String,
      required: true,
    },

    // User role
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student",
      lowercase: true,
    },

    // Student Roll Number
    rollNumber: {
      type: String,
      default: "N/A",
      trim: true,
    },

    // 🔹 Profile picture (Base64 string or URL isolated per user)
    profilePic: {
      type: String,
      default: "",
    },

    // Department
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    // Semester
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      default: null,
    },

    // Division/Class
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
      default: null,
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

module.exports = mongoose.model("User", userSchema);