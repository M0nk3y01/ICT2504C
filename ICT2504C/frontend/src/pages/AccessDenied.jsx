import { useNavigate } from "react-router-dom";

function AccessDenied() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  return (
    <div className="page-container">
      <div className="card auth-card">
        <h1>403 Access Denied</h1>
        <p>You do not have permission to access this page.</p>
        <p>Current role: <strong>{role || "Not logged in"}</strong></p>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default AccessDenied;