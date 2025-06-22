import './AboutContact.css';
import teamPhoto from '../assests/teamPhoto.jpg'

const AboutUs = () => {
  return (
    <div className="about-contact-container">
      <section className="hero-section">
        <h1>Revolutionizing Democracy with Blockchain & AI</h1>
        <p>VoteEase is a secure online voting platform developed at JSS STU, Mysuru</p>
      </section>

      <div className="about-us-grid">
        <section className="card team-card">
          <h2>The Team</h2>
          <img src={teamPhoto} alt="VoteEase Development Team" className="team-photo" />
          <p>
            Computer Science students at JSS STU under the guidance of 
            <strong> Prof. Bindiya A R</strong>. Published in IRASET (Vol. 13, Issue V).
          </p>
        </section>

        {/* Mission Section */}
        <section className="card mission-card">
          <h2>Our Mission</h2>
          <div className="icon">🌐</div>
          <p>
            To eliminate electoral fraud and increase participation through 
            decentralized technology and biometric verification, making voting 
            accessible anywhere, anytime.
          </p>
        </section>

        {/* Technology Stack */}
        <section className="card tech-card">
          <h2>Core Technology</h2>
          <ul>
            <li><strong>Avalanche Blockchain</strong> - For tamper-proof voting records</li>
            <li><strong>DeepFace + MediaPipe</strong> - Anti-spoofing facial recognition</li>
            <li><strong>React.js/Node.js</strong> - Intuitive user experience</li>
          </ul>
        </section>

        {/* Milestones */}
        <section className="card milestones-card">
          <h2>Milestones</h2>
          <div className="timeline">
            {/* Timeline items remain the same */}
            <div className="timeline-item">
              <h3> Oct 2024</h3>
              <p>Conceptualized during BE Final Year Project</p>
            </div>
            <div className="timeline-item">
              <h3>Jan 2025</h3>
              <p>First prototype with minimal things</p>
            </div>
            <div className="timeline-item">
              <h3>May 2025</h3>
              <p>Standard working published research paper</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;