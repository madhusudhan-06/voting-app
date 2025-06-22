import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="user-dashboard">
      <h1 className="user-title">User Dashboard</h1>

      <div className="user-forms">
        <form className="user-form" onSubmit={(e) => {
          e.preventDefault();
          navigate("/user-login");
        }}>
          <button className="user-button login" type="submit">Login</button>
        </form>

        <form className="user-form" onSubmit={(e) => {
          e.preventDefault();
          navigate("/user-register");
        }}>
          <button className="user-button register" type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default UserDashboard;