import  { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserRegister.css";

const UserRegister = () => {
  const [form, setForm] = useState({ name: "", walletAddress: "", email: "" });
  const [errors, setErrors] = useState({ email: "" });
  const [otp, setOtp] = useState("");
  const [otpFieldVisible, setOtpFieldVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [webcams, setWebcams] = useState([]);
  const [selectedWebcam, setSelectedWebcam] = useState("");
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [livenessPrompt, setLivenessPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [faceEmbedding, setFaceEmbedding] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const prompts = ["Please blink", "Turn your head slightly", "Smile gently"];

  useEffect(() => {
    async function getWebcams() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setWebcams(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedWebcam(videoDevices[0].deviceId);
      }
    }
    getWebcams();
  }, []);

  const startWebcam = async () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedWebcam ? { exact: selectedWebcam } : undefined },
      });
      videoRef.current.srcObject = newStream;
      setStream(newStream);
    } catch (error) {
      console.error("Error accessing webcam:", error);
      setMessage("Webcam access failed. Please try again.");
    }
  };

  const captureImage = async (promptUsed) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL("image/png");
    setCapturedImage(base64Image); // Set captured image
  
    try {
      const response = await axios.post("http://127.0.0.1:5001/compare-faces", {
        image: base64Image,
        prompt: promptUsed,
        detectOnly: true,
      });
  
      const data = response.data;
      // console.log("Liveness API response:", data); // Debug the response
  
      if (data.faceDetected && data.success) {
        // console.log("yes both are true")
        setMessage("✅ Liveness confirmed. You may now proceed.");
        // await validateFacePresence(promptUsed);
      } else {
        setMessage(data.message || "❌ Liveness check failed. Please try again.");
        setCapturedImage(null); // Reset image if liveness check failed
      }
    } catch (error) {
      console.error("Liveness check error:", error); // Debug error
      setMessage("❌ Liveness check failed. Please try again due to some error");
      setCapturedImage(null);
    }
  };
  
  

  const prepareForLivenessCheck = async () => {
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    setLivenessPrompt(prompt);
    setMessage(prompt);

    await new Promise((res) => setTimeout(res, 3000));
    await captureImage(prompt);
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validateFacePresence = async (promptUsed) => {
    try {
      const response = await axios.post("http://127.0.0.1:5001/compare-faces", {
        image: capturedImage,
        detectOnly: true,
        prompt: promptUsed,
      });
      const data = response.data;
      // console.log("Face detection response:", data); // Debug the response
  
      if (!data.faceDetected) {
        setMessage(data.message || "No clear face detected in the image. Please retake.");
        return false;
      }
      setMessage(data.message || "Face detected successfully.");
      return true;
    } catch (error) {
      console.error("Face detection error:", error); // Debug error
      setMessage(error.response?.data?.message || "Face detection failed. Try again.");
      return false;
    }
  };

  const checkFaceExists = async(capturedImage) =>{
    try {
      const response = await axios.post("http://127.0.0.1:5001/check-face-duplicate", {
        image: capturedImage,
      });
  
      const data = response.data;
      if (data.exists) {
        setMessage(" This face already exists in the system.");
        // console.log("This face already exists in the system.");
        return false;
      }
  
      setMessage(data.message || "✅ Face is unique. Proceeding...");
      // console.log("face is unique");
      setFaceEmbedding(data.embedding);
      return true;
    } catch (error) {
      console.error("Face check error:", error);
      setMessage(" Error while verifying face uniqueness.");
      return false;
    }
  }
  

  const checkUserExists = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/check-user", {
        email: form.email,
        walletAddress: form.walletAddress,
      });
      return response.status === 200;
    } catch (error) {
      setMessage(error.response?.data?.message || "Error checking user existence.");
      return false;
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    setErrors({ ...errors, email: "" });
    setLoading(true);

    if (!validateEmail(form.email)) {
      setErrors({ ...errors, email: "Invalid email address" });
      setLoading(false);
      return;
    }

    const faceOk = await validateFacePresence(livenessPrompt);
    if (!faceOk) {
      setLoading(false);
      return;
    }

    const faceExists = await checkFaceExists(capturedImage) ;
    if(!faceExists){
      setLoading(false);
      return;
    }

    const userExists = await checkUserExists();
    if (!userExists) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/generate-otp", {
        email: form.email,
      });
      setMessage(response.data.message || "OTP sent to your email.");
      setToken(response.data.token);
      setOtpFieldVisible(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error generating OTP.");
    }

    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const verifyResponse = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        token,
        otp,
      });

      if (verifyResponse.status === 200) {
        setMessage("✅ OTP verified. Registering user...");
        await handleRegister();
      } else {
        setMessage("❌ OTP verification failed. Please check your OTP.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error during OTP verification.");
    }

    setLoading(false);
  };

  const handleRegister = async () => {
    try {
      const payload = {
        name: form.name,
        email: form.email,
        walletAddress: form.walletAddress,
        faceImage: capturedImage,
        faceEmbedding: faceEmbedding,
      };

      const registerResponse = await axios.post("http://localhost:5000/api/auth/user-register", payload);
      if (registerResponse.status === 201) {
        setMessage(registerResponse.data.message || "🎉 Registered successfully!");
        navigate("/user-login");
      } else {
        setMessage(" Registration failed. Please try again.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error during registration.");
    }
  };

  return (
    <div className="user-register-wrapper">
      <div className="user-register-container">
        <h2 className="user-register-title">User Registration</h2>

        {!otpFieldVisible ? (
          <form className="user-register-form" onSubmit={handleGenerateOtp}>
            <div className="form-group">
              <label>Name:</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Wallet Address:</label>
              <input name="walletAddress" value={form.walletAddress} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
              {errors.email && <div className="message error">{errors.email}</div>}
            </div>

            <div className="webcam-section">
              <label>Select Camera:</label>
              <select className="webcam-select" value={selectedWebcam} onChange={(e) => setSelectedWebcam(e.target.value)} required>
                <option value="">Select a Camera</option>
                {webcams.map((webcam) => (
                  <option key={webcam.deviceId} value={webcam.deviceId}>
                    {webcam.label || `Camera ${webcam.deviceId}`}
                  </option>
                ))}
              </select>

              <button type="button" className="webcam-button" onClick={startWebcam}>Start Webcam</button>

              <div className="video-container">
                <video ref={videoRef} autoPlay width="320" height="240" />
              </div>

              <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }}></canvas>

              <button type="button" className="webcam-button verify-button" onClick={prepareForLivenessCheck}>
                Capture with Liveness Check
              </button>

              {capturedImage ? (
                <img className="captured-image" src={capturedImage} alt="Captured" />
              ) : (
                <p className="message error">* Captured image is required</p>
              )}
            </div>

            <button type="submit" className="register-button" disabled={!capturedImage || loading}>
              {loading ? "Processing..." : "Register"}
            </button>
          </form>
        ) : (
          <form className="user-register-form" onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label>Enter OTP:</label>
              <input name="otp" value={otp} onChange={handleOtpChange} required />
            </div>
            <button type="submit" className="register-button verify-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {message && (
          <div className={`message ${message.startsWith("✅") ? "success" : message.startsWith("❌") ? "error" : ""}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRegister;
