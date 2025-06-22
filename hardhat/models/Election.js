const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  start: { 
    type: Boolean,
    required: true,
    default: false,
  },
  end: { 
    type: Boolean,
    required: true,
    default: false,
  },
  candidates: {
    type: [String], // Array of candidate names
    required: true, // Ensure candidates are provided
  },
  ongoing: {
    type: Boolean,
    required: true,
    default: false, // Default to false, will be true when election is active
  },
  winner: {
    type: String,
    default: null, // Winner will be set later
  },
});

// Create the Election model
const Election = mongoose.model("Election", electionSchema);

module.exports = Election;
