const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Election = require("../models/Election");
const hre = require("hardhat"); 

async function fetchElectionData() {
  try {
    const ongoingElection = await Election.findOne({ ongoing: true }).lean();

    if (!ongoingElection) {
      throw new Error("No ongoing election found");
    }

    // Extract candidate names safely
    const candidateNames = ongoingElection.candidates.map(candidate => {
      if (!candidate?.name) {
        throw new Error(`Candidate missing name: ${JSON.stringify(candidate)}`);
      }
      return candidate.name;
    });

    if (candidateNames.length === 0) {
      throw new Error("No candidates found in election");
    }

    return {
      electionId: ongoingElection._id.toString(),
      candidateNames,
      voteCounts: new Array(candidateNames.length).fill(0)
    };

  } catch (error) {
    console.error("Error processing candidates:", error.message);
    throw error;
  }
}


async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB...");

    const { electionId, candidateNames, voteCounts } = await fetchElectionData();

    if (candidateNames.length === 0) {
      console.log("❌ No candidates found in the database.");
      process.exit(1);
    }

    console.log("📥 Election ID:", electionId);
    console.log("👤 Candidates:", candidateNames);

    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(electionId, candidateNames, voteCounts);

    await voting.deployed();
    console.log(`Contract deployed at: ${voting.address}`);

    // Update the election with the deployed contract address
    await Election.findByIdAndUpdate(electionId, { contract_address: voting.address });
    console.log(`📝 MongoDB updated with contract address: ${voting.address}`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("🚨 Error during contract deployment:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();
