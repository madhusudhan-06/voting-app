import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Section 1: Quick Links */}
        <div className="footer-section">
          <h3>VoteEase</h3>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        {/* Section 2: Legal */}
        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Section 3: Technology */}
        {/* <div className="footer-section">
          <h3>Powered By</h3>
          <div className="tech-stack">
            <img src="/avalanche-logo.png" alt="Avalanche Blockchain" title="Avalanche" />
            <img src="/metamask-logo.png" alt="MetaMask" title="MetaMask" />
            <img src="/opencv-logo.png" alt="OpenCV" title="OpenCV" />
          </div>
        </div> */}

        {/* Section 4: Social & Contact */}
        <div className="footer-section">
          <h3>Connect With Us</h3>
          <div className="social-icons">
            {/* <a href="https://twitter.com/voteease" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="https://github.com/voteease" aria-label="GitHub"><i className="fab fa-github"></i></a> */}
            <a href="mailto:voteeaseofficiaal@gmail.com" aria-label="Email">📧</a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="copyright">
        <p>&copy; {new Date().getFullYear()} VoteEase. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;