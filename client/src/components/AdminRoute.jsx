import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/kudos/login" replace />;
  }

  if (!user || user.isAdmin !== true) {
    return <Navigate to="/kudos" replace />;
  }

  return children;
}

export default AdminRoute;
