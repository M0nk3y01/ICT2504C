import { useEffect, useState } from "react";
import api from "../api/axios";

function AuditTrail() {
  const role = localStorage.getItem("role");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      const res = await api.get("/audit");
      setLogs(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch audit logs");
    }
  };

  useEffect(() => {
    if (role === "admin") {
      fetchLogs();
    }
  }, [role]);

  if (role !== "admin") {
    return (
      <div className="page-container">
        <div className="card">
          <h1>Audit Trail</h1>
          <p className="error-text">Access denied. Only admin can view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <h1>Audit Trail</h1>

        {error && <p className="error-text">{error}</p>}

        {logs.length === 0 ? (
          <p>No audit logs found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Actor Role</th>
                <th>Action</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.userId ?? "-"}</td>
                  <td>{log.actorRole || "-"}</td>
                  <td>{log.action}</td>
                  <td>{log.details || "-"}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AuditTrail;