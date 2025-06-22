import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./Home";
import Results from "./Results";
import AdminDashboard from "./Admin/AdminDashboard";
import UserDashboard from "./User/UserDashboard";
import AdminLogin from "./Admin/AdminLogin";
import AdminRegister from "./Admin/AdminRegister";
import UserLogin from "./User/UserLogin";
import UserRegister from "./User/UserRegister";
import ManageElection from "./Election/ManageElection";
import CreateElection from "./Election/CreateElection";
import PastElection from "./Election/PastElection";
import Approval from "./Election/Approval";
import Voting from "./User/Voting";
import Approved from "./User/Approved";
import Notifications from "./pages/Notifications";
import axios from 'axios';
import FAQPage from "./pages/FAQPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Layout from "./Layout";

const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp && Date.now() >= payload.exp * 1000;
    return !isExpired;
  } catch (error) {
    console.error("Invalid token:", error);
    return false;
  }
};


const getRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null; // Return `null` if no token is present

  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode payload
    console.log("Decoded role:", payload.role); // Debugging
    return payload.role || null; // Return role or `null` if not found
  } catch (error) {
    console.error("Error decoding token:", error);
    return null; // Return `null` if decoding fails
  }
};

const ProtectedRoute = ({ children, roles, redirectPath, requireApproval = false }) => {
  const auth = isAuthenticated();
  const role = getRole();
  const [isApproved, setIsApproved] = React.useState(null);
  const [loading, setLoading] = React.useState(requireApproval);

  React.useEffect(() => {
    const checkApproval = async () => {
      if (!requireApproval) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/auth/user-approve", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsApproved(response.data.approved);
      } catch (error) {
        console.error("Error checking approval status:", error);
        setIsApproved(false);
      } finally {
        setLoading(false);
      }
    };

    checkApproval();
  }, [requireApproval]);

  if (!auth) return <Navigate to={redirectPath} />;
  if (roles && !roles.includes(role)) return <Navigate to={redirectPath || "/"} />;
  if (requireApproval && loading) return <p>Checking approval status...</p>;
  if (requireApproval && isApproved === false) return <Navigate to="/proceed-to-vote" />;

  return children;
};



const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>

          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/user-register" element={<UserRegister />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route
            path="/create-election"
            element={
              <ProtectedRoute roles={["admin"]} redirectPath="/admin-login">
                <CreateElection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-election"
            element={
              <ProtectedRoute roles={["admin"]} redirectPath="/admin-login">
                <ManageElection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/past-election"
            element={
              <ProtectedRoute roles={["admin"]} redirectPath="/admin-login">
                <PastElection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approval"
            element={
              <ProtectedRoute roles={["admin"]} redirectPath="/admin-login">
                <Approval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voting"
            element={
              <ProtectedRoute roles={["user"]} redirectPath="/user-login" requireApproval={true}>
                <Voting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proceed-to-vote"
            element={
              <ProtectedRoute roles={["user"]} redirectPath="/user-login">
                <Approved />
              </ProtectedRoute>
            }
          />
          <Route
            path="/past-election"
            element={
              <ProtectedRoute roles={["admin"]} redirectPath="/admin-login">
                <PastElection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approval"
            element={
              <ProtectedRoute roles={["admin"]} redirectPath="/admin-login">
                <Approval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voting"
            element={
              <ProtectedRoute roles={["user"]} redirectPath="/user-login">
                <Voting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proceed-to-vote"
            element={
              <ProtectedRoute roles={["user"]} redirectPath="/user-login">
                <Approved />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;