const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ==========================================
// 🔹 ADD USER (ADMIN ONLY)
// ==========================================
exports.addUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      studentId,
      rollNumber,
      email,
      password,
      role,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Pick rollNumber or studentId
    const assignedRoll = rollNumber || studentId || "N/A";

    // Create user
    const user = new User({
      firstName,
      lastName,
      rollNumber: role === "student" ? assignedRoll : "N/A",
      email,
      password: hashedPassword,
      role: role || "student",
    });

    await user.save();

    res.status(201).json({
      msg: "User added successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        rollNumber: user.rollNumber,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Add User Error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// ==========================================
// 🔹 GET USERS (ROLE BASED)
// ==========================================
exports.getUsers = async (req, res) => {
  try {
    let filter = {};

    // Teacher can view only students
    if (req.user?.role === "teacher") {
      filter.role = "student";
    }

    const users = await User.find(filter)
      .select("-password")
      .populate("division", "name");

    res.json(users);
  } catch (err) {
    console.error("Get Users Error:", err);
    res.status(500).json({
      msg: "Error fetching users",
    });
  }
};

// ==========================================
// 🔹 GET TEACHERS (ADMIN PANEL)
// ==========================================
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      role: "teacher",
    }).select("-password");

    res.json(teachers);
  } catch (error) {
    console.error("Get Teachers Error:", error);
    res.status(500).json({
      msg: "Error fetching teachers",
    });
  }
};

// ==========================================
// 🔹 GET STUDENTS (ADMIN PANEL)
// ==========================================
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
    }).select("-password");

    res.json(students);
  } catch (error) {
    console.error("Get Students Error:", error);
    res.status(500).json({
      msg: "Error fetching students",
    });
  }
};

// ==========================================
// 🔹 DELETE USER (ADMIN ONLY)
// ==========================================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res.json({
      msg: "User deleted successfully",
    });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({
      msg: "Error deleting user",
    });
  }
};

// ==========================================
// 🔹 UPDATE USER (ADMIN ONLY)
// ==========================================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      firstName,
      lastName,
      studentId,
      rollNumber,
      email,
      password,
      role,
    } = req.body;

    // 1. Verify existence
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    // 2. Check duplicate email if it was changed
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(400).json({
          msg: "Email already in use",
        });
      }
    }

    // 3. Resolve Roll Number
    const resolvedRoll =
      rollNumber !== undefined
        ? rollNumber
        : studentId !== undefined
        ? studentId
        : user.rollNumber;

    const updateFields = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      role: role || user.role,
      rollNumber: resolvedRoll && String(resolvedRoll).trim() !== "" ? String(resolvedRoll).trim() : "N/A",
    };

    // 4. Hash password only if a new non-empty password was sent
    if (password && password.trim() !== "") {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    // 5. Force update via $set & strict: false so MongoDB directly persists it
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: false, strict: false }
    ).select("-password");

    res.json({
      msg: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({
      msg: "Error updating user",
      error: err.message,
    });
  }
};