const axios = require("axios");
const User = require("../models/User");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

exports.verifyFace = async (req, res) => {
  try {
    const { new_img, public_id } = req.body;

    if (!new_img || !public_id) {
      return res.status(400).json({
        success: false,
        message: "Both new_img (base64) and public_id are required"
      });
    }

    const base64Regex = /^data:image\/([a-zA-Z]*);base64,([^\"]*)$/;
    if (!base64Regex.test(new_img)) {
      return res.status(400).json({
        success: false,
        message: "new_img must be a valid base64 image string"
      });
    }

    const old_img_url = cloudinary.url(public_id, {
      quality: "auto:best",
      fetch_format: "auto",
      secure: true,
      sign_url: true
    });

    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:5001";
    console.log(old_img_url);
    const response = await axios.post(`${pythonServiceUrl}/compare-faces`, {
      image1: old_img_url,
      image2: new_img
    }, {
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.error) {
      return res.status(400).json({
        success: false,
        message: response.data.error,
        technicalDetails: response.data.technicalDetails || null
      });
    }

    return res.status(200).json({
      success: true,
      verified: response.data.verified,
      message:response.data.message,
      confidence: response.data.confidence,
      model: response.data.model || "Facenet"
    });

  } catch (error) {
    console.error("Face verification error:", error);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message: "Face verification service timeout"
      });
    }

    if (error.response) {
      // 🌟 This is the important fix!
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data?.error || "Face verification service error",
        technicalDetails: error.response.data?.technicalDetails || null
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error during face verification"
    });
  }
};

exports.checkDuplicateFace = async (req, res) => {
  const { embedding } = req.body;
  if (!embedding || !Array.isArray(embedding)) {
    return res.status(400).json({ exists: false, message: "Invalid embedding" });
  }

  try {
    const allUsers = await User.find({}, { faceEmbedding: 1 }); // Assuming you store embeddings in DB

    const cosineSimilarity = (vec1, vec2) => {
      const dot = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
      const normA = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
      const normB = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
      return dot / (normA * normB);
    };

    const threshold = 0.7;

    for (const user of allUsers) {
      const similarity = cosineSimilarity(embedding, user.faceEmbedding);
      if (similarity >= threshold) {
        return res.json({ exists: true, message: "Face already registered" });
      }
    }

    res.json({ exists: false, message: "Face is unique" });
  } catch (err) {
    console.error("Error checking face uniqueness:", err);
    res.status(500).json({ exists: false, message: "Internal error" });
  }
};
