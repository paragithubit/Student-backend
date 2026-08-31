const express = require("express");

const router = express.Router();

const Department = require("../models/Department");

// CREATE DEPARTMENT
router.post("/", async (req, res) => {
  try {
    const department = await Department.create(req.body);

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//Delte code 
  router.delete("/:id", async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//Update code 
router.put("/:id", async (req, res) => {
  try {
    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET ALL DEPARTMENTS
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find();

    res.json(departments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});



module.exports = router;