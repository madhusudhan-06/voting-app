import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to VoteEase</h1>
      <div className="home-buttons">
        <Link to="/admin" className="link-button">
          <button className="home-button admin">
            <span className="button-icon">👨‍💼</span>
            Admin Portal
          </button>
        </Link>
        <Link to="/user" className="link-button">
          <button className="home-button user">
            <span className="button-icon">🗳️</span>
            Voter Dashboard
          </button>
        </Link>
        <Link to="/results" className="link-button">
          <button className="home-button results">
            <span className="button-icon">📊</span>
            View Results
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;