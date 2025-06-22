const express = require("express");
const router = express.Router();
const { verifyFace,checkDuplicateFace} = require("../controllers/faceRecognitionController");

router.post("/verify-face", verifyFace);
router.post("/check-face", checkDuplicateFace);
  
module.exports = router;