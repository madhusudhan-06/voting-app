const express = require("express");

const { userRegister, userLogin,adminRegister,adminLogin,verifyOtp,generateOtp,checkUser,userStatus,getWalletAddress,getWalletAddressByEmail,getUserFacePublicId,userApprove} = require("../controllers/authController");
const {authenticate} = require("../middlewares/authMiddleware");
const router = express.Router();



//user
router.post("/user-login", userLogin);
router.post("/user-register",userRegister);
router.post("/check-user", checkUser);
router.get("/user-status",authenticate,userStatus);
router.get("/user-approve",authenticate,userApprove);
router.get("/get-wallet-address",getWalletAddress);
router.get("/get-wallet-address-by-email/:email",getWalletAddressByEmail);
router.get("/get-user-face-publicid/:email",getUserFacePublicId);

//admin
router.post("/admin-register", adminRegister);
router.post("/admin-login", adminLogin);

router.post("/verify-otp", verifyOtp);
router.post("/generate-otp",generateOtp);

module.exports = router;