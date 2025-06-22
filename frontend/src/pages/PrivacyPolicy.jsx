import './LegalPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-container">
      <h1>Privacy Policy</h1>
      <p className="last-updated">Last Updated: May 2025</p>

      <div className="legal-section">
        <h2>1. Data We Collect</h2>
        <ul>
          <li><strong>Biometric Data:</strong> Facial images (processed via DeepFace/Facenet) for identity verification during registration and voting.</li>
          <li><strong>Blockchain Data:</strong> Wallet addresses, transaction hashes, and vote choices (anonymized on Avalanche blockchain).</li>
          <li><strong>Account Information:</strong> Email address, name (for admin approval).</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>2. How We Use Data</h2>
        <p>Your data is used strictly for:</p>
        <ul>
          <li>Verifying voter identity through facial recognition</li>
          <li>Recording votes immutably on Avalanche blockchain</li>
          <li>Sending OTPs and election notifications</li>
          <li>Complying with election audit requirements</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>3. Data Storage & Security</h2>
        <ul>
          <li><strong>Facial Data:</strong> Encrypted and stored in Cloudinary for 30 days post-election, then permanently deleted.</li>
          <li><strong>Blockchain Data:</strong> Immutably stored on Avalanche; wallet addresses are never linked to personal identity.</li>
          <li><strong>Technical Safeguards:</strong> AES-256 encryption, JWT tokenization, and bcrypt hashing for passwords.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>4. Third-Party Services</h2>
        <p>We integrate with:</p>
        <ul>
          <li><strong>MetaMask:</strong> For wallet authentication (subject to their <a href="https://metamask.io/terms.html" target="_blank" rel="noopener noreferrer">Terms</a>)</li>
          <li><strong>Google Translate API:</strong> For multilingual support</li>
          <li><strong>Avalanche Network:</strong> For decentralized vote storage</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>5. Your Rights</h2>
        <p>You may request:</p>
        <ul>
          <li>Deletion of facial data (except where required for election audits)</li>
          <li>Access to your blockchain voting records via transaction hashes</li>
          <li>Correction of account information</li>
        </ul>
        <p>Contact: <a href="mailto:voteeaseofficial@gmail.com">voteeaseofficial@gmail.com</a></p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;