import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ArrowLeft } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetLink, setResetLink] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setResetLink("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "Reset token generated.");

      if (res.data.resetToken) {
        setResetLink(
          `${window.location.origin}/reset-password?token=${res.data.resetToken}`
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link.");
    }
  };

  return (
    <div className="page-container">
      <div className="card auth-card">
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0",
            marginBottom: "12px",
            color: "inherit",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
          }}
        >
          <ArrowLeft size={18} />
          Back to Login
        </button>

        <h1>Forgot Password</h1>
        <p>Enter your work email to generate a password reset link.</p>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="email"
            placeholder="Work Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Generate Reset Link</button>
        </form>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        {resetLink && (
          <div className="result-box">
            <p><strong>Reset Link (demo only):</strong></p>
            <p style={{ fontSize: "13px", wordBreak: "break-all", marginBottom: "10px" }}>
              {resetLink}
            </p>
            <button onClick={() => navigate(`/reset-password?token=${new URL(resetLink).searchParams.get("token")}`)}>
              Go to Reset Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;