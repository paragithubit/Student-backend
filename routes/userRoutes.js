const express = require("express");
const router = express.Router();
const User = require("../models/User");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  addUser,
  getUsers,
  getTeachers,
  getStudents,
  deleteUser,
  updateUser
} = require("../controllers/userController");

// 🔹 Import updateProfile from authController
const { updateProfile } = require("../controllers/authController");

// ==========================================
// 🔹 USER ROUTES
// ==========================================

// 🖼️ UPDATE LOGGED-IN USER PROFILE (Avatar / Name) - All Roles
router.put("/profile", auth, updateProfile);

// ➕ ADD USER (Admin & Teacher)
router.post("/add", auth, role("admin", "teacher"), addUser);

// 📋 GET ALL USERS (Role Filtered inside controller)
router.get("/", auth, role("admin", "teacher"), getUsers);

// 👨‍🏫 GET ALL TEACHERS (Admin only)
router.get("/teachers", auth, role("admin"), getTeachers);

// 🎓 GET ALL STUDENTS (Admin & Teacher)
router.get("/students", auth, role("admin", "teacher"), getStudents);

// 🎯 DIRECT SET / UPDATE ROLL NUMBER (Admin only)
router.put("/set-roll/:id", auth, role("admin"), async (req, res) => {
  try {
    const { rollNumber } = req.body;

    const formattedRoll =
      rollNumber !== undefined && rollNumber !== null && String(rollNumber).trim() !== ""
        ? String(rollNumber).trim()
        : "N/A";

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { rollNumber: formattedRoll } },
      { new: true, strict: false }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      msg: "Roll number updated successfully",
      user,
    });
  } catch (err) {
    console.error("Set Roll Number Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✏️ UPDATE USER (Admin & Teacher)
router.put("/:id", auth, role("admin", "teacher"), updateUser);

// 🗑️ DELETE USER (Admin only)
router.delete("/:id", auth, role("admin"), deleteUser);

module.exports = router;