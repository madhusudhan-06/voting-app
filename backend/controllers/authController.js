const { sendOTP } = require("../utils/mailer");
const User = require("../models/User");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; // Replace with an env variable
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.generateOtp = async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);
  const token = jwt.sign({ email, otp }, process.env.JWT_SECRET, { expiresIn: "10m" });

  sendOTP(email, otp);

  res.status(200).json({ message: "OTP sent to your email.", token });
};

exports.verifyOtp = async (req, res) => {
  const { token, otp } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Convert both OTP values to strings and trim them
    const decodedOtp = decoded.otp.toString().trim();
    const receivedOtp = otp.trim();

    // Debugging log for verification
    console.log("Decoded OTP:", decodedOtp, "Type:", typeof decodedOtp, "Length:", decodedOtp.length);
    console.log("Received OTP:", receivedOtp, "Type:", typeof receivedOtp, "Length:", receivedOtp.length);
    console.log(decodedOtp === receivedOtp);

    // Check if the provided OTP matches
    const isOtpValid = decodedOtp === receivedOtp;
    if (decodedOtp === receivedOtp) {
      return res.status(200).json({ message: "OTP verified successfully!" });

    }

    // OTP is invalid, proceed with further actions
    return res.status(400).json({ message: "Invalid OTP" });


  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "OTP expired. Please generate a new one." });
    }
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.userRegister = async (req, res) => {
  try {
    const { name, email, walletAddress, faceImage, faceEmbedding } = req.body;

    // Validate required fields
    if (!name || !email || !walletAddress || !faceImage) {
      return res.status(400).json({ message: "Name, email, walletAddress, and faceImage are required." });
    }

    // Validate the faceImage (ensure it's a valid Base64 string)
    if (!faceImage.startsWith("data:image/")) {
      return res.status(400).json({ message: "Invalid image format. Please provide a valid Base64 image." });
    }

    // Upload Base64 image to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(faceImage, {
      folder: 'user_uploads',
    });

    // Verify the Cloudinary response
    if (!uploadedImage || !uploadedImage.public_id) {
      throw new Error("Failed to upload image to Cloudinary.");
    }

    // Log the secure_url for debugging
    console.log("Cloudinary secure_url:", uploadedImage.secure_url);
    console.log("Cloudinary public_id:", uploadedImage.public_id);

    // Save user data in MongoDB
    const newUser = new User({
      name,
      email,
      walletAddress,
      faceImagePublicId: uploadedImage.public_id,
      faceEmbedding// Store Cloudinary image URL
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully!", user: newUser });
  } catch (error) {
    console.error("Registration Error:", error);

    // Handle Cloudinary errors
    if (error.message.includes("Cloudinary")) {
      return res.status(500).json({ message: "Failed to upload image to Cloudinary. Please try again." });
    }

    // Handle duplicate key errors (e.g., duplicate email)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email or walletAddress already exists." });
    }

    res.status(500).json({ message: "Server error. Please try again." });
  }
};

exports.userLogin = async (req, res) => {
  const { email } = req.body;

  try {
    // Find candidate by email (assuming email is unique)
    const user = await User.findOne({ email: email.toLowerCase() });

    // If user doesn't exist, return error
    if (!user) {
      return res.status(404).json({ message: "User not found, please register first." });
    }

    // Generate JWT token for candidate
    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Return success response with the token
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.checkUser = async (req, res) => {
  const { email, walletAddress } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [
        { email },
        { walletAddress }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or wallet address already exists. Please log in instead."
      });
    }

    return res.status(200).json({
      message: "User does not exist. You can generate OTP."
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

exports.userStatus = async (req, res) => {
  try {
    // Validate request
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "Invalid request. User not authenticated." });
    }

    const userId = req.user.id; // Get user ID from JWT token

    // Fetch user details from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Respond with approval status
    return res.status(200).json({
      approved: user.approved,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Error in userStatus:", error.message, error.stack);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.userApprove = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ approved: user.approved }); // assuming user model has 'approved' field
  } catch (err) {
    console.error("Error fetching user approval status:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getWalletAddress = async (req, res) => {
  try {
    // Assuming the user's ID is stored in the session
    const userId = req.session.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID not provided in session" });
    }

    // Find the user in the database
    const user = await User.findById(userId);
    if (user) {
      return res.json({ walletAddress: user.walletAddress });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user's wallet address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getWalletAddressByEmail = async (req, res) => {
  const { email } = req.params; // Extract email from request parameters

  try {
    const user = await User.findOne({ email }); // Find user by email
    if (user && user.walletAddress) {
      res.json({ walletAddress: user.walletAddress });
    } else {
      res.status(404).json({ message: "Wallet address not found for this user." });
    }
  } catch (error) {
    console.error("Error fetching wallet address:", error);
    res.status(500).json({ message: "Server error while retrieving wallet address." });
  }
};


function getCloudinaryUrl(publicId, cloud_name, format = "png") {
  return `https://res.cloudinary.com/${cloud_name}/image/upload/${publicId}.${format}`;
}


exports.getUserFacePublicId = async (req, res) => {
  const { email } = req.params; // Extract email from request parameters

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (user && user.faceImagePublicId) {
      // Fetch the image URL from Cloudinary using the public ID
      console.log("user found");
      console.log(`user email: ${user.email}`);
      console.log(`user publicid: ${user.faceImagePublicId}`);

      // Replace with your Cloudinary cloud name
      const publicId = user.faceImagePublicId;// Replace with your PublicId
      const imageUrl = getCloudinaryUrl(publicId, process.env.CLOUDINARY_CLOUD_NAME);
      res.json({ publicId });
    } else {
      res.status(404).json({ message: "faceImagePublicId not found for this user." });
    }
  } catch (error) {
    console.error("Error fetching faceImagePublicId or image URL:", error);
    res.status(500).json({ message: "Server error while retrieving faceImagePublicId or image URL." });
  }
};


//admin register
exports.adminRegister = async (req, res) => {
  const { name, password } = req.body;

  // Validate input
  if (!name || !password) {
    return res.status(400).json({ message: "Name and password are required." });
  }

  try {
    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ name: name.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists." });
    }

    // Create and save the admin
    const newAdmin = new Admin({
      name: name.toLowerCase(),
      password, // Password will be hashed automatically by the pre-save middleware
    });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully." });
  } catch (error) {
    console.error("Error during admin registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//admin login
exports.adminLogin = async (req, res) => {
  const { name, password } = req.body;

  try {
    const admin = await Admin.findOne({ name: name.toLowerCase() });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id, role: "admin" }, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};








