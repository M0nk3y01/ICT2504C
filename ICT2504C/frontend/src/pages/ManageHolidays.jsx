import { useState, useEffect } from "react";
import api from "../api/axios";

function ManageHolidays() {
  const role = localStorage.getItem("role");

  const [holidays, setHolidays] = useState([]);
  const [form, setForm] = useState({ name: "", holidayDate: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchHolidays = async () => {
    try {
      const res = await api.get("/leave/holidays");
      setHolidays(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch holidays");
    }
  };

  useEffect(() => {
    if (role === "admin") {
      fetchHolidays();
    }
  }, [role]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/leave/holidays", form);
      setMessage(`Holiday "${form.name}" added successfully.`);
      setForm({ name: "", holidayDate: "" });
      fetchHolidays();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to add holiday");
    }
  };

  if (role !== "admin") {
    return (
      <div className="page-container">
        <div className="card">
          <h1>Manage Public Holidays</h1>
          <p className="error-text">Access denied. Only admin can manage holidays.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="grid-2">
        <div className="card">
          <h2>Add Public Holiday</h2>
          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              name="name"
              placeholder="Holiday Name (e.g. National Day)"
              value={form.name}
              onChange={handleChange}
              required
            />
            <label>Date</label>
            <input
              type="date"
              name="holidayDate"
              value={form.holidayDate}
              onChange={handleChange}
              required
            />
            <button type="submit">Add Holiday</button>
          </form>

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="card">
          <h2>Public Holidays</h2>
          {holidays.length === 0 ? (
            <p>No holidays configured.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h) => (
                  <tr key={h.id}>
                    <td>{h.name}</td>
                    <td>{h.holidayDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageHolidays;