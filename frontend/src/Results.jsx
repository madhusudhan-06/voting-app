import  { useEffect, useState } from "react";
import "./Results.css";

const Results = () => {
  const [elections, setElections] = useState([]);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/elections/electionlist");
        const data = await response.json();
        setElections(data);
        setTimeout(() => {
          import("canvas-confetti").then((confetti) => {
            confetti.default({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#6f42c1", "#28a745", "#ffcc00"],
            });
          });
        }, 500);


      } catch (error) {
        console.error("Error fetching elections:", error);
      }
    };

    fetchElections();
  }, []);

  return (
    <div className="results-container" style={{ position: "relative" }}>
      <h1 className="results-title">🎉 Election Results 🎉</h1>
      <table className="results-table">
        <thead>
          <tr>
            <th>Election Name</th>
            <th>Candidates</th>
            <th>Winner</th>
          </tr>
        </thead>
        <tbody>
          {elections.map((election) => (
            <tr key={election._id}>
              <td>{election.name}</td>
              <td>
                <ul className="candidates-list">
                  {election.candidates.map((candidate, idx) => (
                    <li key={idx}>{candidate.name}</li>
                  ))}
                </ul>
              </td>
              <td>
                {election.winner ? (
                  <span className="winner-highlight">{election.winner}</span>
                ) : (
                  <span className="no-winner">Not Announced</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Results;

