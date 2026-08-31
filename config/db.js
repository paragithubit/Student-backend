const mongoose = require("mongoose");

// ==========================================
// 🔹 CONNECT DATABASE
// ==========================================
const connectDB = async () => {
  try {

    // Connect MongoDB
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB Connected ");

  } catch (err) {

    console.log(err);

    process.exit(1);
  }
};

module.exports = connectDB;