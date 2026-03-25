import { useState } from "react";
import api from "../api/axios";

function CreateEmployee() {
  const role = localStorage.getItem("role");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    managerId: "",
    department: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createdUser, setCreatedUser] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setCreatedUser(null);

    try {
      const payload = {
        ...form,
        managerId: form.managerId ? Number(form.managerId) : null,
      };

      const res = await api.post("/auth/create", payload);

      setMessage("Employee created successfully");
      setCreatedUser(res.data);

      setForm({
        name: "",
        email: "",
        password: "",
        role: "employee",
        managerId: "",
        department: "",
        phone: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to create employee");
    }
  };

  if (role !== "admin") {
    return (
      <div className="page-container">
        <div className="card">
          <h1>Create Employee</h1>
          <p className="error-text">Access denied. Only admin can create employee accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <h1>Create Employee</h1>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Work Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Temporary Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label>Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          <input
            type="number"
            name="managerId"
            placeholder="Manager ID (optional)"
            value={form.managerId}
            onChange={handleChange}
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />

          <button type="submit">Create Employee</button>
        </form>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        {createdUser && (
          <div className="result-box">
            <h3>Created User</h3>
            <p><strong>ID:</strong> {createdUser.id}</p>
            <p><strong>Name:</strong> {createdUser.name}</p>
            <p><strong>Email:</strong> {createdUser.email}</p>
            <p><strong>Role:</strong> {createdUser.role}</p>
            <p><strong>Must Change Password:</strong> {String(createdUser.mustChangePassword)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateEmployee;