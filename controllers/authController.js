const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ==========================================
// 🔹 REGISTER USER
// ==========================================
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    res.json({
      msg: "User registered successfully ",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ==========================================
// 🔹 LOGIN USER
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        msg: "User not found ",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid password ",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      token,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
      profilePic: user.profilePic,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

// ==========================================
// 🔹 FORGOT PASSWORD
// ==========================================
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Save token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: `
        <h2>Password Reset</h2>
        <p>Click below link to reset password:</p>
        <a href="${resetUrl}">
          Reset Password
        </a>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({
      message: "Reset link sent to email",
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error",
    });
  }
};

//ADD new code
  exports.getMe = async (req, res) => {

  try {

    const user = await User.findById(req.user.id)

      .populate("department")

      .populate("semester")

      .populate({
        path: "division",
        populate: [
          {
            path: "department",
          },
          {
            path: "semester",
          },
        ],
      });

    res.json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};
// ==========================================
// 🔹 RESET PASSWORD
// ==========================================
exports.resetPassword = async (req, res) => {

  try {

    const { token } = req.params;

    const { password } = req.body;

    // ==============================
    // PASSWORD REQUIRED
    // ==============================
    if (!password || password.trim() === "") {

      return res.status(400).json({
        message: "Password is required",
      });
    }

    // ==============================
    // PASSWORD LENGTH
    // ==============================
    if (password.length < 6) {

      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    // ==============================
    // FIND VALID TOKEN
    // ==============================
    const user = await User.findOne({

      resetPasswordToken: token,

      resetPasswordExpire: {
        $gt: Date.now(),
      },

    });

    // ==============================
    // INVALID TOKEN
    // ==============================
    if (!user) {

      return res.status(400).json({
        message:
          "Invalid or expired token",
      });
    }

    // ==============================
    // HASH PASSWORD
    // ==============================
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // ==============================
    // UPDATE PASSWORD
    // ==============================
    user.password = hashedPassword;

    // CLEAR RESET TOKEN
    user.resetPasswordToken =
      undefined;

    user.resetPasswordExpire =
      undefined;

    await user.save();

    res.json({
      message:
        "Password reset successful",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message:
        "Something went wrong",
    });
  }
};