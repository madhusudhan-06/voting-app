const express = require("express");
const router = express.Router();
const { notifyVoters } = require('../utils/mailer');
const { authenticate, authorizeAdmin } = require("../middlewares/authMiddleware"); // Import middlewares
const {
  createElection,
  approveVoter,
  rejectVoter,
  getUnapprovedVoters,
  getAllElections,
  startElection,
  endElection,
  electionStatus,
  electionWinner,
  getContractAddress,
  getOngoingElection,
  getEndDate,
  getStartDate,
  checkStarted,
  getNotifications
} = require("../controllers/electionController");

// Routes with role-based access control
router.get("/voters", getUnapprovedVoters);
router.get("/electionlist", getAllElections);
router.get("/:id/current-status", electionStatus);
router.get("/:id/get-contract-address", getContractAddress);
router.get("/:id/get-start-date", getStartDate);
router.get("/:id/get-end-date", getEndDate);
router.get("/:id/check-started", checkStarted);
router.get("/get-ongoing-election", getOngoingElection);
router.post("/notify-voters", notifyVoters);


router.post("/create-election", authenticate, authorizeAdmin, createElection);
router.put("/voters/:id/approve", authenticate, authorizeAdmin, approveVoter);
router.delete("/voters/:id/reject", authenticate, authorizeAdmin, rejectVoter);


router.put("/:id/start-election", startElection);
router.put("/:id/end-election", endElection);

router.put("/:id/add-winner", electionWinner);

router.get("/notifications", getNotifications);

module.exports = router;
