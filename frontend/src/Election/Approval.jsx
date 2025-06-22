import { useEffect, useState } from "react";
import axios from "axios";
import "./Approval.css";

const Approval = () => {
  const [voters, setVoters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const votersResponse = await axios.get("http://localhost:5000/api/elections/voters");
        setVoters(votersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleApproval = async (id, name) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You are not authenticated. Please log in.");
        return;
      }

      await axios.put(
        `http://localhost:5000/api/elections/voters/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`voter ${name} approved successfully.`);

      window.location.reload();
    } catch (error) {
      console.error("Error approving:", error);
      alert("Error approving.");
    }
  };

  const handleRejection = async ( id, name) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You are not authenticated. Please log in.");
        return;
      }

      await axios.delete(`http://localhost:5000/api/elections/voters/${id}/reject`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`voter ${name} rejected successfully.`);

      window.location.reload();
    } catch (error) {
      console.error("Error rejecting:", error);
      alert("Error rejecting.");
    }
  };

  return (
    <div className="approval-container">
      <h1 className="approval-title">Admin Approval Panel</h1>

      <div className="approval-section">
        <h2 className="section-title">Pending Voter Approvals</h2>
        <div className="approval-list">
          {voters.map((voter) => (
            <div className="approval-item" key={voter._id}>
              <div className="approval-info">
                <p className="approval-name">{voter.name}</p>
                <p className="approval-email">{voter.email}</p>
              </div>
              <div className="approval-actions">
                <button
                  className="approve-button"
                  onClick={() => handleApproval(voter._id, voter.name)}
                >
                  Approve
                </button>
                <button
                  className="reject-button"
                  onClick={() => handleRejection(voter._id, voter.name)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Approval;