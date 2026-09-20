const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");

// ==========================================
// 🔹 REGISTER USER
// ==========================================
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const normalizedEmail = email ? email.trim().toLowerCase() : "";

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ msg: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    await user.save();

    res.status(201).json({
      msg: "User registered successfully",
    });
  } catch (err) {
    console.error("Register error:", err);
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

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Case-insensitive lookup
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });

    if (!user) {
      return res.status(400).json({
        msg: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid password",
      });
    }

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

    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.role;

    res.json({
      token,
      role: user.role,
      name: fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: fullName,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        rollNumber: user.rollNumber || "N/A",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// ==========================================
// 🔹 FORGOT PASSWORD (Resend HTTP API)
// ==========================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({
        message: "Please provide an email address",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
    });

    if (!user) {
      return res.status(404).json({
        message: "No registered user found with this email address",
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: RESEND_API_KEY is not defined in environment variables!");
      return res.status(500).json({
        message: "Email service is not configured on the server. Missing RESEND_API_KEY.",
      });
    }

    const resend = new Resend(apiKey.trim());

    // Generate secure token (10-minute validity)
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Build reset URL
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetUrl = `${clientUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

    // Send email via HTTPS API (Port 443 - zero firewall blocks on Render)
    const { data, error } = await resend.emails.send({
      from: "Academic Portal <onboarding@resend.dev>",
      to: [user.email],
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #4338ca; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="font-size: 15px; color: #334155; line-height: 1.6;">Hello <strong>${user.firstName || "Student"}</strong>,</p>
          <p style="font-size: 15px; color: #334155; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new password. This link is valid for <strong>10 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
              Reset My Password
            </a>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            If the button above does not work, copy and paste this URL into your browser:
          </p>
          <p style="font-size: 12px; color: #4f46e5; word-break: break-all; background-color: #f1f5f9; padding: 10px; border-radius: 6px;">
            ${resetUrl}
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return res.status(502).json({
        message: "Failed to deliver email through API.",
        detail: error.message,
      });
    }

    return res.json({
      message: "Password reset link has been sent to your email.",
    });
  } catch (err) {
    console.error("Forgot password controller error:", err);
    return res.status(500).json({
      message: err.message || "An internal server error occurred",
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
          { path: "department" },
          { path: "semester" },
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
        message: "Invalid or expired reset token. Please request a new link.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      message: "Password reset successful! You can now log in.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      message: "Something went wrong resetting your password",
      error: err.message,
    });
  }
};