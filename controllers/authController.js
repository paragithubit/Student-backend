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
      msg: "User registered successfully",
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
        msg: "User not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid password",
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
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        rollNumber: user.rollNumber || "N/A",
      },
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
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Reset URL
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    // 🔹 Render-safe IPv4 SMTP configuration (Fixes ENETUNREACH and port 465 timeout)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      family: 4, // 👈 Forces IPv4 to eliminate IPv6 ENETUNREACH errors on Render
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000, // 10s connection timeout
    });

    // Email options
    const mailOptions = {
      from: `"Academic Portal" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the button below to set a new password (valid for 10 minutes):</p>
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-top: 10px;">
            Reset Password
          </a>
          <p style="margin-top: 20px; color: #64748b; font-size: 12px;">If you did not make this request, please ignore this email.</p>
        </div>
      `,
    };

    // Send email with error isolation
    try {
      await transporter.sendMail(mailOptions);
      return res.json({
        message: "Reset link sent to email",
      });
    } catch (mailError) {
      console.error("Nodemailer send error:", mailError);
      return res.status(500).json({
        message: "Failed to send reset email. Please verify email credentials or try again later.",
        error: mailError.message,
      });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({
      message: "An internal server error occurred",
      error: err.message,
    });
  }
};

// ==========================================
// 🔹 GET CURRENT LOGGED IN USER
// ==========================================
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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("getMe error:", error);
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

    if (!password || password.trim() === "") {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    // Clear reset tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      message: "Password reset successful",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};