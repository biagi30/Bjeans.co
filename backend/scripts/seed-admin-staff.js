require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { User } = require("../src/models");

async function seedUsers() {
  const adminEmail = "admin@bjeans.co";
  const adminPassword = "Admin123!";
  const staffEmail = "staff@bjeans.co";
  const staffPassword = "Staff123!";

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  });

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const staffHash = await bcrypt.hash(staffPassword, 10);

  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      name: "Admin BJeans",
      email: adminEmail,
      password: adminHash,
      role: "admin"
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await User.findOneAndUpdate(
    { email: staffEmail },
    {
      name: "Staff BJeans",
      email: staffEmail,
      password: staffHash,
      role: "staff"
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("Seeded admin/staff users:");
  console.log(`- ${adminEmail} / ${adminPassword}`);
  console.log(`- ${staffEmail} / ${staffPassword}`);

  await mongoose.connection.close();
}

seedUsers().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
