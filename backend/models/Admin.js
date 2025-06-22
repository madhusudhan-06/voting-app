const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the Admin schema
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Pre-save middleware to hash the password before saving
adminSchema.pre("save", async function (next) {
  try {
    // Check if the password field is modified
    if (!this.isModified("password")) return next();

    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Model definition
const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
