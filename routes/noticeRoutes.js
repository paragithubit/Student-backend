const express = require("express");

const router = express.Router();

const Notice = require("../models/Notice");



// CREATE NOTICE
router.post("/", async (req, res) => {

  try {

    const notice = await Notice.create(
      req.body
    );

    res.status(201).json(notice);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});



// GET ALL NOTICES
router.get("/", async (req, res) => {

  try {

    const notices = await Notice.find()
      .sort({ createdAt: -1 });

    res.json(notices);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

// UPDATE NOTICE
router.put("/:id", async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE NOTICE
router.delete("/:id", async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Notice deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;