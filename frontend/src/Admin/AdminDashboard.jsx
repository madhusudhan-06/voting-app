import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="admin-forms">
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); navigate("/admin-login"); }}>
          <button className="admin-button login" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
