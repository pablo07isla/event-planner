// components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import SessionManager from "./SessionManager";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <SessionManager />
      {children}
    </>
  );
};

export default ProtectedRoute;
