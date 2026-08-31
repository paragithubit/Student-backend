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

//  ADD USER
router.post("/add", auth, role("admin","teacher"), addUser);

//  GET USERS
router.get("/", auth, role("admin", "teacher"), getUsers);

//GET TEACHER
router.get("/teachers", auth, role("admin"), getTeachers);

//GET STUDENTS
router.get("/students", auth, role("admin", "teacher"), getStudents);


//  UPDATE 
router.put("/:id", auth, role("admin", "teacher"), updateUser);

//  DELETE
router.delete("/:id", auth, role("admin"), deleteUser);

module.exports = router;