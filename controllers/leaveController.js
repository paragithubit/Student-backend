const Leave = require("../models/Leave");

// ==========================================
// CREATE LEAVE
// ==========================================
exports.createLeave = async (req, res) => {

  try {

    const {
      fromDate,
      toDate,
      reason,
    } = req.body;

    // USER FROM TOKEN
    const userId =
      req.user.id ||
      req.user.user?.id;

    const userRole =
      req.user.role ||
      req.user.user?.role;

    // VALIDATION
    if (
      !fromDate ||
      !toDate ||
      !reason
    ) {
      return res.status(400).json({
        message:
          "All fields required",
      });
    }

    // CREATE LEAVE
    const leave = await Leave.create({
      user: userId,
      role: userRole,
      fromDate,
      toDate,
      reason,
      status: "Pending",
    });

    res.status(201).json({
      message:
        "Leave request submitted",
      leave,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// GET MY LEAVES
// ==========================================
exports.getMyLeaves = async (req, res) => {

  try {

    const userId =
      req.user.id ||
      req.user.user?.id;

    const leaves = await Leave.find({
      user: userId,
    })
      .populate(
        "user",
        "firstName lastName email role"
      )
      .sort({
        createdAt: -1,
      });

    res.json(leaves);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL LEAVES (ADMIN)
// ==========================================
exports.getAllLeaves = async (
  req,
  res
) => {

  try {

    const leaves = await Leave.find()
      .populate(
        "user",
        "firstName lastName email role"
      )
      .sort({
        createdAt: -1,
      });

    res.json(leaves);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE LEAVE STATUS
// ==========================================
exports.updateLeaveStatus =
  async (req, res) => {

    try {

      const { status } = req.body;

      // VALIDATION
      if (
        status !== "Approved" &&
        status !== "Rejected"
      ) {
        return res.status(400).json({
          message:
            "Invalid status",
        });
      }

      const leave =
        await Leave.findByIdAndUpdate(
          req.params.id,
          { status },
          { new: true }
        ).populate(
          "user",
          "firstName lastName email role"
        );

      res.json({
        message:
          "Leave status updated",
        leave,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: error.message,
      });
    }
  };