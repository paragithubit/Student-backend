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
      email,
      password,
      role,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        msg: "User already exists ",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create user
    const user = new User({
      firstName,
      lastName,
      studentId,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    res.json({
      msg: "User added successfully ",
    });
  } catch (err) {
    console.log(err);

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

    const users = await User.find(filter).select(
      "-password"
    );

    res.json(users);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      msg: "Error fetching users ",
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

    console.log(error);

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

    console.log(error);

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
      msg: "User deleted successfully ",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      msg: "Error deleting user ",
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
      email,
      password,
      role,
    } = req.body;

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        msg: "User not found ",
      });
    }

    // Check duplicate email
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email,
      });

      if (existingUser) {
        return res.status(400).json({
          msg: "Email already in use ",
        });
      }
    }

    // Update fields
    user.firstName =
      firstName || user.firstName;

    user.lastName =
      lastName || user.lastName;

    if (studentId !== undefined) {
      user.studentId = studentId;
    }

    user.email = email || user.email;

    user.role = role || user.role;

    // Update password if provided
    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(
        password,
        10
      );
    }

    await user.save();

    res.json({
      msg: "User updated successfully ",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      msg: "Error updating user ",
    });
  }
};