import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ArrowLeft } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "Reset link sent to your email.");
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
        <p>Enter your work email and we'll send you a reset link.</p>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="email"
            placeholder="Work Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;