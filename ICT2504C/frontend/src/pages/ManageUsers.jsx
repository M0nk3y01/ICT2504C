import { useEffect, useState } from "react";
import api from "../api/axios";

function ManageUsers() {
  const role = localStorage.getItem("role");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/profiles");
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    }
  };

  useEffect(() => {
    if (role === "admin") {
      fetchUsers();
    }
  }, [role]);

  const handleUnlock = async (id) => {
    setMessage("");
    setError("");

    try {
      const res = await api.put(`/auth/unlock/${id}`);
      setMessage(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to unlock user");
    }
  };

  if (role !== "admin") {
    return (
      <div className="page-container">
        <div className="card">
          <h1>Manage Users</h1>
          <p className="error-text">Access denied. Only admin can view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <h1>Manage Users</h1>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Locked</th>
                <th>Failed Attempts</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.department || "-"}</td>
                  <td>{user.isLocked ? "Yes" : "No"}</td>
                  <td>{user.failedLoginAttempts}</td>
                  <td>
                    {user.isLocked ? (
                      <button onClick={() => handleUnlock(user.id)}>
                        Unlock
                      </button>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageUsers;