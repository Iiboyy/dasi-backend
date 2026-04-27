const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI not found in .env");
    }
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:");
    console.error(
      "URI (masked):",
      err.connection?.uri
        ? err.connection.uri.replace(/\/\/[^@]+@/, "//***:***@")
        : "N/A",
    );
    console.error("Full error:", err.message);
    console.error("Stack:", err.stack);
    process.exit(1);
  }
};

module.exports = connectDB;
