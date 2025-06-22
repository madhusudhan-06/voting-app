import { useState } from "react";
import axios from "axios";

const AdminRegister = () => {
  const [form, setForm] = useState({ name: "", walletAddress: "", email: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/admin-register", form);
      setMessage(response.data.message || "Registration successful.");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Something went wrong.";
      setMessage(errorMsg);  // Display error message
    }
  };

  return (
    <div>
      <h2>Admin Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="password"
          placeholder="password"
          value={form.password}
          onChange={handleChange}
        />
       
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default AdminRegister;