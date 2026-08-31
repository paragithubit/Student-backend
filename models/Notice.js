const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    audience: {
      type: String,
      enum: [
        "student",
        "teacher",
        "all",
      ],
      default: "all",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notice",
  noticeSchema
);