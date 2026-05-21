import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ADMIN_ROUTES } from "./admin/routes";
import AdminRoute from "./components/AdminRoute";
import AdminShell from "./components/AdminShell";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminAccessPage from "./pages/AdminAccessPage";
import AdminFeatureTogglesPage from "./pages/AdminFeatureTogglesPage";
import AdminAuditLogPage from "./pages/AdminAuditLogPage";
import AdminJobsPage from "./pages/AdminJobsPage";
import AdminLandingPage from "./pages/AdminLandingPage";
import AdminTagsPage from "./pages/AdminTagsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/kudos" replace />} />
        <Route path="/about" element={<Navigate to="/kudos/about" replace />} />
        <Route path="/login" element={<Navigate to="/kudos/login" replace />} />
        <Route path="/register" element={<Navigate to="/kudos/register" replace />} />
        <Route path="/dashboard" element={<Navigate to="/kudos/dashboard" replace />} />

        <Route path="/kudos" element={<LandingPage />} />
        <Route path="/kudos/about" element={<LandingPage />} />
        <Route path="/kudos/login" element={<LoginPage />} />
        <Route path="/kudos/register" element={<RegisterPage />} />
        <Route
          path={ADMIN_ROUTES.root}
          element={
            <AdminRoute>
              <AdminShell />
            </AdminRoute>
          }
        >
          <Route index element={<AdminLandingPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="admin-access" element={<AdminAccessPage />} />
          <Route path="tags" element={<AdminTagsPage />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="feature-toggles" element={<AdminFeatureTogglesPage />} />
          <Route path="audit-log" element={<AdminAuditLogPage />} />
        </Route>
        <Route
          path="/kudos/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/kudos/admin/*" element={<Navigate to={ADMIN_ROUTES.root} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
