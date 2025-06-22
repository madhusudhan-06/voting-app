import './LegalPages.css';

const TermsAndConditions = () => {
  return (
    <div className="legal-container">
      <h1>Terms & Conditions</h1>
      <p className="last-updated">Effective: May 2025</p>

      <div className="legal-section">
        <h2>1. Eligibility</h2>
        <ul>
          <li>You must be a registered voter approved by election administrators.</li>
          <li>MetaMask wallet and email verification are mandatory.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>2. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Attempt to spoof facial recognition using photos/videos/deepfakes</li>
          <li>Register multiple wallet addresses for duplicate voting</li>
          <li>Reverse-engineer smart contracts (verified at <code>snowtrace.io</code>)</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>3. Blockchain Disclaimer</h2>
        <ul>
          <li>VoteEase is not liable for Avalanche network outages or gas fee fluctuations.</li>
          <li>Wallet private keys are your sole responsibility.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>4. Election Integrity</h2>
        <ul>
          <li>All votes are final and immutable once recorded on-chain.</li>
          <li>Admin privileges (e.g., ending elections) are time-locked in smart contracts.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>5. Limitation of Liability</h2>
        <p>VoteEase shall not be liable for:</p>
        <ul>
          <li>Facial recognition false positives/negatives</li>
          <li>Loss of funds due to wallet misuse</li>
          <li>Force majeure events affecting blockchain operations</li>
        </ul>
      </div>
    </div>
  );
};

export default TermsAndConditions;