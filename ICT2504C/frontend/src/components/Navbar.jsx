import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.log("Logout error:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("mustChangePassword");

    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <h2>HRMS</h2>

      <div className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/apply-leave">Apply Leave</NavLink>
        <NavLink to="/my-leaves">My Leaves</NavLink>

        {(role === "manager" || role === "admin") && (
          <NavLink to="/approval">Approvals</NavLink>
        )}

        {role === "admin" && (
          <NavLink to="/create-employee">Create Employee</NavLink>
        )}

        {role === "admin" && (
          <NavLink to="/manage-users">Manage Users</NavLink>
        )}

        {role === "admin" && (
          <NavLink to="/audit-trail">Audit Trail</NavLink>
        )}

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;