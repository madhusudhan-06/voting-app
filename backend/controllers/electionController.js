const Election = require("../models/Election");
const User = require("../models/User");
const { exec } = require("child_process");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

exports.createElection = async (req, res) => {
  try {
    const { name, startDate, endDate, candidates, notification } = req.body;

    console.log("Received data:", req.body);

    // Validate required fields
    if (!name || !startDate || !endDate || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ message: "All fields are required, and there must be at least one candidate." });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "Start date must be before end date." });
    }

    const ongoingElection = await Election.findOne({ ongoing: true });
    if (ongoingElection) {
      return res.status(400).json({ message: "An election is already ongoing." });
    }

    const existingElection = await Election.findOne({ name });
    if (existingElection) {
      return res.status(400).json({ message: "An election with this name already exists." });
    }

    // Upload each candidate logo to Cloudinary
    const updatedCandidates = [];

    for (const candidate of candidates) {
      if (!candidate.logo || !candidate.logo.startsWith("data:image/")) {
        return res.status(400).json({ message: `Invalid logo for candidate "${candidate.name}".` });
      }

      const uploadedLogo = await cloudinary.uploader.upload(candidate.logo, {
        folder: "candidate_logos",
      });

      updatedCandidates.push({
        name: candidate.name,
        logoUrl: uploadedLogo.secure_url,
      });
    }


    // Create new Election document
    const newElection = new Election({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      start: false,
      end: false,
      notification,
      candidates: updatedCandidates
    });


    await newElection.save();

    return res.status(201).json({
      message: "Election created successfully.",
      election: newElection,
    });

  } catch (error) {
    console.error("Error creating election:", error);
    return res.status(500).json({ message: error.message || "Error creating election." });
  }
};


exports.approveVoter = async (req, res) => {
  const { id } = req.params; // Voter ID

  // Validate the ID parameter
  if (!id || id.trim() === "") {
    return res.status(400).json({ message: "Invalid voter ID provided." });
  }

  try {
    // Find and update the voter
    const voter = await User.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true } // Returns the updated document
    );

    // Check if voter exists
    if (!voter) {
      return res.status(404).json({ message: "Voter not found." });
    }

    // Send success response
    res.status(200).json({
      message: "Voter approved successfully.",
      voter,
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error approving voter:", error);

    // Send error response
    res.status(500).json({
      message: "Error approving voter. Please try again later.",
      error: error.message || error,
    });
  }
};


// Reject a voter
exports.rejectVoter = async (req, res) => {
  const { id } = req.params; // Voter ID
  try {
    const voter = await User.findByIdAndDelete(id);
    if (!voter) {
      return res.status(404).json({ message: "Voter not found." });
    }
    res.status(200).json({ message: "Voter rejected and deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting voter.", error });
  }
};

exports.getUnapprovedVoters = async (req, res) => {
  try {
    const voters = await User.find({ approved: false });
    res.status(200).json(voters);
  } catch (error) {
    res.status(500).json({ message: "Error fetching unapproved voters.", error });
  }
};


// Fetch all elections
exports.getAllElections = async (req, res) => {
  try {
    const elections = await Election.find({});
    res.status(200).json(elections);
  } catch (error) {
    res.status(500).json({ message: "Error fetching elections.", error });
  }
};

