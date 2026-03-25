import { useEffect, useState } from "react";
import api from "../api/axios";

function ManagerApproval() {
  const role = localStorage.getItem("role");
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchPendingLeaves = async () => {
    try {
      const res = await api.get("/leave/pending");
      setPendingLeaves(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pending leave");
    }
  };

  useEffect(() => {
    if (role === "manager" || role === "admin") {
      fetchPendingLeaves();
    }
  }, [role]);

  const handleApprove = async (id) => {
    setMessage("");
    setError("");

    try {
      const res = await api.put(`/leave/${id}/approve`);
      setMessage(res.data.message);
      fetchPendingLeaves();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve leave");
    }
  };

  const handleReject = async (id) => {
    setMessage("");
    setError("");

    try {
      const res = await api.put(`/leave/${id}/reject`);
      setMessage(res.data.message);
      fetchPendingLeaves();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject leave");
    }
  };

  if (role !== "manager" && role !== "admin") {
    return (
      <div className="page-container">
        <div className="card">
          <h1>Approvals</h1>
          <p className="error-text">Access denied. Only managers or admins can view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <h1>Pending Leave Approvals</h1>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        {pendingLeaves.length === 0 ? (
          <p>No pending leave requests.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Leave ID</th>
                <th>Employee</th>
                <th>Email</th>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Day Portion</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeaves.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.id}</td>
                  <td>{leave.User?.name}</td>
                  <td>{leave.User?.email}</td>
                  <td>{leave.leaveType}</td>
                  <td>{leave.startDate}</td>
                  <td>{leave.endDate}</td>
                  <td>{leave.dayPortion}</td>
                  <td>{leave.daysRequested}</td>
                  <td>{leave.reason || "-"}</td>
                  <td>{leave.status}</td>
                  <td className="button-group">
                    <button onClick={() => handleApprove(leave.id)}>Approve</button>
                    <button className="danger-btn" onClick={() => handleReject(leave.id)}>
                      Reject
                    </button>
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

export default ManagerApproval;