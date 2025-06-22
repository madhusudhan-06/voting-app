import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ethers } from "ethers";
import VotingContractABI from "../artifacts/Voting.json";
import "./Voting.css";


function Voting() {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [message, setMessage] = useState("");
    const [contractAddress, setContractAddress] = useState("");
    const [electionId, setElectionId] = useState("");
    const [userWalletAddress, setUserWalletAddress] = useState("");
    const [voteButton, setVoteButton] = useState(true);
    const [livenessPrompt, setLivenessPrompt] = useState("");
    const [webcams, setWebcams] = useState([]);
    const [selectedWebcam, setSelectedWebcam] = useState("");
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [faceImageURL, setfaceImageURL] = useState("");
    const [candidateLogos, setCandidateLogos] = useState([]);

    const prompts = ["Please blink", "Turn your head slightly", "Smile gently"];

    useEffect(() => {
        if (capturedImage) {
            console.log("Captured Image Updated:", capturedImage.substring(0, 50) + "...");
        }
    }, [capturedImage]);


    useEffect(() => {

        const storedUserEmail = localStorage.getItem("userEmail");

        if (storedUserEmail) {
            fetchUserWalletAddress(storedUserEmail);
            fetchUserFaceURL(storedUserEmail);
        } else {
            console.error("User details not found in localStorage.");
        }
        fetchOngoingElectionId(); // First fetch the election ID
    }, []); // Runs once when the component mounts

    useEffect(() => {
        if (electionId) {
            fetchContractAddress(); // Fetch contract address only after electionId is set
        }
    }, [electionId]); // Runs whenever electionId changes

    useEffect(() => {
        if (contractAddress) {
            fetchCandidates(); // Fetch candidates only after contractAddress is set
        }
    }, [contractAddress]); // Runs whenever contractAddress changes

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

    const fetchUserWalletAddress = async (email) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/auth/get-wallet-address-by-email/${email}`);
            if (response.data.walletAddress) {
                setUserWalletAddress(response.data.walletAddress);
            } else {
                console.warn("No wallet address found for this user.");
            }
        } catch (error) {
            console.error("Error fetching wallet address:", error);
        }
    };

    const fetchUserFaceURL = async (email) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/auth/get-user-face-publicid/${email}`);
            if (response.data.publicId) {
                console.log("Fetched Face Image URL:", response.data.publicId);
                setfaceImageURL(response.data.publicId);
            } else {
                console.warn("No faceImageURL found for this user.");
            }
        } catch (error) {
            console.error("Error fetching faceImageURL:", error);
        }
    };


    const fetchContractAddress = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/elections/${electionId}/get-contract-address`);
            setContractAddress(response.data.contractAddress);
        } catch (error) {
            console.error("Error fetching contract address:", error);
        }
    };

    const fetchCandidates = async () => {
        if (!contractAddress) return;
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const votingContract = new ethers.Contract(contractAddress, VotingContractABI.abi, provider);
            const candidatesList = await votingContract.getCandidates();

            const formattedCandidates = candidatesList.map(candidate => ({
                name: candidate.name,
                votes: candidate.votes.toNumber(),
            }));

            setCandidates(formattedCandidates);
        } catch (error) {
            console.error("Failed to fetch candidates", error);
        }
    };

    const fetchOngoingElectionId = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/elections/get-ongoing-election");
            setElectionId(response.data._id);

            // Extract only logo URLs from candidates and set them
            const logoUrls = response.data.candidates.map(candidate => candidate.logoUrl);
            setCandidateLogos(logoUrls);

        } catch (error) {
            console.error("Error fetching ongoing election:", error);
        }
    };

    const checkElectionStatus = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/elections/${electionId}/current-status`);
            const { start, end } = response.data;

            return start === true && end === false; // Return true if voting is active
        } catch (error) {
            console.error("Error fetching election status:", error);
            return false; // Assume voting is not active in case of an error
        }
    };

    const startWebcam = async () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); // Stop previous stream
        }

        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: selectedWebcam ? { exact: selectedWebcam } : undefined },
            });
            videoRef.current.srcObject = newStream;
            setStream(newStream);
        } catch (error) {
            console.error("Error accessing webcam:", error);
        }
    };

    const prepareForLivenessCheck = async () => {
        const prompt = prompts[Math.floor(Math.random() * prompts.length)];
        setLivenessPrompt(prompt);
        setMessage(prompt);

        await new Promise((res) => setTimeout(res, 3000));
        await captureImage(prompt);
    };

    const captureImage = async (promptUsed) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (!canvas || !video) {
            console.error("Canvas or Video element not found.");
            return;
        }

        // Ensure the canvas size matches the video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas image to Base64
        const base64Image = canvas.toDataURL("image/png");

        console.log("Captured Image (Base64):", base64Image.substring(0, 50) + "...");

        // Ensure React state updates
        setCapturedImage(base64Image);
        console.log("State after update:", capturedImage);
        try {
            const response = await axios.post("http://127.0.0.1:5001/compare-faces", {
                image: base64Image,
                prompt: promptUsed,
                detectOnly: false,
            });

            const data = response.data;
            console.log("Liveness API response:", data); // Debug the response

            if (data.faceDetected && data.success) {
                console.log("yes both are true")
                setMessage("Liveness confirmed. You may now proceed.");
                // await validateFacePresence(promptUsed);
            } else {
                setMessage(data.message || " Liveness check failed. Please try again.");
                setCapturedImage(null); // Reset image if liveness check failed
            }
        } catch (error) {
            console.error("Liveness check error:", error); // Debug error
            setMessage(" Liveness check failed. Please try again due to some error");
            setCapturedImage(null);
        }
    };

    const CheckFacesMatch = async () => {
        try {
            console.log("Sending images for verification...");
            console.log("Captured Image (Base64):", capturedImage.substring(0, 50) + "...");
            console.log("Face Image URL:", faceImageURL);

            const response = await axios.post("http://localhost:5000/api/face/verify-face", {
                new_img: capturedImage, // base64
                public_id: faceImageURL, // publicid
            });

            if (response.data.verified) {
                setMessage("Face verification successful. Proceeding to vote...");
                setVoteButton(false);
                return true;
            } else {
                setMessage(response.data?.message || "Face verification failed. Please try again.");
                return false;
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage(error.response?.data?.message || "An error occurred. Please try again.");
            return false;
        }
    };

    const handleVote = async (e) => {
        e.preventDefault();


        const faceMatched = await CheckFacesMatch();
        if (!faceMatched) {
            return; // Stop if faces do not match
        }

        if (!contractAddress || selectedCandidate === null) {
            setMessage("Please select a candidate to vote!");
            return;
        }

        // Check if the election has started and not ended
        const isVotingActive = await checkElectionStatus();
        if (!isVotingActive) {
            setMessage("Voting has not started yet or has already ended.");
            return;
        }

        try {
            // Request the currently connected wallet
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const detectedWalletAddress = accounts[0];

            if (!userWalletAddress) {
                setMessage("Error: No wallet address found for the user.");
                return;
            }

            // Compare detected wallet address with user's registered wallet address
            if (detectedWalletAddress.toLowerCase() !== userWalletAddress.toLowerCase()) {
                setMessage("Please switch to the user's registered wallet.");
                return;
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const votingContract = new ethers.Contract(contractAddress, VotingContractABI.abi, signer);

            const tx = await votingContract.vote(selectedCandidate);
            setMessage("Transaction sent. Waiting for confirmation...");

            await tx.wait();
            setMessage(`Vote cast successfully for ${candidates[selectedCandidate].name}!`);
        } catch (error) {
            console.error("Transaction failed", error);
            setMessage("Transaction failed. It seems you have already voted");
        }
    };

    return (
        <div className="voting-container">
            <h1 className="voting-title">Vote For Your Candidate</h1>

            <form className="voting-form" onSubmit={handleVote}>
                <h2>Select a Candidate:</h2>
                <div className="candidates-list">
                    {candidates.length > 0 ? (
                        candidates.map((candidate, index) => (
                            <label key={index} className="candidate-option">
                                <input
                                    type="radio"
                                    name="candidate"
                                    value={index}
                                    onChange={() => setSelectedCandidate(index)}
                                />
                                <img
                                    src={candidateLogos[index]}
                                    alt={`${candidate.name} logo`}
                                    className="candidate-logo"
                                />
                                {candidate.name}
                            </label>
                        ))
                    ) : (
                        <p>Loading candidates...</p>
                    )}
                </div>



                <div className="webcam-section">
                    <select
                        className="webcam-select"
                        value={selectedWebcam}
                        onChange={(e) => setSelectedWebcam(e.target.value)}
                    >
                        {webcams.map((webcam) => (
                            <option key={webcam.deviceId} value={webcam.deviceId}>
                                {webcam.label || `Camera ${webcam.deviceId}`}
                            </option>
                        ))}
                    </select>

                    <button type="button" className="webcam-button" onClick={startWebcam}>
                        Start Webcam
                    </button>

                    <div className="video-container">
                        <video ref={videoRef} autoPlay width="320" height="240" />
                    </div>

                    <canvas
                        ref={canvasRef}
                        width="320"
                        height="240"
                        style={{ display: "none" }}
                    ></canvas>

                    <button
                        type="button"
                        className="webcam-button verify-button"
                        onClick={prepareForLivenessCheck}
                    >
                        Capture Image
                    </button>

                    {capturedImage && (
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="captured-image"
                        />
                    )}
                </div>

                <button type="submit" className="vote-button">
                    VOTE
                </button>
            </form>

            {message && <p className="message">{message}</p>}

            <hr className="divider" />
        </div>

    );
}

export default Voting;
