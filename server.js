require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// ==========================================
// 🔹 DATABASE CONNECTION & CORE MODELS
// ==========================================
connectDB();

// Pre-register models to prevent Mongoose populate MissingSchemaError
require("./models/User");
require("./models/Department");
require("./models/Semester");

// ==========================================
// 🔹 MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 🔹 ROUTES
// ==========================================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));

// ⚠️ Note: If your file is named 'semsetrRoute.js', keep this line:
// app.use("/api/semesters", require("./routes/semsetrRoute"));
// If you renamed the file to 'semesterRoutes.js', use this line:
app.use("/api/semesters", require("./routes/semesterRoutes"));

app.use("/api/divisions", require("./routes/divisionRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/timetables", require("./routes/timetableRoutes"));

// Health check endpoint
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ==========================================
// 🔹 404 & ERROR HANDLING MIDDLEWARE
// ==========================================
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error("GLOBAL SERVER ERROR:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// ==========================================
// 🔹 SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));