require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

//Subjects
const subjectRoutes = require("./routes/subjectRoutes");


// Middleware
app.use(cors());
app.use(express.json());

// DB Connect
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

//Subject Route
app.use("/api/subjects", subjectRoutes);

//Attdences Route
// app.use("/api/students", require("./routes/"));  
app.use("/api/attendance", require("./routes/attendanceRoutes"));

//Result Route
app.use("/api/results", require("./routes/resultRoutes"));

//chek usig get
app.use("/api/users", require("./routes/userRoutes"));

//Adde new Routes
app.use("/api/departments", require("./routes/departmentRoutes"));

app.use("/api/semesters", require("./routes/semesterRoutes"));

app.use("/api/divisions", require("./routes/divisionRoutes"));

app.use("/api/notices", require("./routes/noticeRoutes"));

app.use("/api/leaves", require("./routes/leaveRoutes"));

app.use("/api/timetables", require("./routes/timetableRoutes"));

app.get("/", (req, res) => {
  res.send("API Running ");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));