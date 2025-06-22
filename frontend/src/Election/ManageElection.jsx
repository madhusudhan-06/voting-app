import { useNavigate } from "react-router-dom";
import "./ManageElection.css"; 

const ManageElection = () => {
  const navigate = useNavigate();

  const handleCreateElectionClick = () => {
    navigate("/create-election");
  };

  const handleViewPastElectionsClick = () => {
    navigate("/past-election");
  };

  const handleApprovals = () => {
    navigate("/approval");
  };

  return (
    <div className="manage-election-container">
      <h1 className="manage-election-title">Election Management</h1>
      
      <div className="manage-election-buttons">
        <button 
          className="election-button create-election" 
          onClick={handleCreateElectionClick}
        >
          Create Election
        </button>
        
        <button 
          className="election-button view-elections" 
          onClick={handleViewPastElectionsClick}
        >
          View Elections
        </button>
        
        <button 
          className="election-button approvals-button" 
          onClick={handleApprovals}
        >
          Approvals
        </button>
      </div>
    </div>
  );
};

export default ManageElection;