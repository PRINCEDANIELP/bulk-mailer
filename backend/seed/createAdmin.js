require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

(async () => {
  await connectDB();

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "changeme123";

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log(`Admin "${username}" already exists. Nothing to do.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({ username, passwordHash });

  console.log(`Admin created -> username: "${username}", password: "${password}"`);
  console.log("You can log in with these on the frontend login page.");
  process.exit(0);
})().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
