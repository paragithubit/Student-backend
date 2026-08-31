const jwt = require("jsonwebtoken");

// ==========================================
// 🔹 AUTH MIDDLEWARE
// ==========================================
module.exports = function (req, res, next) {

  try {

    // ==========================================
    // GET AUTH HEADER
    // ==========================================
    const authHeader =
      req.header("Authorization");

    // ==========================================
    // CHECK TOKEN
    // ==========================================
    if (!authHeader) {

      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // ==========================================
    // REMOVE BEARER
    // ==========================================
    const token =
      authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    // ==========================================
    // VERIFY TOKEN
    // ==========================================
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ==========================================
    // SAVE USER
    // ==========================================
    req.user = decoded;

    next();

  } catch (err) {

    // ==========================================
    // TOKEN EXPIRED
    // ==========================================
    if (err.name === "TokenExpiredError") {

      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    // ==========================================
    // INVALID TOKEN
    // ==========================================
    if (err.name === "JsonWebTokenError") {

      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // ==========================================
    // OTHER ERROR
    // ==========================================
    console.log("AUTH ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Server auth error",
    });
  }
};