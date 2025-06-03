// components/ProtectedRoute.js

import SessionManager from "./SessionManager";
import React from "react";
import { Navigate } from "react-router-dom";

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
