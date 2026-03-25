import { useEffect, useState } from "react";
import api from "../api/axios";

function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState("");

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/leave/my-leaves");
      setLeaves(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leave history");
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="page-container">
      <div className="card">
        <h1>My Leave History</h1>

        {error && <p className="error-text">{error}</p>}

        {leaves.length === 0 ? (
          <p>No leave records found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Day Portion</th>
                <th>Days Requested</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.id}</td>
                  <td>{leave.leaveType}</td>
                  <td>{leave.startDate}</td>
                  <td>{leave.endDate}</td>
                  <td>{leave.dayPortion}</td>
                  <td>{leave.daysRequested}</td>
                  <td>{leave.status}</td>
                  <td>{leave.reason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MyLeaves;