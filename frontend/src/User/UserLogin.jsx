import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserLogin.css"; 

const UserLogin = () => {
  const [form, setForm] = useState({ email: "" });
  const [otpForm, setOtpForm] = useState({ email: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();
    const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    setOtpForm({ ...otpForm, [e.target.name]: e.target.value });
  };

  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/generate-otp", {
        email: form.email,
      });
      setMessage(response.data.message || "OTP sent to your email.");
      setToken(response.data.token); // Save the OTP token
      setOtpSent(true); // Show the OTP input field
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error generating OTP.";
      setMessage(errorMsg);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    console.log("OTP sent to backend:", otpForm.otp, "Type:", typeof otpForm.otp);
  
    try {
      const verifyResponse = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        token,
        otp: otpForm.otp,
      });
  
      if (verifyResponse.status === 200) {
        // OTP verified successfully, proceed with registration
        await handleLogin();
      } else {
        setMessage("OTP verification failed. Please check your OTP.");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "An error occurred during OTP verification.";
      setMessage(errorMsg);
    }
  };

  const handleLogin = async () => {
    try {
      const loginResponse = await axios.post("http://localhost:5000/api/auth/user-login", {
        email: form.email, // Ensure email is provided in the form
      });
  
      if (loginResponse.status === 200) {
        const token = loginResponse.data.token;
        const userEmail = form.email;  // Extract email
        localStorage.setItem("token", token);
        localStorage.setItem("userEmail", userEmail);

        console.log("Token saved:", token);
        console.log("User Email saved:", userEmail);
        // Login successful
        setMessage(loginResponse.data.message || "Successfully Login.");
        navigate("/proceed-to-vote"); // Navigate to login page after success
      } else {
        setMessage("Login failed. Please try again.");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "An error occurred during login.";
      setMessage(errorMsg);
    }
  };
  

 

  return (
    <div className="user-login-container">
      <h2 className="user-login-title">User Login</h2>
      
      {!otpSent ? (
        <form className="user-login-form" onSubmit={handleGenerateOtp}>
          <div className="form-group">
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <button className="user-login-button" type="submit">Send OTP</button>
        </form>
      ) : (
        <form className="user-login-form" onSubmit={handleVerifyOtp}>
          <div className="form-group">
            <input
              name="otp"
              placeholder="Enter OTP"
              value={otpForm.otp}
              onChange={handleOtpChange}
              required
            />
          </div>
          <button className="user-login-button otp-button" type="submit">Verify OTP</button>
        </form>
      )}
      
      {message && (
        <p className={`message ${message.includes("success") ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default UserLogin;