exports.startElection = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the election from the database
    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: "Election not found." });
    }

    // Check if the election has already started
    if (election.start) {
      return res.status(400).json({ message: "Election has already started." });
    }

    console.log("Starting election and deploying contract...");

    // Deploy the smart contract using Hardhat
    exec("cd ../hardhat && npx hardhat run scripts/deploy.js --network avalanche", (error, stdout, stderr) => {

      if (error) {
        console.error(`Error deploying contract: ${error.message}`);
        return res.status(500).json({ message: "Smart contract deployment failed." });
      }
      if (stderr) {
        console.error(`Deployment stderr: ${stderr}`);
      }

      console.log("Deployment Output:", stdout);

      // Updated regex to match "Contract deployed at: 0x..."
      const match = stdout.match(/Contract deployed at: (0x[a-fA-F0-9]{40})/);
      if (!match) {
        return res.status(500).json({ message: "Could not extract contract address from deployment output." });
      }

      const contractAddress = match[1];
      console.log(`Extracted Contract Address: ${contractAddress}`);

      // Update the election in the database
      Election.findByIdAndUpdate(
        id,
        { start: true, ongoing: true, contract_address: contractAddress },
        { new: true }
      )
        .then(updatedElection => {
          res.status(200).json({ message: "Election started successfully.", election: updatedElection });
        })
        .catch(err => {
          console.error("Database update error:", err);
          res.status(500).json({ message: "Failed to update election data." });
        });
    });

  } catch (error) {
    console.error("Error starting election:", error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};


//end election
exports.endElection = async (req, res) => {
  try {
    // Find the election first to check if it already started
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    if (election.end) {
      return res.status(400).json({ message: "Election has already ended." });
    }

    // Update the election's start field
    election.end = true;
    election.ongoing = false;
    await election.save();

    res.status(200).json({ message: "Election ended successfully", election });
  } catch (error) {
    res.status(500).json({ message: "Error ending election", error: error.message });
  }
};


// check if start field of election DB is on or not to enable voting
exports.electionStatus = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    res.status(200).json({ start: election.start, end: election.end });
  } catch (error) {
    res.status(500).json({ message: "Error fetching election status", error });
  }
};

exports.getOngoingElection = async (req, res) => {
  try {
    const currentElection = await Election.findOne({ ongoing: true }, "_id candidates"); // Fetch both _id and candidates
    if (!currentElection) {
      return res.status(404).json({ message: "No active election found" });
    }
    res.status(200).json({
      _id: currentElection._id,
      candidates: currentElection.candidates
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching current election", error });
  }
};


exports.electionWinner = async (req, res) => {
  const { id } = req.params;
  const { winner, ongoing } = req.body;

  if (!winner || (Array.isArray(winner) && winner.length === 0)) {
    return res.status(400).json({ message: "Winner is required." });
  }

  try {
    const updatedElection = await Election.findByIdAndUpdate(
      id,
      {
        winner: Array.isArray(winner) ? winner : [winner],
        ongoing
      },
      { new: true, runValidators: true }  // Ensures data integrity
    );

    if (!updatedElection) {
      return res.status(404).json({ message: "Election not found." });
    }

    res.status(200).json(updatedElection);
  } catch (error) {
    res.status(500).json({ message: "Error updating election.", error: error.message });
  }
};


exports.getContractAddress = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Received electionId:", id); // Debugging log

    // Fetch the election from the database
    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: "Election not found." });
    }

    if (!election.contract_address) {
      return res.status(400).json({ message: "Contract address not available for this election." });
    }

    res.status(200).json({ contractAddress: election.contract_address });
  } catch (error) {
    console.error("Error fetching contract address:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getStartDate = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received electionId:", id);

    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: "Election not found." });
    }

    res.status(200).json({ startDate: election.startDate }); // 🎯 Send startDate only!
  } catch (error) {
    console.error("Error fetching start date:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


exports.getEndDate = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received electionId:", id);

    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: "Election not found." });
    }

    res.status(200).json({ endDate: election.endDate }); // 🎯 Send startDate only!
  } catch (error) {
    console.error("Error fetching start date:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


exports.checkStarted = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received electionId:", id);

    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: "Election not found." });
    }

    if (!election.start) {
      return res.status(400).json({ message: "Election has not started yet." });
    }

    res.status(200).json({ endDate: election.endDate });
  } catch (error) {
    console.error("Error checking start status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Election.find({}, 'notification') 
      .sort({ startDate: -1 })  // Sort by date in descending order
      .exec(); // Get notifications sorted by date (latest first)
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};
