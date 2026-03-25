import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const mustChangePassword = localStorage.getItem("mustChangePassword") === "true";
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Force user to stay on dashboard until password is changed
  if (mustChangePassword && location.pathname !== "/dashboard") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;