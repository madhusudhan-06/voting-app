import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Approved.css"; 

function Approved() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const checkApprovalStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");
      
      if (!token || !userEmail) {
        setMessage("User details missing. Please log in again.");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/auth/user-status", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { approved } = response.data;

      if (approved) {
        localStorage.setItem("userEmail", userEmail);
        navigate("/voting");
      } else {
        setMessage("You have not been approved yet. Generally, you will be approved at least 6 hours before the start of the election. If you are not approved by then, please contact the admin");
      }
    } catch (error) {
      console.error("Error checking approval status:", error);
      setMessage(error.response?.data?.message || "Error checking approval status.");
    }
  };

  return (
    <div className="approved-container">
      <h2 className="approved-title">Approval Status</h2>
      <button 
        className="approved-button" 
        onClick={checkApprovalStatus}
      >
        Check Approval Status
      </button>
      {message && (
        <p className={`message ${message.includes("approved") ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Approved;