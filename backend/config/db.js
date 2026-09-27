const mongoose = require("mongoose");
const dns = require("dns");

// Ensure MongoDB Atlas SRV records resolve smoothly across Windows / varied network configurations
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // fallback gracefully if environment restricts custom DNS servers
}

const DEFAULT_MONGO_URI =
  "mongodb+srv://princebulk:081104@cluster0.p7pt0ci.mongodb.net/bulkmail?appName=Cluster0";

async function connectDB() {
  const uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

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
