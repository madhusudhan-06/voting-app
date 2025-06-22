import  { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateElection.css";

const CreateElection = () => {
  const [electionData, setElectionData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    candidates: [{ name: "", logoImage: "" }],
    notification: "",
  });

  const navigate = useNavigate();

  const handleElectionChange = (e) => {
    const { name, value } = e.target;
    setElectionData((prev) => {
      const updated = { ...prev, [name]: value };
      updated.notification = `📅 Election "${updated.name}" has been scheduled!
         🗓️ Voting Period: ${new Date(updated.startDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })} to ${new Date(updated.endDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        })}`;
      return updated;
    });
  };

  const handleCandidateChange = (index, field, value) => {
    const updatedCandidates = [...electionData.candidates];
    updatedCandidates[index][field] = value;
    setElectionData({ ...electionData, candidates: updatedCandidates });
  };

  const handleLogoUpload = (index, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleCandidateChange(index, "logoImage", reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const addCandidate = () => {
    setElectionData((prev) => ({
      ...prev,
      candidates: [...prev.candidates, { name: "", logoImage: "" }],
    }));
  };

  const removeCandidate = (index) => {
    const updated = [...electionData.candidates];
    updated.splice(index, 1);
    setElectionData({ ...electionData, candidates: updated });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("User not authenticated. Please log in.");
    return;
  }

  // Validation: Ensure all candidate names and logos are provided
  if (electionData.candidates.some(c => !c.name || !c.logoImage)) {
    alert("Each candidate must have a name and a logo.");
    return;
  }

  try {
    const formattedData = {
      name: electionData.name,
      startDate: new Date(electionData.startDate),
      endDate: new Date(electionData.endDate),
      notification: electionData.notification,
      candidates: electionData.candidates.map(candidate => ({
        name: candidate.name,
        logo: candidate.logoImage  // Already in base64
      }))
    };

    const response = await axios.post(
      "http://localhost:5000/api/elections/create-election", 
      formattedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert(response.data.message);
    navigate("/past-election");
  } catch (error) {
    console.error("Error creating election:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Error creating election.");
  }
};


  return (
    <div className="create-election-container">
      <h1 className="create-election-title">Enter Election Information</h1>
      <form className="create-election-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Election Name:</label>
          <input
            type="text"
            name="name"
            value={electionData.name}
            onChange={handleElectionChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Start Date and Time:</label>
          <input
            type="datetime-local"
            name="startDate"
            value={electionData.startDate}
            onChange={handleElectionChange}
            required
          />
        </div>

        <div className="form-group">
          <label>End Date and Time:</label>
          <input
            type="datetime-local"
            name="endDate"
            value={electionData.endDate}
            onChange={handleElectionChange}
            required
          />
        </div>

        <h3>Candidates:</h3>
        {electionData.candidates.map((candidate, index) => (
          <div key={index} className="form-group candidate-group">
            <input
              type="text"
              placeholder={`Candidate ${index + 1} Name`}
              value={candidate.name}
              onChange={(e) =>
                handleCandidateChange(index, "name", e.target.value)
              }
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleLogoUpload(index, e.target.files[0])
              }
              required
            />
            {candidate.logoImage && (
              <img
                src={candidate.logoImage}
                alt="preview"
                width="50"
                height="50"
              />
            )}
            {electionData.candidates.length > 1 && (
              <button type="button" onClick={() => removeCandidate(index)}>Remove Candidate ❌</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addCandidate}>
          ➕ Add Candidate
        </button>

        <button className="create-button" type="submit">
          Create Election
        </button>
      </form>
    </div>
  );
};

export default CreateElection;
