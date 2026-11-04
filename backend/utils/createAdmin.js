const User = require("../models/User");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
  try {
    const adminName = process.env.ADMIN_NAME || "Northstar Admin";
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log(
        "Admin credentials are missing in the .env file"
      );

      return;
    }

    const normalizedEmail = adminEmail.toLowerCase().trim();

    const existingAdmin = await User.findOne({
      email: normalizedEmail,
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      console.log("Admin Email:", existingAdmin.email);

      return;
    }

    
    const hashedPassword = await bcrypt.hash(
      adminPassword,
      12
    );


    const admin = await User.create({
      name: adminName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    console.log("----------------------------------");
    console.log("Admin account created successfully");
    console.log("Admin Name:", admin.name);
    console.log("Admin Email:", admin.email);
    console.log("Admin Role:", admin.role);
    console.log("----------------------------------");

  } catch (error) {
    console.error(
      "Admin creation error:",
      error.message
    );


    if (error.code === 11000) {
      console.log("Admin account already exists.");
      return;
    }

    throw error;
  }
};

module.exports = createAdmin;