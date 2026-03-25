import { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {
  const role = localStorage.getItem("role");
  const mustChangePassword = localStorage.getItem("mustChangePassword") === "true";

  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    department: "",
    phone: "",
  });

  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const profileRes = await api.get("/auth/me");
      setProfile(profileRes.data);
      setProfileForm({
        name: profileRes.data.name || "",
        department: profileRes.data.department || "",
        phone: profileRes.data.phone || "",
      });

      const balanceRes = await api.get("/leave/my-balance");
      setBalance(balanceRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setError("");

    try {
      const res = await api.post("/auth/change-password", passwordForm);
      setPasswordMessage(res.data.message);
      localStorage.setItem("mustChangePassword", "false");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    }
  };

  const submitProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage("");
    setError("");

    try {
      const res = await api.put("/auth/me", profileForm);
      setProfileMessage(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="page-container">
      <h1>Dashboard</h1>

      {mustChangePassword && (
        <div className="warning-box">
          First-time login detected. Please change your password.
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {profile && (
        <div className="grid-2">
          <div className="card">
            <h2>My Profile</h2>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {role}</p>
            <p><strong>Department:</strong> {profile.department || "-"}</p>
            <p><strong>Phone:</strong> {profile.phone || "-"}</p>
          </div>

          <div className="card">
            <h2>Leave Balance</h2>
            {balance ? (
              <>
                <p><strong>Annual Quota:</strong> {balance.annualQuota}</p>
                <p><strong>Annual Used:</strong> {balance.annualUsed}</p>
                <p><strong>Annual Remaining:</strong> {balance.annualRemaining}</p>
                <p><strong>Sick Used:</strong> {balance.sickUsed}</p>
              </>
            ) : (
              <p>Loading balance...</p>
            )}
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <h2>Update Profile</h2>
          <form onSubmit={submitProfileUpdate} className="form">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={profileForm.name}
              onChange={handleProfileChange}
            />

            <input
              type="text"
              name="department"
              placeholder="Department"
              value={profileForm.department}
              onChange={handleProfileChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={profileForm.phone}
              onChange={handleProfileChange}
            />

            <button type="submit">Update Profile</button>
          </form>

          {profileMessage && <p className="success-text">{profileMessage}</p>}
        </div>

        <div className="card">
          <h2>Change Password</h2>
          <form onSubmit={submitPasswordChange} className="form">
            <input
              type="password"
              name="oldPassword"
              placeholder="Old Password"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              required
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
            />

            <button type="submit">Change Password</button>
          </form>

          {passwordMessage && <p className="success-text">{passwordMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;