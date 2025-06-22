import { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import VotingContractABI from "../artifacts/Voting.json";
import "./PastElection.css"; 

const PastElection = () => {
    const [elections, setElections] = useState([]);
    const [startButton, setStartButton] = useState(false);
    const [endButton, setEndButton] = useState(true);
    const [thewinners, setTheWinners] = useState([]);
    const [contractAddress, setContractAddress] = useState(""); // Store contract address dynamically

    useEffect(() => {
        const fetchData = async () => {
            const electionlist = await axios.get("http://localhost:5000/api/elections/electionlist");
            setElections(electionlist.data);
        };
        fetchData();
    }, []);

    const fetchContractAddress = async (electionId) => {
        if (!electionId) {
            console.error("Election ID is missing when fetching contract address.");
            return null;
        }
        try {
            const response = await axios.get(`http://localhost:5000/api/elections/${electionId}/get-contract-address`);

            if (response.status !== 200 || !response.data.contractAddress) {
                console.error("Failed to fetch contract address.");
                return null;
            }

            console.log("Fetched Contract Address:", response.data.contractAddress);
            setContractAddress(response.data.contractAddress); // Update state
            return response.data.contractAddress; // Return contract address for immediate use
        } catch (error) {
            console.error("Error fetching contract address:", error);
            return null;
        }
    };


    const handleStartElection = async (electionId) => {
        try {
            const { startDate } = (await axios.get(`http://localhost:5000/api/elections/${electionId}/get-start-date`)).data;
            const startDateObj = new Date(startDate);
            const now = new Date();

            if (now < startDateObj) {
                alert(`Too early to start! Election begins at: ${startDateObj.toLocaleString()}`);
                return;
            }
            const response = await axios.put(`http://localhost:5000/api/elections/${electionId}/start-election`, {
                start: true  // Update the start field
            });

            if (response.status === 200) {
                setStartButton(true);  // Optional if you want to track globally
                setEndButton(false);
                console.log("Election started successfully.");

                // Update the local state for elections
                setElections((prevElections) =>
                    prevElections.map((election) =>
                        election._id === electionId
                            ? { ...election, start: true, ongoing: true }
                            : election
                    )
                );

                // Fetch contract address AFTER updating the state
                await fetchContractAddress(electionId);
                const electionDetail = elections.find((election) => 
                    electionId === election._id
                );
                console.log(electionDetail);
                const startMessage = `
Dear User,

Voting for the election "${electionDetail.name}" has officially started! 🎉
Please cast your vote now and have your voice heard. The election will end at ${electionDetail.endDate.toLocaleString()}, so make sure to submit your vote before then!

If you have any questions or need assistance, feel free to reach out.

Best regards,
The VoteEase Team`
                await axios.post("http://localhost:5000/api/elections/notify-voters", {
                    subject: `Election ${electionDetail.name} Started`,
                    message: `${startMessage}`,
                });
                console.log("email sent successfully");
            }

            else {
                console.error("Failed to start the election.");
            }
        } catch (error) {
            console.error("Error starting election:", error.response ? error.response.data : error.message);
        }
    };

    const handleEndElection = async (electionId) => {
        try {
            try {
                await axios.get(`http://localhost:5000/api/elections/${electionId}/check-started`);
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    alert("Election has not started yet!");
                    return;
                } else {
                    console.error("Error checking if election started:", error.message);
                    return;
                }
            }
            const { endDate } = (await axios.get(`http://localhost:5000/api/elections/${electionId}/get-end-date`)).data;
            const endDateObj = new Date(endDate);
            const now = new Date();

            if (now < endDateObj) {
                alert(`Too early to end! Election ends at: ${endDateObj.toLocaleString()}`);
                return;
            }


            // Step 1: Interact with the Smart Contract to End Voting
            if (!window.ethereum) {
                console.error("Ethereum provider not found. Please install MetaMask.");
                return;
            }

            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Initialize provider & signer
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Ensure contract address is fetched


            const fetchedAddress = await fetchContractAddress(electionId);

            if (!fetchedAddress) {
                console.error("Failed to fetch contract address.");
                return;
            }

            console.log(`Fetched address:${fetchedAddress}`);
            setContractAddress(fetchedAddress);
            console.log(`Contract address:${contractAddress}`);


            // Ensure contract address and ABI are defined
            if (!fetchedAddress) {
                console.error("Smart contract configuration is missing.");
                return;
            }

            // Initialize contract with signer
            const votingContract = new ethers.Contract(fetchedAddress, VotingContractABI.abi, signer);

            // ✅ Step 2.1: Ensure only the admin can end the election
            let adminAddress, userAddress;
            try {
                adminAddress = await votingContract.admin();
                userAddress = await signer.getAddress();

                if (userAddress.toLowerCase() !== adminAddress.toLowerCase()) {
                    console.error("Only the admin can end the election.");
                    return; // Stop execution if not admin
                }
            } catch (error) {
                console.error("Failed to verify admin:", error);
                return;
            }

            // Step 3: End Voting on the Blockchain
            try {
                const tx = await votingContract.endVoting();
                await tx.wait();  // Wait for the transaction to be mined
                console.log("Voting ended successfully on the blockchain.");
            } catch (error) {
                console.error("Failed to end voting on the blockchain:", error);
                return;
            }

            // Step 4: Fetch the Winner from the Smart Contract
            var winnerNames;
            try {
                winnerNames = await votingContract.getWinners();

                if (!winnerNames || winnerNames.length === 0) {
                    console.warn("No winner(s) found on the blockchain.Proceeding to put null");

                }
                setTheWinners(winnerNames);
                console.log("Winner fetched from blockchain:", winnerNames);

            } catch (error) {
                console.error("Error fetching winner from blockchain:", error);
                return;
            }

            // Step 5: Update the Election Document in MongoDB
            var updateResponse;
            try {
                updateResponse = await axios.put(`http://localhost:5000/api/elections/${electionId}/add-winner`, {
                    winner: winnerNames,
                    ongoing: false
                });

                if (updateResponse.status === 200) {
                    console.log("Election updated with winner in the database.");

                    // Step 6: Update Local State
                    setElections((prevElections) =>
                        prevElections.map((election) =>
                            election._id === electionId
                                ? { ...election, end: true, winner: winnerNames, ongoing: false }
                                : election
                        )
                    );
                } else {
                    console.error("Failed to update the election with the winner.");
                }
            } catch (error) {
                console.error("Error updating election in the database:", error.response ? error.response.data : error.message);
            }

            // ✅ Step 7: End Election in the Backend (MongoDB)
            console.log("Election ID received:", electionId);
            if (!electionId) {
                console.error("Election ID is undefined. Aborting function.");
                return;
            }

            const response = await axios.put(`http://localhost:5000/api/elections/${electionId}/end-election`, {
                end: true  // Mark the election as ended in the database
            });

            if (response.status !== 200) {
                console.error("Failed to end the election in the database.");
                return;
            }

            console.log("Election ended successfully in the database.");
            const electionDetail = elections.find((election) => 
                    electionId === election._id
            );
            const endMessage = `
Dear User,

We would like to inform you that voting for the election "${electionDetail.name}" has officially concluded.
Thank you for your participation and your valuable contribution. Your voice truly matters in shaping the future, and we appreciate your engagement in this important process.
You can check results on the website.

If you have any questions or need further information, feel free to reach out.

Warm regards,
VoteEase Team`
            await axios.post("http://localhost:5000/api/elections/notify-voters", {
                subject: `Ended Election ${electionDetail.name}`,
                message: `${endMessage}`,
            });
        } catch (error) {
            console.error("Error ending election:", error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="past-election-container">
            <h1 className="past-election-title">Election Management</h1>

            <table className="election-table">
                <thead>
                    <tr>
                        <th>Election Name</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Candidates</th>
                        <th>Start Election</th>
                        <th>End Election</th>
                        <th>Status</th>
                        <th>Winner</th>
                    </tr>
                </thead>
                <tbody>
                    {elections.map((election) => (
                        <tr key={election._id}>
                            <td>{election.name}</td>
                            <td>{new Date(election.startDate).toLocaleDateString()}</td>
                            <td>{new Date(election.endDate).toLocaleDateString()}</td>

                            <td>
                                <ul className="candidate-list">
                                    {election.candidates.map((candidate, index) => (
                                        <li key={index}>{candidate.name}</li>
                                    ))}
                                </ul>
                            </td>

                            <td>
                                <button
                                    className={`action-button start-button`}
                                    onClick={() => handleStartElection(election._id)}
                                    disabled={election.start}
                                >
                                    {election.start ? "Started" : "Start"}
                                </button>
                            </td>

                            <td>
                                <button
                                    className={`action-button end-button`}
                                    onClick={() => handleEndElection(election._id)}
                                    disabled={election.end}
                                >
                                    {election.end ? "Ended" : "End"}
                                </button>
                            </td>

                            <td>
                                <span className={`status-indicator ${election.ongoing ? 'status-ongoing' : 'status-ended'}`}>
                                    {election.ongoing ? "Ongoing" : "Ended"}
                                </span>
                            </td>

                            <td className="winner-cell">
                                {election.winner ? (
                                    Array.isArray(election.winner) ?
                                        election.winner.join(", ") :
                                        election.winner
                                ) : "TBD"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PastElection;