import { useState } from "react";
import api from "../api/axios";

function ApplyLeave() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    leaveType: "annual",
    startDate: "",
    endDate: "",
    reason: "",
    dayPortion: "full_day",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [leaveResult, setLeaveResult] = useState(null);

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
    setLeaveResult(null);

    // Frontend validation: no past dates
    if (form.startDate < today) {
      setError("Start date cannot be in the past.");
      return;
    }

    // Frontend validation: end date cannot be before start date
    if (form.endDate < form.startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    try {
      const res = await api.post("/leave/apply", form);
      setMessage("Leave applied successfully");
      setLeaveResult(res.data);

      setForm({
        leaveType: "annual",
        startDate: "",
        endDate: "",
        reason: "",
        dayPortion: "full_day",
      });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to apply leave");
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h1>Apply Leave</h1>

        <form onSubmit={handleSubmit} className="form">
          <label>Leave Type</label>
          <select
            name="leaveType"
            value={form.leaveType}
            onChange={handleChange}
          >
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
          </select>

          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            min={today}
            onChange={handleChange}
            required
          />

          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            min={form.startDate || today}
            onChange={handleChange}
            required
          />

          <label>Day Portion</label>
          <select
            name="dayPortion"
            value={form.dayPortion}
            onChange={handleChange}
          >
            <option value="full_day">Full Day</option>
            <option value="am">AM Half-Day</option>
            <option value="pm">PM Half-Day</option>
          </select>

          <label>Reason</label>
          <textarea
            name="reason"
            placeholder="Reason"
            value={form.reason}
            onChange={handleChange}
            rows="4"
          />

          <button type="submit">Submit Leave</button>
        </form>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        {leaveResult && (
          <div className="result-box">
            <h3>Submitted Leave</h3>
            <p><strong>Status:</strong> {leaveResult.status}</p>
            <p><strong>Type:</strong> {leaveResult.leaveType}</p>
            <p><strong>Start:</strong> {leaveResult.startDate}</p>
            <p><strong>End:</strong> {leaveResult.endDate}</p>
            <p><strong>Days Requested:</strong> {leaveResult.daysRequested}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplyLeave;