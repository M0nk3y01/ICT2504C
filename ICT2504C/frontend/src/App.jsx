import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ApplyLeave from "./pages/ApplyLeave";
import MyLeaves from "./pages/MyLeaves";
import ManagerApproval from "./pages/ManagerApproval";
import CreateEmployee from "./pages/CreateEmployee";
import ManageUsers from "./pages/ManageUsers";
import ManageHolidays from "./pages/ManageHolidays";
import AccessDenied from "./pages/AccessDenied";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuditTrail from "./pages/AuditTrail";

import "./App.css";

function AppLayout() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  return (
    <>
      {token && location.pathname !== "/" && <Navbar />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/apply-leave"
          element={
            <ProtectedRoute>
              <ApplyLeave />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-leaves"
          element={
            <ProtectedRoute>
              <MyLeaves />
            </ProtectedRoute>
          }
        />

        <Route
          path="/approval"
          element={
            <RoleRoute allowedRoles={["manager", "admin"]}>
              <ManagerApproval />
            </RoleRoute>
          }
        />

        <Route
          path="/create-employee"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <CreateEmployee />
            </RoleRoute>
          }
        />

        <Route
          path="/manage-users"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <ManageUsers />
            </RoleRoute>
          }
        />

        <Route
          path="/manage-holidays"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <ManageHolidays />
            </RoleRoute>
          }
        />
        
        <Route
          path="/audit-trail"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AuditTrail />
            </RoleRoute>
          }
        />

        <Route
          path="/access-denied"
          element={
            <ProtectedRoute>
              <AccessDenied />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;