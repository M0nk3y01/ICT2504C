import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setExpired(false);

    try {
      const res = await api.post("/auth/reset-password", { token, newPassword });
      setMessage(res.data.message || "Password reset successfully.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (err.response?.status === 410 || msg.toLowerCase().includes("expir")) {
        setError("This reset link has expired (valid for 1 minute only).");
        setExpired(true);
      } else {
        setError(msg || "Failed to reset password. Link may have expired.");
      }
    }
  };

  if (!token) {
    return (
      <div className="page-container">
        <div className="card auth-card">
          <h1>Invalid Link</h1>
          <p className="error-text">This reset link is invalid or missing a token.</p>
          <button onClick={() => navigate("/forgot-password")}>Request New Link</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card auth-card">
        <h1>Reset Password</h1>
        <p>Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <button type="submit" disabled={!!message}>
            Reset Password
          </button>
        </form>

        {message && <p className="success-text">{message} Redirecting to login...</p>}
        {error && <p className="error-text">{error}</p>}
        {expired && (
          <button onClick={() => navigate("/forgot-password")}>
            Request New Link
          </button>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;