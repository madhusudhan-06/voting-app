const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  walletAddress: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  approved: { type: Boolean, default: false }, // Approval status
  faceImagePublicId: { type: String, required: true }, // Stores Cloudinary image URL
  faceEmbedding: { type: [Number], required: true }, // Array of floats representing the face embedding
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);














