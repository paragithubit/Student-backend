const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    // USER
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ROLE
    role: {
      type: String,
      enum: ["student", "teacher"],
      required: true,
    },

    // REASON
    reason: {
      type: String,
      required: true,
    },

    // FROM DATE
    fromDate: {
      type: Date,
      required: true,
    },

    // TO DATE
    toDate: {
      type: Date,
      required: true,
    },

    // STATUS
    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Leave",
  leaveSchema
);