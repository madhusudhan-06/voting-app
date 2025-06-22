pragma solidity 0.8.27;
// SPDX-License-Identifier: MIT

contract Voting {
    struct Candidate {
        string name;
        uint256 votes;
    }

    mapping(address => bool) public hasVoted;
    Candidate[] public candidates;
    address public admin;
    bool public votingEnded;
    string public electionId;

    uint256 public highestVoteCount; // Tracks the highest number of votes
    uint256[] public leadingCandidates; // Stores indices of leading candidates in case of a tie

    event CandidateAdded(string name, uint256 votes, uint256 timestamp);
    event VoteCasted(address indexed voter, string candidateName, uint256 timestamp);
    event VotingEnded(string[] winnerNames, uint256 votes, uint256 timestamp);

    constructor(string memory _electionId, string[] memory candidateNames, uint256[] memory voteCounts) {
        require(candidateNames.length == voteCounts.length, "Mismatched input arrays");

        admin = msg.sender;
        electionId = _electionId;

        for (uint256 i = 0; i < candidateNames.length; i++) {
            require(bytes(candidateNames[i]).length > 0, "Candidate name cannot be empty");
            candidates.push(Candidate(candidateNames[i], voteCounts[i]));

            if (voteCounts[i] > highestVoteCount) {
                highestVoteCount = voteCounts[i];
                leadingCandidates = [i]; // Reset and add new leading candidate
            } else if (voteCounts[i] == highestVoteCount) {
                leadingCandidates.push(i); // Add candidate to tie list
            }

            emit CandidateAdded(candidateNames[i], voteCounts[i], block.timestamp);
        }
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can perform this action");
        _;
    }

    modifier onlyWhenVotingActive() {
        require(!votingEnded, "Voting has already ended");
        _;
    }

    modifier onlyWhenVotingEnded() {
        require(votingEnded, "Voting is still ongoing");
        _;
    }

    function getElectionId() external view returns (string memory) {
        return electionId;
    }

    function getAdmin() external view returns (address) {
        return admin;
    }

    function addCandidate(string memory name) external onlyAdmin onlyWhenVotingActive {
        require(bytes(name).length > 0, "Candidate name cannot be empty");
        candidates.push(Candidate(name, 0));
        emit CandidateAdded(name, 0, block.timestamp);
    }

    function vote(uint256 candidateIndex) external onlyWhenVotingActive {
        require(!hasVoted[msg.sender], "You have already voted!");
        require(candidateIndex < candidates.length, "Invalid candidate index!");

        hasVoted[msg.sender] = true;

        Candidate storage candidate = candidates[candidateIndex];
        candidate.votes += 1;

        if (candidate.votes > highestVoteCount) {
            highestVoteCount = candidate.votes;
            leadingCandidates = [candidateIndex]; // Reset and set new leader
        } else if (candidate.votes == highestVoteCount) {
            leadingCandidates.push(candidateIndex); // Add to tie
        }

        emit VoteCasted(msg.sender, candidate.name, block.timestamp);
    }

    function endVoting() external onlyAdmin onlyWhenVotingActive {
        votingEnded = true;

        string[] memory winnerNames = new string[](leadingCandidates.length);
        for (uint256 i = 0; i < leadingCandidates.length; i++) {
            winnerNames[i] = candidates[leadingCandidates[i]].name;
        }

        emit VotingEnded(winnerNames, highestVoteCount, block.timestamp);
    }

    function getWinners() external view onlyWhenVotingEnded returns (string[] memory) {
        string[] memory winnerNames = new string[](leadingCandidates.length);
        for (uint256 i = 0; i < leadingCandidates.length; i++) {
            winnerNames[i] = candidates[leadingCandidates[i]].name;
        }
        return winnerNames;
    }

    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }
}
