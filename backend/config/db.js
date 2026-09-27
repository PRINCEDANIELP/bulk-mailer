const mongoose = require("mongoose");
const dns = require("dns");

// Ensure MongoDB Atlas SRV records resolve smoothly across Windows / varied network configurations
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // fallback gracefully if environment restricts custom DNS servers
}

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is missing from environment variables");
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    return;
  }

  // Reuse existing connection in serverless / Lambda environments
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB connected -> ${mongoose.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw err;
  }
}

module.exports = connectDB;
