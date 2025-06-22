const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    start: { type: Boolean, default: false, required: true },
    end: { type: Boolean, default: false, required: true },
    ongoing: { type: Boolean, default: true, required: true },
    winner: { type: [String], default: [] },
    contract_address: { type: String, default: null },
    notification: String,

    candidates: [
      {
        name: { type: String, required: true },
        logoUrl: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

const Election = mongoose.model("Election", electionSchema);
module.exports = Election;
