// components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import SessionManager from "./SessionManager";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
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
